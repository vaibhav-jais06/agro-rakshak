const express = require('express');
const router = express.Router();
const soilController = require('../controllers/soilController');

router.get('/agro', soilController.getAgroSoil);
router.get('/location', soilController.getLocationInfo);
router.get('/agro/test', soilController.testAgroKey);
router.get('/agro/auto', soilController.autoFillFromLocation);
router.post('/analysis', soilController.analyzeSoil);

// Backward compatible endpoints
router.get('/soil-health', soilController.getAgroSoil);
router.post('/soil-analysis', soilController.analyzeSoil);

module.exports = router;
