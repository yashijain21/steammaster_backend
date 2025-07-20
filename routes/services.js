const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// ✅ Create Service
router.post('/', async (req, res) => {
  const { name, description, price, durationMinutes, category, image } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: 'Service name and category required.' });
  }

  try {
    const saved = await new Service({
      name,
      description,
      price,
      durationMinutes,
      category,
      image, // ✅ Save image URL
      isActive: true,
    }).save();

    res.status(201).json(saved);
  } catch (e) {
    console.error('❌ Error creating service:', e.message);
    if (e.code === 11000) {
      return res.status(409).json({ message: 'Service name already exists.' });
    }
    res.status(500).json({ message: 'Error creating service.', error: e.message });
  }
});

// ✅ Get All Services
router.get('/', async (req, res) => {
  try {
    const list = await Service.find({ isActive: true }).sort({ category: 1, name: 1 });
    res.json(list);
  } catch (e) {
    console.error('❌ Fetch error:', e.message);
    res.status(500).json({ message: 'Error fetching services.', error: e.message });
  }
});

// ✅ Get Service by ID
router.get('/:id', async (req, res) => {
  try {
    const svc = await Service.findById(req.params.id);
    if (!svc) return res.status(404).json({ message: 'Service not found.' });
    res.json(svc);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching service.', error: e.message });
  }
});

// ✅ Update Service
router.put('/:id', async (req, res) => {
  try {
    const upd = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() }, // Includes `image` from body
      { new: true, runValidators: true }
    );
    if (!upd) return res.status(404).json({ message: 'Service not found.' });
    res.json(upd);
  } catch (e) {
    console.error('❌ Update error:', e.message);
    if (e.code === 11000) {
      return res.status(409).json({ message: 'Service name already exists.' });
    }
    res.status(500).json({ message: 'Error updating service.', error: e.message });
  }
});

// ✅ Delete Service
router.delete('/:id', async (req, res) => {
  try {
    const del = await Service.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: 'Service not found.' });
    res.json({ message: 'Service deleted.' });
  } catch (e) {
    console.error('❌ Delete error:', e.message);
    res.status(500).json({ message: 'Error deleting service.', error: e.message });
  }
});
// ✅ Get Services by Category (Subcategory) ID
router.get('/category/:id', async (req, res) => {
  try {
    const services = await Service.find({
      category: req.params.id,
      isActive: true
    }).sort({ name: 1 });

    res.json(services);
  } catch (error) {
    console.error('❌ Error fetching services by category:', error.message);
    res.status(500).json({ message: 'Error fetching services.', error: error.message });
  }
});

module.exports = router;
