const express = require('express');
const ResearchEntry = require('../models/ResearchEntry');
const auth = require('../middleware/auth');

const router = express.Router();

const researchClients = [];

const broadcastResearchUpdate = () => {
  const data = JSON.stringify({ type: 'update' });
  researchClients.forEach((res) => {
    res.write(`data: ${data}\n\n`);
  });
};

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  res.write('retry: 5000\n\n');

  researchClients.push(res);

  req.on('close', () => {
    const idx = researchClients.indexOf(res);
    if (idx !== -1) researchClients.splice(idx, 1);
  });
});

router.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true';
    let filter = { published: true };
    if (all && req.header('Authorization')) {
      try {
        await new Promise((resolve, reject) => auth(req, res, (e) => e ? reject(e) : resolve()));
        if (req.user && req.user.role === 'admin') {
          filter = {};
        }
      } catch (_) {}
    }
    const limit = (!filter || Object.keys(filter).length === 0) ? undefined : (parseInt(req.query.limit) || 50);
    const query = ResearchEntry.find(filter).sort({ createdAt: -1 }).select('name role headline description avatar photo metrics published featured createdAt updatedAt');
    if (limit) query.limit(limit);
    const docs = await query.lean();
    const entries = docs.map((d) => ({
      _id: d._id,
      name: d.name,
      role: d.role,
      headline: d.headline,
      description: d.description,
      avatar: d.avatar,
      photo: d.photo || (Array.isArray(d.afterImages) && d.afterImages[0]) || (Array.isArray(d.beforeImages) && d.beforeImages[0]) || '',
      metrics: d.metrics || [],
      published: !!d.published,
      featured: !!d.featured,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt
    }));
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const entry = await ResearchEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: entry });
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
    const entry = await ResearchEntry.create(req.body);
    broadcastResearchUpdate();
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', auth, ensureAdmin, async (req, res) => {
  try {
    const entry = await ResearchEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!entry) return res.status(404).json({ success: false, message: 'Not found' });
    broadcastResearchUpdate();
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', auth, ensureAdmin, async (req, res) => {
  try {
    const entry = await ResearchEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Not found' });
    broadcastResearchUpdate();
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
