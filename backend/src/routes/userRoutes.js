const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

// GET /api/user/me - Retrieves current authenticated user and dynamic profile completion status
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
