import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import { useEffect, useState } from 'react';
import { auth } from './firebase';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Home from './components/Home';
import NavBar from './components/NavBar';
import Embroidery from './components/Embroidery';
import Knitting from './components/Knitting';
import Crochet from './components/Crochet';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div style={{
        backgroundImage: "url(pexels_yarn.jpg)",
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        '--primary-color': theme.colors.primary,
        '--primary-hover-color': theme.colors.primaryHover,
        '--danger-color': theme.colors.danger,
        '--danger-hover-color': theme.colors.dangerHover,
        '--text-color': theme.colors.text,
        '--background-color': theme.colors.background,
        '--container-background': theme.colors.containerBackground,
        '--link-color': theme.colors.link,
        '--error-color': theme.colors.error,
        '--success-color': theme.colors.success,
        '--box-shadow': theme.boxShadow,
        '--border-radius': theme.borderRadius,
      }}>
        <NavBar user={user} />
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
            path="/home" 
            element={user ? <Home /> : <Navigate to="/login" />} 
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
            element={<Navigate to={user ? "/home" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
