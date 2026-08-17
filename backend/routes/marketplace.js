const express = require('express');
const router = express.Router();

// Mock product data
const products = [
  {
    id: 1,
    name: 'Organic Urea',
    category: 'Fertilizer',
    price: 350,
    unit: 'kg',
    brand: 'IFFCO',
    rating: 4.5,
    inStock: true
  },
  {
    id: 2,
    name: 'Hybrid Tomato Seeds',
    category: 'Seeds',
    price: 450,
    unit: 'packet',
    brand: 'Nunhems',
    rating: 4.7,
    inStock: true
  },
  {
    id: 3,
    name: 'Drip Irrigation Kit',
    category: 'Equipment',
    price: 15000,
    unit: 'set',
    brand: 'Jain Irrigation',
    rating: 4.6,
    inStock: true
  }
];

const Order = require('../models/Order');
const SellerProduct = require('../models/SellerProduct');
const mongoose = require('mongoose');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all products
router.get('/products', (req, res) => {
  try {
    const { category, search } = req.query;
    
    let filtered = products;
    
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get product by ID
router.get('/products/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create order
router.post('/orders', async (req, res) => {
  try {
    const { userId, userName, items, products: prodItems, totalAmount, shippingAddress } = req.body;
    const orderItems = Array.isArray(items)
      ? items
      : Array.isArray(prodItems)
        ? prodItems.map(p => ({ productId: p.id || p._id, name: p.name || p.productName || 'Item', quantity: p.quantity || 1, price: p.price }))
        : [];
    const total = typeof totalAmount === 'number' ? totalAmount : orderItems.reduce((sum, i) => sum + (Number(i.price) * Number(i.quantity || 1)), 0);

    const created = await Order.create({ userId, userName: userName || 'Unknown', items: orderItems, total, shippingAddress, status: 'pending' });
    res.status(201).json({ success: true, data: { id: created._id, _id: created._id, userId: created.userId, userName: created.userName, items: created.items, total: created.total, status: created.status, createdAt: created.createdAt }, message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// List orders (with filters and mapping for admin/frontend)
router.get('/orders', async (req, res) => {
  try {
    const { status, q, userId, includeUser } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (status && status !== 'all') filter.status = status;
    let query = Order.find(filter).sort({ createdAt: -1 });
    const docs = await query.lean();
    let result = docs;
    if (q) {
      const qq = String(q).toLowerCase();
      result = result.filter(o => (o.userName || '').toLowerCase().includes(qq) || (Array.isArray(o.items) ? o.items.some(i => (i.name || '').toLowerCase().includes(qq)) : false));
    }
    let userMap = {};
    if (String(includeUser).toLowerCase() === 'true') {
      const ids = Array.from(new Set(result.map(o => o.userId).filter(Boolean))).filter(id => mongoose.Types.ObjectId.isValid(id));
      if (ids.length) {
        const users = await User.find({ _id: { $in: ids } }).select('name username phone role').lean();
        userMap = Object.fromEntries(users.map(u => [String(u._id), u]));
      }
    }
    const records = result.map(o => ({ _id: o._id, id: o._id, userId: o.userId, userName: o.userName, items: o.items, total: o.total, status: o.status, createdAt: o.createdAt, user: userMap[String(o.userId)] || undefined }));
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Orders summary grouped by user
router.get('/orders/summary', async (req, res) => {
  try {
    const pipeline = [
      { $group: { _id: '$userId', userId: { $first: '$userId' }, userName: { $first: '$userName' }, count: { $sum: 1 }, total: { $sum: '$total' } } },
      { $sort: { total: -1 } }
    ];
    const agg = await Order.aggregate(pipeline);
    const data = agg.map(a => ({ userId: a.userId, userName: a.userName || '', count: a.count, total: a.total }));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Seller endpoints
router.get('/seller/products', async (req, res) => {
  try {
    const { sellerId } = req.query;
    const filter = sellerId ? { sellerId } : {};
    const docs = await SellerProduct.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/seller/products', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') return res.status(403).json({ success: false, message: 'Seller access required' });
    const { name, category, price, unit, brand, stock, imageUrl } = req.body;
    const created = await SellerProduct.create({ sellerId: String(req.user._id), sellerName: req.user.name || 'Seller', name, category, price: Number(price) || 0, unit: unit || 'unit', brand: brand || '', inStock: stock !== undefined ? !!stock : true, imageUrl });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/seller/products/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') return res.status(403).json({ success: false, message: 'Seller access required' });
    const existing = await SellerProduct.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(existing.sellerId) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Forbidden' });
    const updated = await SellerProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/seller/products/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') return res.status(403).json({ success: false, message: 'Seller access required' });
    const existing = await SellerProduct.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(existing.sellerId) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Forbidden' });
    await SellerProduct.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
