const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_gov_schemes_2026_secure';

/**
 * Strict authentication middleware.
 * Verifies JWT from Authorization header or HttpOnly cookie.
 * Attaches authenticated user object to req.user.
 */
function requireAuth(req, res, next) {
  let token = null;

  // 1. Check Authorization header: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check HttpOnly cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Access token is missing.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please log in again.'
    });
  }
}

/**
 * Optional authentication middleware:
 * Populates req.user if a valid token exists, but doesn't block unauthenticated requests.
 */
function optionalAuth(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
    } catch {
      // Ignore token failure for optional endpoints
    }
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth
};
