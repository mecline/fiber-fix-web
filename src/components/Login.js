import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  InputAdornment, 
  IconButton,
  Divider,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { theme as customTheme } from '../theme';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError(
        error.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : error.code === 'auth/network-request-failed'
          ? 'Network error. Please check your connection'
          : 'An error occurred while logging in'
      );
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              Welcome Back
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
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
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: customTheme.colors.secondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ textAlign: 'right', mt: 1, mb: 3 }}>
                <Link 
                  to="/forgot-password" 
                  style={{ 
                    color: customTheme.colors.primary,
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
                startIcon={<LoginIcon />}
                sx={{ 
                  py: 1.5,
                  fontWeight: 600,
                  mb: 2
                }}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Box>
          
          <Divider />
          
          <Box sx={{ p: 3, pt: 2, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)' }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mt: 1 }}
            >
              Create Account
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;