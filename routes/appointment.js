const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

// Create Appointment
router.post('/', async (req, res) => {
  const { serviceId, appointmentDate, appointmentTime, customerName, customerEmail, customerPhone, notes } = req.body;
  if (!serviceId || !appointmentDate || !appointmentTime || !customerName || !customerEmail)
    return res.status(400).json({ message: 'Required fields missing.' });

  try {
    const svc = await Service.findById(serviceId);
    if (!svc) return res.status(404).json({ message: 'Service not found.' });

    const saved = await new Appointment({
      serviceId,
      serviceName: svc.name,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      customerName,
      customerEmail,
      customerPhone,
      notes
    }).save();

    res.status(201).json(saved);
  } catch (e) {
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
        appointmentDate: req.body.appointmentDate ? new Date(req.body.appointmentDate) : undefined
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
