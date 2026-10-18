const express = require("express");
const { listBatches, getBatch, approve } = require("../controller/batch.controller");

const router = express.Router();

router.get("/", listBatches);
router.post("/:id/approve", approve);
router.get("/:id", getBatch);

module.exports = router;
