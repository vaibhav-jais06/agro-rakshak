const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const auth = require('../middleware/auth');

router.post('/', (req, res) => {
  const farmData = req.body || {};

  const recommendations = {
    suggestedCrops: ['Wheat', 'Mustard'],
    fertilizer: {
      type: 'NPK 20-20-0',
      amount: '50 kg/acre'
    },
    irrigation: 'Drip irrigation recommended for water efficiency'
  };

  res.json({ success: true, input: farmData, recommendations });
});

router.post('/crop-alerts', auth, recommendationController.createCropAlert);
router.get('/crop-alerts/:userId', auth, recommendationController.getCropAlerts);
router.patch('/crop-alerts/:alertId/read', auth, recommendationController.markAlertAsRead);
router.delete('/crop-alerts/:alertId', auth, recommendationController.dismissAlert);

module.exports = router;

