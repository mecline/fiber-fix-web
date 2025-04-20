import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  InputAdornment, 
  Divider,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Email as EmailIcon,
  KeyboardReturn as KeyboardReturnIcon,
  RestartAlt as RestartAltIcon
} from '@mui/icons-material';
import { theme as customTheme } from '../theme';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox and spam folders.');
    } catch (error) {
      let errorMessage = 'An error occurred while sending the reset email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: isMobile ? 'calc(100vh - 100px)' : 'calc(100vh - 200px)',
      }}
    >
      <Card 
        sx={{ 
          width: '100%', 
          maxWidth: 450,
          mx: 2,
          borderRadius: customTheme.borderRadius.lg,
          boxShadow: customTheme.boxShadow.lg,
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 1 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              align="center"
              sx={{ 
                color: customTheme.colors.primary,
                fontWeight: 600,
                mb: 3
              }}
            >
              Reset Password
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {message && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {message}
              </Alert>
            )}
            
            <Typography variant="body1" paragraph>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                type="email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: customTheme.colors.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                  startIcon={<RestartAltIcon />}
                  sx={{ 
                    py: 1.5,
                    fontWeight: 600
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Box>
            </form>
          </Box>
          
          <Divider />
          
          <Box sx={{ p: 3, pt: 2, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)' }}>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              color="primary"
              startIcon={<KeyboardReturnIcon />}
              fullWidth
            >
              Back to Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ForgotPassword;