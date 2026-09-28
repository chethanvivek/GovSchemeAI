/**
 * Centralized application error handling middleware.
 * Prevents stack trace leakages in production and ensures consistent error response format.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('Unhandled Application Error:', err.stack || err);

  // Guarantee CORS headers are present on error responses
  const origin = req.headers.origin;
  if (origin && !res.getHeader('Access-Control-Allow-Origin')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle duplicate key error code 23505 if propagated here
  const isDuplicate = err.code === '23505' || (err.message && err.message.includes('23505'));
  const statusCode = isDuplicate ? 409 : (err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500));
  const errorMessage = isDuplicate 
    ? 'Email already registered. Please sign in instead.' 
    : (err.message || 'Registration service error');

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    message: errorMessage,
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
