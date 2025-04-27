const multer = require('multer');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucketName } = require('../config/s3');

// Define allowed file types
const allowedFileTypes = {
  'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  'pattern': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
};

// Set up storage with multer for temporary local storage
const storage = multer.memoryStorage();

// Set up the multer middleware
const createUploadMiddleware = (fileType) => {
  return multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // Limit file size to 10MB
    },
    fileFilter: function (req, file, cb) {
      // Check if the file type is allowed
      if (allowedFileTypes[fileType].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Only ${allowedFileTypes[fileType].join(', ')} files are allowed!`), false);
      }
    }
  });
};

// Handle the actual upload to S3
const uploadToS3 = async (req, res, next) => {
  try {
    if (!req.file && !req.files) {
      return next();
    }
    
    // If it's a single file upload
    if (req.file) {
      const userId = req.user ? req.user.id : 'anonymous';
      const fileType = req.file.fieldname; // 'pattern' or 'image'
      const fileName = `${userId}/${fileType}/${Date.now()}-${path.basename(req.file.originalname)}`;
      
      const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      };
      
      // Upload to S3
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      
      // Create a public URL (or we can generate signed URLs as needed)
      const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      
      // Add S3 data to the request object
      req.file.key = fileName;
      req.file.location = fileUrl;
      
      return next();
    }
    
    // If it's a multiple file upload
    if (req.files) {
      const userId = req.user ? req.user.id : 'anonymous';
      const fileType = req.files[0].fieldname.replace(/s$/, ''); // 'images' -> 'image'
      
      // Process each file
      const uploadPromises = req.files.map(async (file, index) => {
        const fileName = `${userId}/${fileType}/${Date.now()}-${index}-${path.basename(file.originalname)}`;
        
        const params = {
          Bucket: bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype
        };
        
        // Upload to S3
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        
        // Create a public URL
        const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        
        // Add S3 data to the file object
        file.key = fileName;
        file.location = fileUrl;
        
        return file;
      });
      
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      
      return next();
    }
  } catch (error) {
    return next(error);
  }
};

// Create middleware for different types of uploads
const uploadPattern = createUploadMiddleware('pattern').single('pattern');
const uploadImage = createUploadMiddleware('image').single('image');
const uploadMultipleImages = createUploadMiddleware('image').array('images', 5); // Allow up to 5 images

module.exports = {
  uploadPattern: [uploadPattern, uploadToS3],
  uploadImage: [uploadImage, uploadToS3],
  uploadMultipleImages: [uploadMultipleImages, uploadToS3]
};