const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { aiLimiter } = require('../middlewares/rateLimiter');
const { validate } = require('../middlewares/validateMiddleware');
const { aiChatInputSchema } = require('../validators/aiValidator');

// Protected AI endpoints with strict rate limiting (10 req/min)
router.post('/recommend', requireAuth, aiLimiter, aiController.recommendSchemes);
router.post('/chat', requireAuth, aiLimiter, validate(aiChatInputSchema), aiController.chatSchemeAssistant);

module.exports = router;
