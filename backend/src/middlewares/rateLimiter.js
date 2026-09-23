const rateLimit = require('express-rate-limit');

// General API Rate Limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// Authentication Rate Limiter: 15 requests per 15 minutes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

// AI Rate Limiter: 10 requests per minute per IP (Strictly prevents billing exhaustion)
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI query rate limit exceeded (Maximum 10 requests/minute). Please slow down.'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  aiLimiter
};
