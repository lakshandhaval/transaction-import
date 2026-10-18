function errorHandler(err, req, res, next) {
  console.error(err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large (max 2MB)' });
  }

  res.status(err.status || 500).json({
    error: err.status ? err.message : 'Internal server error',
  });
}

module.exports = errorHandler;