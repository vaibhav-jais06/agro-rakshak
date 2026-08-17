const mongoose = require('mongoose');

const MetricSchema = new mongoose.Schema({
  label: String,
  value: String,
  color: String
}, { _id: false });

const ResearchEntrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String },
  headline: { type: String },
  description: { type: String },
  avatar: { type: String },
  photo: { type: String },
  metrics: { type: [MetricSchema], default: [] },
  published: { type: Boolean, default: false },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

ResearchEntrySchema.index({ published: 1, createdAt: -1 });

module.exports = mongoose.model('ResearchEntry', ResearchEntrySchema);
