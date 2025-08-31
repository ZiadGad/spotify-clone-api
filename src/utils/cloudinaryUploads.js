const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });
    // delete local files after successful upload
    fs.unlinkSync(filePath);
    return result;
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error('Failed to upload to cloudinary', err.message);
  }
};

const removeFromCloudinary = async (url) => {
  if (!url) {
    return null;
  }
  // Extract public id from the url
  const regex = /\/upload\/v\d+\/(.+)\.([a-zA-Z0-9]+)$/;
  const match = url.match(regex);
  if (!match) {
    return;
  }
  const ext = match[2].toLowerCase();

  try {
    const result = await cloudinary.uploader.destroy(match[1], {
      resource_type: ext === 'mp3' ? 'video' : 'image',
    });
  } catch (err) {
    throw new Error('Failed to delete from cloudinary', err.message);
  }
};

module.exports = { uploadToCloudinary, removeFromCloudinary };
