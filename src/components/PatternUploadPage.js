import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  Alert, 
  Snackbar,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { UploadFile as UploadFileIcon } from '@mui/icons-material';
import FileUploader from '../components/FileUploader';
import { theme as customTheme } from '../theme';

const PatternUploadPage = () => {
  const [patternFile, setPatternFile] = useState(null);
  const [patternImages, setPatternImages] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const patternFileTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'text/plain'
  ];
  
  const imageFileTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp'
  ];
  
  const handlePatternUploadSuccess = (file) => {
    setPatternFile(file);
    showNotification('Pattern file uploaded successfully!', 'success');
  };
  
  const handlePatternUploadError = (error) => {
    showNotification(`Error uploading pattern: ${error}`, 'error');
  };
  
  const handleImagesUploadSuccess = (files) => {
    setPatternImages(files);
    showNotification(`${files.length} images uploaded successfully!`, 'success');
  };
  
  const handleImagesUploadError = (error) => {
    showNotification(`Error uploading images: ${error}`, 'error');
  };
  
  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Save pattern with uploaded files
  const handleSavePattern = () => {
    // Placeholder for saving pattern to S3
    
    showNotification('Pattern saved successfully!', 'success');
  };
  
  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: customTheme.borderRadius.lg,
          backgroundColor: customTheme.colors.containerBackground
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: customTheme.colors.primary }}>
          Upload Pattern
        </Typography>
        
        <Typography variant="body1" paragraph>
          Upload your knitting or crochet pattern files and images. Supported file types include PDF, Word, and plain text for patterns, and JPEG, PNG, GIF for images.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pattern File
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Upload your pattern document (PDF, Word, or text file)
                </Typography>
                
                <FileUploader 
                  type="pattern"
                  onUploadSuccess={handlePatternUploadSuccess}
                  onUploadError={handlePatternUploadError}
                  allowedTypes={patternFileTypes}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pattern Images
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Upload images of your finished project or in-progress photos (up to 5)
                </Typography>
                
                <FileUploader 
                  type="image"
                  multiple={true}
                  onUploadSuccess={handleImagesUploadSuccess}
                  onUploadError={handleImagesUploadError}
                  allowedTypes={imageFileTypes}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {(patternFile || patternImages.length > 0) && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<UploadFileIcon />}
              onClick={handleSavePattern}
            >
              Save Pattern
            </Button>
          </Box>
        )}
        
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default PatternUploadPage;