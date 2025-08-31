const fs = require('fs');
const { validationResult } = require('express-validator');
const { cleanupAllFiles, cleanupFile } = require('../../utils/cleanupFile');

const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file && req.file.path) {
      cleanupFile(req.file.path);
    }
    if (req.files) {
      cleanupAllFiles(req);
    }
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }

  next();
};

module.exports = validatorMiddleware;
