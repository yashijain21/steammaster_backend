const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
  ],
  serviceNames: [String], // To store names for quick access
  totalPrice: { type: Number, required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true, trim: true },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, required: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
  customerPhone: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
