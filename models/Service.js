const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, min: 0 },
  durationMinutes: { type: Number, min: 0 },
category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  image: { type: String, trim: true }, // ✅ Added image field
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Automatically update `updatedAt` on save
serviceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
