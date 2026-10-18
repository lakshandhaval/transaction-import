const express = require("express");
const { listAuditLogs } = require("../controller/audit.controller");

const router = express.Router();

router.get("/", listAuditLogs);

module.exports = router;
