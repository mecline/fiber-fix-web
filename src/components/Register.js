import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PersonAdd as PersonAddIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { theme as customTheme } from '../theme';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const steps = ['Account Information', 'Confirm Details'];

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      setError('');
      
      if (!email || !validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      if (!validatePassword(password)) {
        setError('Password must be at least 6 characters');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeStep === 0) {
      handleNext();
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      let errorMessage = 'An error occurred during registration';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      }
      
      setError(errorMessage);
      setActiveStep(0);
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
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
              helperText="Password must be at least 6 characters"
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
            <TextField
              fullWidth
              label="Confirm Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: customTheme.colors.secondary }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  py: 1,
                  px: 3,
                  fontWeight: 600
                }}
              >
                Next
              </Button>
            </Box>
          </>
        );
      case 1:
        return (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Please confirm your account details:
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1, mb: 2 }}>
              <Typography variant="body1">
                <strong>Email:</strong> {email}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" paragraph>
              By creating an account, you agree to our Terms and Conditions and Privacy Policy.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                endIcon={<PersonAddIcon />}
                sx={{ 
                  py: 1,
                  px: 3,
                  fontWeight: 600
                }}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>
          </>
        );
      default:
        return null;
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
          maxWidth: 500,
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
              Create Account
            </Typography>
            
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              {renderStepContent(activeStep)}
            </form>
          </Box>
          
          <Divider />
          
          <Box sx={{ p: 3, pt: 2, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)' }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?
            </Typography>
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mt: 1 }}
            >
              Sign In
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Register;