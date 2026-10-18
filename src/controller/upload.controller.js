const { parseCsv } = require("../services/csv.service");
const { validateRows } = require("../services/validation.service");
const { createBatch } = require("../services/batch.service");

async function uploadCsv(req, res, next) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: 'No file uploaded. Use form-data key "file"' });
    }

    // 1. CSV ko rows me badlo
    const rows = parseCsv(req.file.buffer);

    // 2. Har row validate karo
    const { validRows, errors } = validateRows(rows);

    // 3. Kaun upload kar raha hai (optional header, default "maker")
    const performedBy = req.header("x-user") || "maker";

    // 4. DB me save karo (DB transaction ke saath)
    const result = await createBatch({
      fileName: req.file.originalname,
      totalRows: rows.length,
      validRows,
      errors,
      performedBy,
    });

    // 5. Koi valid row save nahi hui
    if (result.batchId === null) {
      return res.status(400).json({
        message: "No valid rows to save",
        ...result,
      });
    }

    // 6. Success
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadCsv };