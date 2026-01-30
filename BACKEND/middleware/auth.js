const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Please authenticate'
    });
  }
};

module.exports = auth;