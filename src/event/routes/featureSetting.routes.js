const express = require('express');
const router = express.Router();
const FeatureSetingController = require('../controllers/featureSetting.controller');

router.post('/', FeatureSetingController.createFeatureSeting);
router.get('/:eventId', FeatureSetingController.getFeatureSetingByEvent);
router.put('/:id', FeatureSetingController.updateFeatureSeting);
router.delete('/:id', FeatureSetingController.deleteFeatureSeting);

module.exports = router;
