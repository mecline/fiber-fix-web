const express = require('express');
const router = express.Router();
const { uploadPattern, uploadImage } = require('../middleware/upload');
const {
  uploadPatternFile,
  uploadImageFile
} = require('../controllers/fileController');

// Temporary middleware to bypass authentication for testing
const mockAuth = (req, res, next) => {
  // Add a mock user to the request
  req.user = { id: 'test-user-123' };
  next();
};

// Test route for pattern upload
router.post('/upload-pattern', mockAuth, uploadPattern[0], uploadPattern[1], uploadPatternFile);

// Test route for image upload
router.post('/upload-image', mockAuth, uploadImage[0], uploadImage[1], uploadImageFile);

// Test route to check if the server is working
router.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Test route is working!' });
});

module.exports = router;