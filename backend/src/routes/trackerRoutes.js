const express = require('express');
const router = express.Router();
const trackerController = require('../controllers/trackerController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validateMiddleware');
const { addTrackerSchema, updateTrackerSchema } = require('../validators/trackerValidator');

// Protected tracker endpoints
router.get('/', requireAuth, trackerController.getTrackedSchemes);
router.post('/', requireAuth, validate(addTrackerSchema), trackerController.addTrackedScheme);
router.put('/:id', requireAuth, validate(updateTrackerSchema), trackerController.updateTrackedScheme);
router.delete('/:id', requireAuth, trackerController.removeTrackedScheme);

module.exports = router;
