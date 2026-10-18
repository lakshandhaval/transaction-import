# Transaction Import Tool

A Node.js and PostgreSQL API for importing transaction CSV files. It demonstrates a simple Maker-Checker flow: one user uploads transactions and another user authorizes the whole batch.

## Maker-Checker flow

1. A maker uploads a CSV file with `POST /upload`.
2. The API validates each row. Valid rows are saved as `PENDING`; invalid rows are returned in the response.
3. A checker calls `POST /batches/:id/approve`.
4. All pending transactions become `AUTHORIZED`, the batch becomes `APPROVED`, and an audit log is created.

## Tech stack

- Node.js, Express, and the `pg` package
- PostgreSQL with plain parameterized SQL (no ORM)
- Multer and `csv-parse` for uploads
- Swagger UI at `/api-docs`
- Node's built-in `node:test` runner

## Setup

1. Install dependencies: `npm install`
2. Create a PostgreSQL database, for example: `createdb transaction_import`
3. Run the schema: `psql -U postgres -d transaction_import -f src/db/schema.sql`
4. Copy `.env.example` to `.env` and set your local PostgreSQL password.
5. Start the API with `npm start` (or `npm run dev`).
6. Open `http://localhost:3000/api-docs` for interactive API documentation.

Run validation tests with `npm test`.

## API

All errors use `{ "error": "..." }`.

### Health check

```bash
curl http://localhost:3000/health
```

Response: `{ "status": "ok" }`

### Upload a CSV

```bash
curl -X POST http://localhost:3000/upload \
  -H "x-user: maker.riya" \
  -F "file=@sample/transactions.csv"
```

Example response (the demo file intentionally has invalid rows):

```json
{
  "batchId": 1,
  "totalRows": 8,
  "validCount": 2,
  "invalidCount": 6,
  "errors": [{ "row": 4, "reason": ["customer_name is required"] }]
}
```

### List batches

```bash
curl http://localhost:3000/batches
```

Each batch includes `pending_count` and `authorized_count`.

### Get one batch

```bash
curl http://localhost:3000/batches/1
```

The response contains batch metadata and a `transactions` array.

### Approve a batch

```bash
curl -X POST http://localhost:3000/batches/1/approve \
  -H "x-user: checker.aman"
```

```json
{
  "message": "Batch approved successfully",
  "batchId": 1,
  "status": "APPROVED",
  "authorizedCount": 2
}
```

Approving the same batch again returns `409` with `{ "error": "Batch already approved" }`.

### List audit logs

```bash
curl http://localhost:3000/audit-logs
curl "http://localhost:3000/audit-logs?batchId=1"
curl "http://localhost:3000/audit-logs?action=APPROVE"
```

Logs are returned newest first. `batchId` must be a positive integer, and `action` must be `UPLOAD` or `APPROVE`.

## Database tables

| Table | Purpose |
| --- | --- |
| `batches` | One uploaded CSV and its validation counts/status. |
| `transactions` | Valid transaction rows; starts `PENDING`, then becomes `AUTHORIZED`. |
| `audit_logs` | Who uploaded or approved a batch, plus contextual JSON text. |

`transactions.batch_id` is indexed for efficient batch lookups. `transaction_id` has a database `UNIQUE` constraint.

## Project structure

```text
src/
  config/       PostgreSQL pool
  controller/   HTTP request/response handling
  db/           Database schema
  docs/         OpenAPI document
  middleware/   Upload and error middleware
  routes/       URL-to-controller mapping
  services/     Validation and SQL business logic
sample/         Demo CSV
test/           Unit tests
```

## Design decisions

- The layered route/controller/service structure keeps HTTP code separate from SQL and business rules.
- Upload and approval each use a database transaction, so related changes either all succeed or all roll back.
- Approval reads the batch with `FOR UPDATE`; concurrent checkers cannot both approve the same batch.
- The application checks duplicate IDs in the CSV, while PostgreSQL's `UNIQUE` constraint is the final concurrency-safe guard.
- `NUMERIC(15,2)` avoids floating-point money errors; `account_number` is `TEXT` so leading zeroes are preserved.
- `x-user` is deliberately a lightweight stand-in for real authentication in this assignment.
