const fs = require('fs');

const cleanupFile = (filePath) => {
  if (filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Cleaned up uploaded file:', filePath);
      }
    } catch (err) {
      console.warn('Failed to cleanup file:', err.message);
    }
  }
};

const cleanupAllFiles = (req) => {
  if (req.files) {
    Object.keys(req.files).forEach((fieldName) => {
      req.files[fieldName].forEach((file) => {
        const filePath = file.path;
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Cleaned up uploaded file:', filePath);
          }
        } catch (err) {
          console.warn('Failed to cleanup file:', err.message);
        }
      });
    });
  }
};

module.exports = { cleanupFile, cleanupAllFiles };
