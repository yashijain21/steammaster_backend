const express = require('express');
const router = express.Router();

const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

const sendMail = require('../utils/sendMail');
const generateInvoice = require('../utils/generateInvoice');

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

  if (
    !services?.length ||
    !appointmentDate ||
    !appointmentTime ||
    !customerName ||
    !customerEmail
  ) {
    return res.status(400).json({ message: 'Required fields missing.' });
  }

  try {
    const foundServices = await Service.find({ _id: { $in: services } });

    if (!foundServices.length) {
      return res.status(404).json({ message: 'No valid services found.' });
    }

    const serviceNames = foundServices.map((s) => s.name);
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

    // Generate invoice PDF
    const invoiceBuffer = await generateInvoice(saved, foundServices);

    // Send admin notification
    await sendMail({
      to: 'admin@example.com', // replace with actual admin email
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

    // Send user confirmation + invoice
    await sendMail({
      to: customerEmail,
      subject: 'Booking Confirmation – Your Appointment is Confirmed!',
      html: `
        <h3>Hi ${customerName},</h3>
        <p>Thank you for booking with us.</p>
        <p><strong>Date:</strong> ${appointmentDate} ${appointmentTime}</p>
        <p><strong>Total:</strong> ${totalPrice} kr</p>
        <p><strong>Services:</strong> ${serviceNames.join(', ')}</p>
        <p>Please find your invoice attached.</p>
      `,
      attachments: [
        {
          filename: 'invoice.pdf',
          content: invoiceBuffer,
        },
      ],
    });

    res.status(201).json({ message: 'Booking successful and emails sent!', data: saved });
  } catch (e) {
    console.error('Booking error:', e);
    res.status(500).json({ message: 'Error booking appointment.' });
  }
});


// Get All Appointments
router.get('/', async (req, res) => {
  try {
    const list = await Appointment.find().sort({ appointmentDate: 1, appointmentTime: 1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching appointments.' });
  }
});

// Get Appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found.' });
    res.json(appt);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching appointment.' });
  }
});

// Update Appointment
router.put('/:id', async (req, res) => {
  try {
    const upd = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        appointmentDate: req.body.appointmentDate
          ? new Date(req.body.appointmentDate)
          : undefined,
      },
      { new: true, runValidators: true }
    );
    if (!upd) return res.status(404).json({ message: 'Appointment not found.' });
    res.json(upd);
  } catch (e) {
    res.status(500).json({ message: 'Error updating appointment.' });
  }
});

// Delete Appointment
router.delete('/:id', async (req, res) => {
  try {
    const del = await Appointment.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: 'Appointment not found.' });
    res.json({ message: 'Appointment deleted.' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting appointment.' });
  }
});

module.exports = router;
