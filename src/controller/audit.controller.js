const { getAuditLogs } = require("../services/audit.service");

const VALID_ACTIONS = new Set(["UPLOAD", "APPROVE"]);

async function listAuditLogs(req, res, next) {
  try {
    const { batchId, action } = req.query;
    let parsedBatchId;

    if (batchId !== undefined) {
      parsedBatchId = Number(batchId);
      if (!Number.isInteger(parsedBatchId) || parsedBatchId <= 0) {
        return res.status(400).json({ error: "batchId must be a positive integer" });
      }
    }

    if (action !== undefined && !VALID_ACTIONS.has(action)) {
      return res.status(400).json({ error: "action must be UPLOAD or APPROVE" });
    }

    const logs = await getAuditLogs({ batchId: parsedBatchId, action });
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

module.exports = { listAuditLogs };
