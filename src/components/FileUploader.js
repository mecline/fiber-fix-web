import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Input
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

function FileUploader({ onFileUpload, onError, isLoading, setIsLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('http://localhost:5000/api/test/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      
      onFileUpload({
        key: data.file.key,
        url: data.file.location,
        name: data.file.originalName
      });
      
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error uploading file: ' + error.message);
      if (onError) onError(error.message);
    } finally {
      setIsLoading(false);
    }
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
          textAlign: 'center'
        }}
      >
        <Input
          type="file"
          onChange={handleFileChange}
          sx={{ display: 'none' }}
          id="image-upload-input"
          inputProps={{ accept: 'image/*' }}
          disabled={isLoading}
        />
        <label htmlFor="image-upload-input">
          <Button
            component="span"
            variant="outlined"
            color="primary"
            disabled={isLoading}
            sx={{ mb: 1 }}
          >
            Browse Files
          </Button>
        </label>
        
        <Typography variant="body2" color="textSecondary">
          {selectedFile ? `Selected: ${selectedFile.name}` : 'Supported formats: JPG, PNG, GIF'}
        </Typography>
      </Box>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
        onClick={handleUpload}
        disabled={!selectedFile || isLoading}
        fullWidth
      >
        {isLoading ? 'Uploading...' : 'Upload Image'}
      </Button>
    </Box>
  );
}

export default FileUploader;