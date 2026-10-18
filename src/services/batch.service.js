const pool = require("../config/db");
const { logAction } = require("./audit.service");

async function createBatch({
  fileName,
  totalRows,
  validRows,
  errors,
  performedBy,
}) {
  // Caller ke arrays ko mutate na karo
  validRows = [...validRows];
  errors = [...errors];

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. DB me pehle se maujood transaction_id check karo
    const ids = validRows.map((row) => row.transaction_id);

    if (ids.length > 0) {
      const result = await client.query(
        `SELECT transaction_id
         FROM transactions
         WHERE transaction_id = ANY($1::text[])`,
        [ids],
      );

      const existingIds = new Set(result.rows.map((row) => row.transaction_id));
      const remainingRows = [];

      validRows.forEach((row) => {
        if (existingIds.has(row.transaction_id)) {
          errors.push({
            row: row.rowNumber ?? null,
            transaction_id: row.transaction_id,
            reason: ["transaction_id already exists"],
          });
        } else {
          remainingRows.push(row);
        }
      });

      validRows = remainingRows;
    }

    // Errors ko row number ke hisab se sort karo
    errors.sort((a, b) => (a.row ?? 0) - (b.row ?? 0));

    // 2. Final counts
    const validCount = validRows.length;
    const invalidCount = errors.length;

    // Koi valid row nahi bachi: khali batch mat banao
    if (validCount === 0) {
      await client.query("ROLLBACK");
      return { batchId: null, totalRows, validCount, invalidCount, errors };
    }

    // 3. Batch insert
    const batchResult = await client.query(
      `INSERT INTO batches
       (file_name, total_rows, valid_count, invalid_count)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [fileName, totalRows, validCount, invalidCount],
    );

    const batchId = batchResult.rows[0].id;

    // 4. Valid transactions insert (status DB default: PENDING)
    for (const row of validRows) {
      await client.query(
        `INSERT INTO transactions
         (batch_id, transaction_id, customer_name, account_number, amount)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          batchId,
          row.transaction_id,
          row.customer_name,
          row.account_number,
          row.amount, // string hi bhejo, Postgres NUMERIC khud parse karega
        ],
      );
    }

    // 5. Audit log (usi transaction me)
    await logAction(client, {
      action: "UPLOAD",
      batchId,
      performedBy,
      details: JSON.stringify({ fileName, totalRows, validCount, invalidCount }),
    });

    await client.query("COMMIT");

    return { batchId, totalRows, validCount, invalidCount, errors };
  } catch (err) {
    await client.query("ROLLBACK");

    // UNIQUE constraint violation (do uploads ek saath aaye)
    if (err.code === "23505") {
      err.status = 409;
      err.message = "Duplicate transaction_id found, please try again";
    }

    throw err;
  } finally {
    client.release();
  }
}


async function getAllBatches() {
  const result = await pool.query(
    `SELECT b.id,
            b.file_name,
            b.status,
            b.total_rows,
            b.valid_count,
            b.invalid_count,
            b.created_at,
            COUNT(t.id) FILTER (WHERE t.status = 'PENDING')::int    AS pending_count,
            COUNT(t.id) FILTER (WHERE t.status = 'AUTHORIZED')::int AS authorized_count
     FROM batches b
     LEFT JOIN transactions t ON t.batch_id = b.id
     GROUP BY b.id
     ORDER BY b.id DESC`
  );
  return result.rows;
}

async function getBatchById(id) {
  const batchResult = await pool.query(
    "SELECT * FROM batches WHERE id = $1",
    [id]
  );

  if (batchResult.rows.length === 0) {
    const err = new Error("Batch not found");
    err.status = 404;
    throw err;
  }

  const transactionsResult = await pool.query(
    `SELECT id, transaction_id, customer_name, account_number,
            amount, status, created_at
     FROM transactions
     WHERE batch_id = $1
     ORDER BY id`,
    [id]
  );

  return { ...batchResult.rows[0], transactions: transactionsResult.rows };
}

async function approveBatch(id, performedBy) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the batch until this approval transaction has finished.
    const batchResult = await client.query(
      "SELECT * FROM batches WHERE id = $1 FOR UPDATE",
      [id],
    );

    if (batchResult.rows.length === 0) {
      const err = new Error("Batch not found");
      err.status = 404;
      throw err;
    }

    if (batchResult.rows[0].status === "APPROVED") {
      const err = new Error("Batch already approved");
      err.status = 409;
      throw err;
    }

    const transactionsResult = await client.query(
      `UPDATE transactions
       SET status = 'AUTHORIZED'
       WHERE batch_id = $1 AND status = 'PENDING'
       RETURNING id`,
      [id],
    );

    if (transactionsResult.rowCount === 0) {
      const err = new Error("No pending transactions in this batch");
      err.status = 409;
      throw err;
    }

    await client.query(
      "UPDATE batches SET status = 'APPROVED' WHERE id = $1",
      [id],
    );

    const authorizedCount = transactionsResult.rowCount;
    await logAction(client, {
      action: "APPROVE",
      batchId: id,
      performedBy,
      details: JSON.stringify({ authorizedCount }),
    });

    await client.query("COMMIT");
    return { batchId: id, status: "APPROVED", authorizedCount };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { createBatch, getAllBatches, getBatchById, approveBatch };
