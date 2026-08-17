const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

const clients = [];

const broadcastUpdate = () => {
  const data = JSON.stringify({ type: 'update' });
  clients.forEach((res) => {
    res.write(`data: ${data}\n\n`);
  });
};

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  res.write('retry: 5000\n\n');
  clients.push(res);
  req.on('close', () => {
    const idx = clients.indexOf(res);
    if (idx !== -1) clients.splice(idx, 1);
  });
});

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { active: true };
    if (type) filter.type = type;
    let doc = await Notification.findOne(filter).sort({ updatedAt: -1 });
    if (!doc) {
      const fallbackFilter = type ? { type } : {};
      doc = await Notification.findOne(fallbackFilter).sort({ updatedAt: -1 });
    }
    res.json({ success: true, data: doc ? { _id: doc._id, message: doc.message, url: doc.url, type: doc.type || 'general', active: !!doc.active, updatedAt: doc.updatedAt } : null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { type, limit = 5 } = req.query;
    const filter = { active: true };
    if (type) filter.type = type;
    const docs = await Notification.find(filter).sort({ updatedAt: -1 }).limit(Number(limit));
    const entries = docs.map((d) => ({ _id: d._id, message: d.message, url: d.url, type: d.type || 'general', active: !!d.active, updatedAt: d.updatedAt }));
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const ensureAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

router.post('/', auth, ensureAdmin, async (req, res) => {
  try {
    const payload = { message: req.body.message || '', url: req.body.url || '', type: req.body.type || 'general', active: req.body.active !== undefined ? !!req.body.active : true };
    const created = await Notification.create(payload);
    broadcastUpdate();
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', auth, ensureAdmin, async (req, res) => {
  try {
    const payload = { message: req.body.message, url: req.body.url, type: req.body.type, active: req.body.active };
    const updated = await Notification.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    broadcastUpdate();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/', auth, ensureAdmin, async (req, res) => {
  try {
    const payload = { message: req.body.message || '', url: req.body.url || '', type: req.body.type || 'general', active: req.body.active !== undefined ? !!req.body.active : true };
    let current = await Notification.findOne().sort({ updatedAt: -1 });
    if (!current) {
      current = await Notification.create(payload);
    } else {
      current.message = payload.message;
      current.url = payload.url;
      current.type = payload.type;
      current.active = payload.active;
      await current.save();
    }
    broadcastUpdate();
    res.json({ success: true, data: current });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', auth, ensureAdmin, async (req, res) => {
  try {
    const entry = await Notification.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Not found' });
    broadcastUpdate();
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/subscribe', auth, notificationController.subscribeToPushNotifications);
router.post('/unsubscribe', auth, notificationController.unsubscribeFromPushNotifications);
router.post('/send', auth, notificationController.sendPushNotification);
router.post('/send-bulk', auth, notificationController.sendBulkPushNotification);
router.get('/vapid-key', notificationController.getVAPIDPublicKey);
router.post('/fertilizer-reminders', auth, notificationController.createFertilizerReminder);
router.post('/fertilizer-reminders/complete', auth, notificationController.completeFertilizerReminder);

module.exports = router;

