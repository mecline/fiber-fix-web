import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme as customTheme } from './theme';
import { useEffect, useState } from 'react';
import { auth } from './firebase';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import NavBar from './components/NavBar';
import Embroidery from './components/Embroidery';
import Knitting from './components/Knitting';
import Crochet from './components/Crochet';
import { Box, CircularProgress, Container } from '@mui/material';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create MUI theme from our custom theme values
  const muiTheme = createTheme({
    palette: {
      primary: {
        main: customTheme.colors.primary,
        light: customTheme.colors.primaryLight,
        dark: customTheme.colors.primaryDark,
      },
      secondary: {
        main: customTheme.colors.secondary,
        light: customTheme.colors.secondaryLight,
        dark: customTheme.colors.secondaryDark,
      },
      error: {
        main: customTheme.colors.error,
      },
      success: {
        main: customTheme.colors.success,
      },
      warning: {
        main: customTheme.colors.warning,
      },
      info: {
        main: customTheme.colors.info,
      },
      text: {
        primary: customTheme.colors.text,
        secondary: customTheme.colors.textLight,
      },
      background: {
        default: '#f5f5f5',
        paper: customTheme.colors.card,
      },
    },
    typography: {
      fontFamily: customTheme.font.family.main,
      h1: {
        fontFamily: customTheme.font.family.heading,
        fontWeight: customTheme.font.weight.bold,
      },
      h2: {
        fontFamily: customTheme.font.family.heading,
        fontWeight: customTheme.font.weight.bold,
      },
      h3: {
        fontFamily: customTheme.font.family.heading,
        fontWeight: customTheme.font.weight.semiBold,
      },
      h4: {
        fontFamily: customTheme.font.family.heading,
        fontWeight: customTheme.font.weight.semiBold,
      },
      h5: {
        fontFamily: customTheme.font.family.heading,
        fontWeight: customTheme.font.weight.medium,
      },
      h6: {
        fontFamily: customTheme.font.family.heading,
        fontWeight: customTheme.font.weight.medium,
      },
    },
    shape: {
      borderRadius: parseInt(customTheme.borderRadius.md),
    },
    shadows: [
      'none',
      customTheme.boxShadow.sm,
      customTheme.boxShadow.md,
      customTheme.boxShadow.md,
      customTheme.boxShadow.md,
      customTheme.boxShadow.md,
      customTheme.boxShadow.md,
      customTheme.boxShadow.md,
      customTheme.boxShadow.md,
      customTheme.boxShadow.md,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
      customTheme.boxShadow.lg,
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: customTheme.borderRadius.md,
            padding: '8px 16px',
            transition: customTheme.transition.medium,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: customTheme.borderRadius.md,
            boxShadow: customTheme.boxShadow.sm,
            overflow: 'hidden',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: customTheme.borderRadius.md,
            },
          },
        },
      },
    },
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundImage: "url(pexels_yarn.jpg)",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <CircularProgress sx={{ color: customTheme.colors.primary }} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        <Box 
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundImage: "url(pexels_yarn.jpg)",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        >
          <NavBar user={user} />
          <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
            <Routes>
              <Route 
                path="/login" 
                element={user ? <Navigate to="/embroidery" /> : <Login />} 
              />
              <Route 
                path="/register" 
                element={user ? <Navigate to="/embroidery" /> : <Register />} 
              />
              <Route 
                path="/forgot-password" 
                element={user ? <Navigate to="/embroidery" /> : <ForgotPassword />} 
              />
              <Route 
                path="/" 
                element={<Navigate to={user ? "/embroidery" : "/login"} />} 
              />
              <Route 
                path="/embroidery" 
                element={user ? <Embroidery /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/knitting" 
                element={user ? <Knitting /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/crochet" 
                element={user ? <Crochet /> : <Navigate to="/login" />} 
              />
              <Route 
                path="*" 
                element={<Navigate to={user ? "/" : "/login"} />} 
              />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;