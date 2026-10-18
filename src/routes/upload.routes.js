const express = require('express');
const upload = require('../middleware/upload');
const { uploadCsv } = require('../controller/upload.controller');

const router = express.Router();

router.post('/', upload.single('file'), uploadCsv);

module.exports = router;
