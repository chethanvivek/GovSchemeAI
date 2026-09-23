const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const { registerSchema, loginSchema } = require('../validators/authValidator');

// Public auth routes with rate limiting and payload validation
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected session check
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
