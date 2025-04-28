const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadPattern, uploadImage, uploadMultipleImages } = require('../middleware/upload');
const {
  uploadPatternFile,
  uploadImageFile,
  uploadMultipleImageFiles,
  getFileUrl,
  deleteFile
} = require('../controllers/fileController');

// Apply authentication middleware to all routes
router.use(protect);

// Upload pattern files
router.post('/pattern', (req, res, next) => {
  uploadPattern(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, uploadPatternFile);

// Upload single image
router.post('/image', (req, res, next) => {
  uploadImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, uploadImageFile);

// Upload multiple images
router.post('/images', (req, res, next) => {
  uploadMultipleImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
}, uploadMultipleImageFiles);

// Get file URL
router.get('/:key', getFileUrl);

// Delete file
router.delete('/:key', deleteFile);

module.exports = router;
