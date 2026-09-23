/**
 * Centralized application error handling middleware.
 * Prevents stack trace leakages in production and ensures consistent error response format.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('Unhandled Application Error:', err);

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred',
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
