function validateRow(row) {
  const errors = [];

  const requiredFields = [
    "transaction_id",
    "customer_name",
    "account_number",
    "amount",
  ];

  // Mandatory fields check
  requiredFields.forEach((field) => {
    if (!row[field] || String(row[field]).trim() === "") {
      errors.push(`${field} is required`);
    }
  });

  // Amount tabhi check karo jab khali na ho
  if (
    row.amount !== undefined &&
    row.amount !== null &&
    String(row.amount).trim() !== ""
  ) {
    const rawAmount = String(row.amount).trim();
    const amount = Number(rawAmount);

    if (!Number.isFinite(amount)) {
      errors.push("amount must be a number");
    } else if (amount <= 0) {
      errors.push("amount must be greater than 0");
    } else if (!/^\d{1,13}(\.\d{1,2})?$/.test(rawAmount)) {
      // DB NUMERIC(15,2) ke hisab se: max 13 digits + max 2 decimals
      errors.push("amount can have max 13 digits and 2 decimal places");
    }
  }

  return errors;
}

function validateRows(rows) {
  const validRows = [];
  const errors = [];
  const seenIds = new Set();

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // line 1 header hai

    const rowErrors = validateRow(row);
    const transactionId = row.transaction_id;

    // Duplicate check sirf tab, jab row baaki sab rules me valid ho.
    // Warna invalid row ka ID seenIds me chala jayega aur
    // baad ki sahi row galat se "duplicate" ban jayegi.
    if (rowErrors.length === 0) {
      if (seenIds.has(transactionId)) {
        rowErrors.push("Duplicate transaction_id in file");
      } else {
        seenIds.add(transactionId);
      }
    }

    if (rowErrors.length > 0) {
      errors.push({
        row: rowNumber,
        transaction_id: transactionId || null,
        reason: rowErrors,
      });
    } else {
      validRows.push({ ...row, rowNumber });
    }
  });

  return { validRows, errors };
}

module.exports = { validateRow, validateRows };