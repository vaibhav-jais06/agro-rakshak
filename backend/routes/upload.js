const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

const uploadRootResearch = path.resolve(__dirname, '../public/uploads/research');
const uploadRootProducts = path.resolve(__dirname, '../public/uploads/products');
fs.mkdirSync(uploadRootResearch, { recursive: true });
fs.mkdirSync(uploadRootProducts, { recursive: true });

const storageResearch = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadRootResearch);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});
const storageProducts = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadRootProducts);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});

const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true); else cb(new Error('Invalid image type'));
};

const uploadResearch = multer({ storage: storageResearch, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadProducts = multer({ storage: storageProducts, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/research', auth, (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}, uploadResearch.array('files', 10), (req, res) => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const files = (req.files || []).map((f) => ({
      filename: f.filename,
      url: `${base}/uploads/research/${f.filename}`
    }));
    res.status(201).json({ success: true, files });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;

// Delete uploaded research image by filename
router.delete('/research/:filename', auth, (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  const filePath = path.join(uploadRootResearch, req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    res.json({ success: true, message: 'File deleted' });
  });
});

// Upload product image (seller or user)
router.post('/products', auth, uploadProducts.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
    const base = `${req.protocol}://${req.get('host')}`;
    const url = `${base}/uploads/products/${req.file.filename}`;
    res.status(201).json({ success: true, file: { filename: req.file.filename, url } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
