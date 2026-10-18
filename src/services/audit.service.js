const pool = require("../config/db");

async function logAction(client, { action, batchId, performedBy, details }) {
  await client.query(
    `INSERT INTO audit_logs (action, batch_id, performed_by, details)
     VALUES ($1, $2, $3, $4)`,
    [action, batchId, performedBy, details]
  );
}

async function getAuditLogs({ batchId, action }) {
  const values = [];
  const conditions = [];

  if (batchId !== undefined) {
    values.push(batchId);
    conditions.push(`batch_id = $${values.length}`);
  }

  if (action !== undefined) {
    values.push(action);
    conditions.push(`action = $${values.length}`);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `SELECT id, action, batch_id, performed_by, details, created_at
     FROM audit_logs
     ${whereClause}
     ORDER BY id DESC`,
    values,
  );

  return result.rows;
}

module.exports = { logAction, getAuditLogs };
