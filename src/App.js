import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
        height: '100vh' }}
        >
        <NavBar user={user} />
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/home" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/home" /> : <Register />} 
          />
          <Route 
            path="/forgot-password" 
            element={user ? <Navigate to="/home" /> : <ForgotPassword />} 
          />
          <Route 
            path="/home" 
            element={user ? <Home /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/home" : "/login"} />} 
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
