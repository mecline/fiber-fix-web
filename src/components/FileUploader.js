// Update the imports to include a file type prop
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Input,
  Button
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';

function FileUploader({ 
  onFileUpload, 
  onError, 
  isLoading, 
  setIsLoading,
  fileType = 'image', // New prop to specify file type
  acceptedFileTypes // New prop for accepted file types
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  // This is the function you need to modify to upload automatically
  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError('');
      
      // Automatically upload the file when selected
      await uploadFile(file);
    }
  };

  // Create a separate function for the upload logic
  const uploadFile = async (file) => {
    if (!file) {
      setError('No file selected');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      
      // Use the fileType prop to determine the form field name
      formData.append(fileType, file);

      // Determine the endpoint based on fileType
      const endpoint = fileType === 'image' 
        ? 'http://localhost:5000/api/test/upload-image' 
        : 'http://localhost:5000/api/test/upload-pattern';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Pass the result to the parent component
      onFileUpload({
        key: data.file.key,
        url: data.file.location,
        name: data.file.originalName
      });
      
      // Clear the selected file
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error uploading file: ' + error.message);
      if (onError) onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get the proper accept attribute based on file type
  const getAcceptAttribute = () => {
    if (acceptedFileTypes) {
      return acceptedFileTypes.join(',');
    }
    
    return fileType === 'image' 
      ? 'image/*' 
      : '.pdf,.docx,.doc,.txt';
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box 
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: '8px',
          p: 2,
          mb: 2,
          textAlign: 'center',
          position: 'relative',
          transition: 'all 0.2s'
        }}
      >
        {isLoading && (
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.8)',
              zIndex: 1,
              borderRadius: '6px'
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}
      
        <Input
          type="file"
          onChange={handleFileChange}
          sx={{ display: 'none' }}
          id={`${fileType}-upload-input`}
          inputProps={{ accept: getAcceptAttribute() }}
          disabled={isLoading}
        />
        <label htmlFor={`${fileType}-upload-input`}>
          <Button
            component="span"
            variant="outlined"
            color="primary"
            disabled={isLoading}
            startIcon={fileType === 'image' ? <CloudUploadIcon /> : <FileIcon />}
            sx={{ mb: 1 }}
          >
            Browse Files
          </Button>
        </label>
        
        <Typography variant="body2" color="textSecondary">
          {selectedFile 
            ? `Selected: ${selectedFile.name}` 
            : fileType === 'image' 
              ? 'Supported formats: JPG, PNG, GIF' 
              : 'Supported formats: PDF, DOCX, TXT'
          }
        </Typography>
      </Box>
    </Box>
  );
}

export default FileUploader;