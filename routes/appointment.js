const express = require('express');
const router = express.Router();
const path = require('path');

const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

const sendMail = require('../utils/sendmail');
const generateInvoice = require('../utils/generateInvoice');

// Update Appointment Status
router.patch('/status', async (req, res) => {
  const { id, status } = req.body;
  const validStatuses = ['attended', 'cancelled', 'no_show'];

  if (!id || !validStatuses.includes(status)) {
    return res.status(400).json({
      message: 'Invalid request. Provide valid appointment ID and status (attended, cancelled, no_show).',
    });
  }

  try {
    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    res.json({ message: `Appointment marked as ${status}.`, data: appointment });
  } catch (err) {
    console.error('❌ Error updating appointment status:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Create Appointment
router.post('/', async (req, res) => {
  const {
    services,
    appointmentDate,
    appointmentTime,
    customerName,
    customerEmail,
    customerPhone,
    notes,
  } = req.body;

  console.log("📥 Received booking data:", req.body);

  if (!services?.length || !appointmentDate || !appointmentTime || !customerName || !customerEmail) {
    return res.status(400).json({ message: 'Required fields missing.' });
  }

  try {
    const foundServices = await Service.find({ _id: { $in: services } });
    if (!foundServices.length) return res.status(404).json({ message: 'No valid services found.' });

    const serviceNames = foundServices.map(s => s.name);
    const totalPrice = foundServices.reduce((sum, s) => sum + (s.price || 0), 0);

    const newAppointment = new Appointment({
      services,
      serviceNames,
      totalPrice,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    });

    const saved = await newAppointment.save();
    console.log("💾 Appointment saved to DB:", saved._id);

    // Generate invoice safely
    let invoiceBuffer = null;
    try {
      invoiceBuffer = await generateInvoice(saved, foundServices);
      console.log("🧾 Invoice generated.");
    } catch (err) {
      console.error("⚠️ Invoice generation failed:", err);
    }

    // Send admin email safely
    try {
      await sendMail({
        to: 'steammaster973@gmail.com',
        subject: 'New Booking Received',
        html: `
          <h3>New Appointment</h3>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Phone:</strong> ${customerPhone}</p>
          <p><strong>Date:</strong> ${appointmentDate} ${appointmentTime}</p>
          <p><strong>Total:</strong> ${totalPrice} kr</p>
          <p><strong>Services:</strong> ${serviceNames.join(', ')}</p>
        `,
      });
      console.log("📤 Admin email sent.");
    } catch (err) {
      console.error("⚠️ Sending admin email failed:", err);
    }

    // Send confirmation email safely
    try {
      await sendMail({
        to: customerEmail,
        subject: 'Thanks for Your Booking – Invoice Attached',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; background-color: #ffffff;">
            <div style="text-align: center;">
              <img src="cid:logo" alt="SteamMaster Logo" style="width: 120px; margin-bottom: 20px;" />
              <h2 style="color: #333;">Thanks for your booking, ${customerName}!</h2>
              <p style="font-size: 15px; color: #666;">We've attached your invoice to this email.</p>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
            <div style="text-align: left; font-size: 14px; color: #333;">
              <p><strong>Appointment Date:</strong> ${appointmentDate} at ${appointmentTime}</p>
              <p><strong>Services:</strong> ${serviceNames.join(', ')}</p>
              <p><strong>Total:</strong> ${totalPrice} kr</p>
              <p><strong>Invoice ID:</strong> ${saved._id}</p>
            </div>
            <div style="margin-top: 40px; text-align: center;">
              <a href="#" style="background-color: #8DC63F; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">Download Invoice</a>
              <p style="margin-top: 20px; font-size: 12px; color: #888;">If you have any questions or feedback, just <a href="mailto:steammaster973@gmail.com" style="color: #8DC63F; text-decoration: none;">reply to this email</a>.</p>
            </div>
            <div style="text-align: center; margin-top: 40px; font-size: 11px; color: #999;">
              SteamMaster, Bleckvarugatan 3, 417 07 Göteborg, Sweden<br />
              Phone: +46 76 556 67 75
            </div>
          </div>
        `,
        attachments: [
          invoiceBuffer ? { filename: 'invoice.pdf', content: invoiceBuffer } : null,
          { filename: 'logo.png', path: path.join(__dirname, '../logo.png'), cid: 'logo' }
        ].filter(Boolean),
      });
      console.log("📨 Confirmation email sent to user.");
    } catch (err) {
      console.error("⚠️ Sending confirmation email failed:", err);
    }

    res.status(201).json({ message: 'Booking saved successfully!', data: saved });
  } catch (e) {
    console.error('❌ Booking error:', e);
    res.status(500).json({ message: 'Error booking appointment.', error: e.message });
  }
});

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const list = await Appointment.find().sort({ appointmentDate: 1, appointmentTime: 1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching appointments.', error: e.message });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found.' });
    res.json(appt);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching appointment.', error: e.message });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const upd = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        appointmentDate: req.body.appointmentDate ? new Date(req.body.appointmentDate) : undefined,
      },
      { new: true, runValidators: true }
    );
    if (!upd) return res.status(404).json({ message: 'Appointment not found.' });
    res.json(upd);
  } catch (e) {
    res.status(500).json({ message: 'Error updating appointment.', error: e.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const del = await Appointment.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: 'Appointment not found.' });
    res.json({ message: 'Appointment deleted.' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting appointment.', error: e.message });
  }
});

module.exports = router;
