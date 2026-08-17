const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  url: { type: String, default: '' },
  type: { type: String, default: 'general' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

notificationSchema.index({ active: 1, type: 1, updatedAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

