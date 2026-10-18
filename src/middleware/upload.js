const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(), // file RAM me rahegi, disk pe nahi
  limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      const err = new Error('Only .csv files are allowed');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

module.exports = upload;