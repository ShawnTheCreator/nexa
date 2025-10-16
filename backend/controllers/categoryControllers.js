import { Category } from '../models/categoryModel.js';

export const listCategories = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const categories = await Category.findAll({ includeInactive: includeInactive === 'true' });
    res.status(200).json({ success: true, categories: categories.map(c => c.toJSON()) });
  } catch (err) {
    console.error('List categories error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, category: category.toJSON() });
  } catch (err) {
    console.error('Get category error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching category' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, type, description } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Name and type are required' });
    }
    const category = await Category.create({ name, type, description });
    res.status(201).json({ success: true, category: category.toJSON() });
  } catch (err) {
    console.error('Create category error:', err.message);
    res.status(500).json({ success: false, message: 'Error creating category' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    const updated = await category.update(req.body);
    res.status(200).json({ success: true, category: updated.toJSON() });
  } catch (err) {
    console.error('Update category error:', err.message);
    res.status(500).json({ success: false, message: 'Error updating category' });
  }
};

export const archiveCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    const archived = await category.archive();
    res.status(200).json({ success: true, category: archived.toJSON() });
  } catch (err) {
    console.error('Archive category error:', err.message);
    res.status(500).json({ success: false, message: 'Error archiving category' });
  }
};