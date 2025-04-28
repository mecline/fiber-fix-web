const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware to protect routes
 * Verifies the JWT token from the request header
 */
const protect = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  // Check if auth header exists and starts with Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
  
  // Get token from Bearer token in header
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

module.exports = { protect };
