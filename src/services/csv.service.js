const { parse } = require('csv-parse/sync');

const REQUIRED_HEADERS = ['transaction_id', 'customer_name', 'account_number', 'amount'];

function parseCsv(buffer) {
  const rows = parse(buffer, {
    columns: (header) => header.map((h) => h.trim()),
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  if (rows.length === 0) {
    const err = new Error('CSV file is empty');
    err.status = 400;
    throw err;
  }

  const headers = Object.keys(rows[0]);
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    const err = new Error(`Missing CSV columns: ${missing.join(', ')}`);
    err.status = 400;
    throw err;
  }

  return rows;
}

module.exports = { parseCsv };