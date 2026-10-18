CREATE TABLE IF NOT EXISTS batches (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'UPLOADED',
  total_rows INT NOT NULL DEFAULT 0,
  valid_count INT NOT NULL DEFAULT 0,
  invalid_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  batch_id INT NOT NULL REFERENCES batches(id),
  transaction_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'AUTHORIZED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action TEXT CHECK (action IN ('UPLOAD', 'APPROVE')),
    batch_id INT REFERENCES batches(id),
    performed_by TEXT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_batch_id ON transactions(batch_id);
