import pool from '../config/database.js';
import { slugify, generateSchemaMarkup } from '../utils/helpers.js';

export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM prompts p WHERE p.category_id = c.id AND p.is_published = TRUE) as prompt_count
       FROM categories c
       WHERE c.is_active = TRUE
       ORDER BY c.sort_order ASC, c.name ASC`
    );

    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const [categories] = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM prompts p WHERE p.category_id = c.id AND p.is_published = TRUE) as prompt_count
       FROM categories c
       WHERE c.slug = ? AND c.is_active = TRUE`,
      [slug]
    );

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = categories[0];
    category.schema_markup = generateSchemaMarkup('category', category);

    res.json({ data: category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color, image, parent_id, sort_order,
            meta_title, meta_description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const slug = slugify(name);

    const [result] = await pool.query(
      `INSERT INTO categories (name, slug, description, icon, color, image, parent_id, sort_order,
       meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description, icon, color || '#6366f1', image, parent_id,
       sort_order || 0, meta_title || name, meta_description || description]
    );

    res.status(201).json({ id: result.insertId, slug, message: 'Category created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    if (fields.name) {
      fields.slug = slugify(fields.name);
    }

    const allowedFields = ['name', 'slug', 'description', 'icon', 'color', 'image',
                           'parent_id', 'sort_order', 'is_active', 'meta_title', 'meta_description'];

    const updates = Object.keys(fields)
      .filter(k => allowedFields.includes(k))
      .map(k => `${k} = ?`);

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const values = Object.keys(fields)
      .filter(k => allowedFields.includes(k))
      .map(k => fields[k]);

    await pool.query(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      [...values, id]
    );

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Set prompts in this category to uncategorized
    await pool.query('UPDATE prompts SET category_id = NULL WHERE category_id = ?', [id]);
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: get all categories including inactive
export const adminGetAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM prompts p WHERE p.category_id = c.id) as prompt_count
       FROM categories c
       ORDER BY c.sort_order ASC, c.name ASC`
    );
    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
