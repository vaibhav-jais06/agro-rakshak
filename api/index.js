module.exports = (req, res) => {
  try {
    const app = require('../backend/server');
    return app(req, res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load backend', details: err.message, stack: err.stack });
  }
};
