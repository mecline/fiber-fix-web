const { 
  s3Client, 
  bucketName, 
  getSignedUrl, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  HeadObjectCommand 
} = require('../config/s3');

/**
 * Upload a pattern file to S3
 * @route POST /api/files/pattern
 * @access Private
 */
const uploadPatternFile = async (req, res) => {
  try {
    // If file wasn't uploaded due to validation errors
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid pattern file'
      });
    }

    // Successfully uploaded to S3, send response with file details
    res.status(201).json({
      success: true,
      file: {
        key: req.file.key,
        location: req.file.location,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading pattern file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading pattern file',
      error: error.message
    });
  }
};

/**
 * Upload an image to S3
 * @route POST /api/files/image
 * @access Private
 */
const uploadImageFile = async (req, res) => {
  try {
    // If file wasn't uploaded due to validation errors
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid image file'
      });
    }

    // Successfully uploaded to S3, send response with file details
    res.status(201).json({
      success: true,
      file: {
        key: req.file.key,
        location: req.file.location,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading image file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image file',
      error: error.message
    });
  }
};

/**
 * Upload multiple images to S3
 * @route POST /api/files/images
 * @access Private
 */
const uploadMultipleImageFiles = async (req, res) => {
  try {
    // If files weren't uploaded due to validation errors
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid image files'
      });
    }

    // Map file details for response
    const files = req.files.map(file => ({
      key: file.key,
      location: file.location,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    // Successfully uploaded to S3, send response with files details
    res.status(201).json({
      success: true,
      count: files.length,
      files
    });
  } catch (error) {
    console.error('Error uploading multiple image files:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image files',
      error: error.message
    });
  }
};

/**
 * Get signed URL for a file in S3
 * @route GET /api/files/:key
 * @access Private
 */
const getFileUrl = async (req, res) => {
  try {
    const { key } = req.params;
    
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      await s3Client.send(headCommand);
    } catch (headErr) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Generate signed URL (valid for 15 minutes)
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 900 });
    
    res.status(200).json({
      success: true,
      url: signedUrl
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating file URL',
      error: error.message
    });
  }
};

/**
 * Delete a file from S3
 * @route DELETE /api/files/:key
 * @access Private
 */
const deleteFile = async (req, res) => {
  try {
    const { key } = req.params;
    
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      await s3Client.send(headCommand);
    } catch (headErr) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    await s3Client.send(deleteCommand);
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
};

module.exports = {
  uploadPatternFile,
  uploadImageFile,
  uploadMultipleImageFiles,
  getFileUrl,
  deleteFile
};