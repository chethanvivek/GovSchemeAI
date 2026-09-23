const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');
const { optionalAuth } = require('../middlewares/authMiddleware');

// Schemes catalogue (publicly searchable, optionally enriched with user session)
router.get('/', optionalAuth, schemeController.getSchemes);
router.post('/discover-live', optionalAuth, schemeController.discoverLiveScheme);
router.get('/:id', optionalAuth, schemeController.getSchemeById);

module.exports = router;
