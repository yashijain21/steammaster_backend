const express = require('express');
const router = express.Router();

const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

const sendMail = require('../utils/sendmail');
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
      to: 'steammaster973@gmail.com', // replace with actual admin email
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
        <p style="margin-top: 20px; font-size: 12px; color: #888;">
          If you have any questions or feedback, just <a href="mailto:steammaster973@gmail.com" style="color: #8DC63F; text-decoration: none;">reply to this email</a>.
        </p>
      </div>

      <div style="text-align: center; margin-top: 40px; font-size: 11px; color: #999;">
        SteamMaster, Bleckvarugatan 3, 417 07 Göteborg, Sweden<br />
        Phone: +46 76 556 67 75
      </div>
    </div>
  `,
  attachments: [
    {
      filename: 'invoice.pdf',
      content: invoiceBuffer,
    },
    {
      filename: 'logo.png',
      path: path.join(__dirname, 'logo.png'), // adjust path if needed
      cid: 'logo', // referenced in <img src="cid:logo" />
    }
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
