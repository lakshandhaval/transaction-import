const {
  getAllBatches,
  getBatchById,
  approveBatch,
} = require("../services/batch.service");

async function listBatches(req, res, next) {
  try {
    const batches = await getAllBatches();
    res.json(batches);
  } catch (err) {
    next(err);
  }
}

async function getBatch(req, res, next) {
  try {
    const id = Number(req.params.id);

    // URL me /batches/abc aaya to Postgres crash karega, isliye pehle check
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Batch id must be a positive integer" });
    }

    const batch = await getBatchById(id);
    res.json(batch);
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Batch id must be a positive integer" });
    }

    const performedBy = req.header("x-user") || "checker";
    const result = await approveBatch(id, performedBy);
    res.json({ message: "Batch approved successfully", ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = { listBatches, getBatch, approve };
