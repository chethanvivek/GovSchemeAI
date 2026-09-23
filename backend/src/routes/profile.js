const express = require('express');
const router = express.Router();
const { profileSchema } = require('../validators/profileValidator');
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validateMiddleware');

// GET /api/profile
router.get('/', requireAuth, profileController.getProfile);

// PUT /api/profile
router.put('/', requireAuth, validate(profileSchema), profileController.updateProfile);

module.exports = router;
