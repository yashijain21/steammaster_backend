const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// ✅ Create Category
router.post('/', async (req, res) => {
  const { name, parent, image } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }

  try {
    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(409).json({ message: 'Category with this name already exists.' });
    }

    const category = await new Category({
      name,
      parent: parent || null,
      image
    }).save();

    res.status(201).json(category);
  } catch (e) {
    console.error('❌ Error creating category:', e.message);
    res.status(500).json({ message: 'Error creating category.', error: e.message });
  }
});

// ✅ Get All Categories (with children populated)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ parent: null }).populate('children').exec();
    res.json(categories);
  } catch (e) {
    console.error('❌ Fetch error:', e.message);
    res.status(500).json({ message: 'Error fetching categories.', error: e.message });
  }
});

// ✅ Get Category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('children').exec();
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json(category);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching category.', error: e.message });
  }
});

// ✅ Update Category
router.put('/:id', async (req, res) => {
  const { name, parent, image } = req.body;

  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, parent: parent || null, image },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Category not found.' });
    res.json(updated);
  } catch (e) {
    console.error('❌ Update error:', e.message);
    if (e.code === 11000) {
      return res.status(409).json({ message: 'Category name already exists.' });
    }
    res.status(500).json({ message: 'Error updating category.', error: e.message });
  }
});

// ✅ Delete Category
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Category not found.' });
    res.json({ message: 'Category deleted.' });
  } catch (e) {
    console.error('❌ Delete error:', e.message);
    res.status(500).json({ message: 'Error deleting category.', error: e.message });
  }
});

module.exports = router;
