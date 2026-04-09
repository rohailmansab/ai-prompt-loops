import pool from '../config/database.js';
import logger from '../config/logger.js';

// Allowed public-facing keys (no sensitive keys exposed)
const PUBLIC_KEYS = [
  'contact_email',
  'contact_phone',
  'contact_address',
  'show_email',
  'show_phone',
  'show_address',
  'about_content',
];

// All writable keys
const ALL_KEYS = [...PUBLIC_KEYS];

/**
 * Very lightweight HTML sanitiser for about_content.
 * Strips <script>, event handlers, and javascript: hrefs.
 * Only admin can write this field so this is a defence-in-depth measure.
 */
const sanitizeHtml = (raw) => {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '');
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — GET /api/settings/public
//   Returns subset of settings visible to the public (no auth required)
// ─────────────────────────────────────────────────────────────────────────────
export const getPublicSettings = async (req, res, next) => {
  try {
    const placeholders = PUBLIC_KEYS.map(() => '?').join(', ');
    const [rows] = await pool.query(
      `SELECT \`key\`, value FROM site_settings WHERE \`key\` IN (${placeholders})`,
      PUBLIC_KEYS
    );

    // Build a plain object map
    const settings = {};
    for (const { key, value } of rows) {
      settings[key] = value;
    }

    // Fill in any missing keys with empty defaults
    for (const k of PUBLIC_KEYS) {
      if (!(k in settings)) settings[k] = '';
    }

    res.json({ data: settings });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — GET /api/settings/admin
//   Returns ALL settings (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT `key`, value, updated_at FROM site_settings ORDER BY `key` ASC'
    );

    const settings = {};
    for (const { key, value } of rows) {
      settings[key] = value;
    }

    // Ensure all expected keys are present
    for (const k of ALL_KEYS) {
      if (!(k in settings)) settings[k] = '';
    }

    res.json({ data: settings });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — PUT /api/settings
//   Bulk-update site settings (UPSERT). Admin only.
//   Body: { contact_email: "...", show_email: "true", about_content: "<p>...</p>", ... }
// ─────────────────────────────────────────────────────────────────────────────
export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;

    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({ error: 'Request body must be a key-value object' });
    }

    const entries = Object.entries(updates).filter(([k]) => ALL_KEYS.includes(k));

    if (entries.length === 0) {
      return res.status(400).json({ error: 'No valid settings keys provided' });
    }

    // Validate individual values
    for (const [key, value] of entries) {
      if (typeof value !== 'string') {
        return res.status(400).json({ error: `Value for "${key}" must be a string` });
      }
      if (key === 'contact_email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return res.status(400).json({ error: 'Invalid email address format' });
      }
      if (value.length > 100000) {
        return res.status(400).json({ error: `Value for "${key}" exceeds maximum length` });
      }
    }

    // Upsert each key
    for (const [key, raw] of entries) {
      const value = key === 'about_content' ? sanitizeHtml(raw) : raw.trim();
      await pool.query(
        'INSERT INTO site_settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW()',
        [key, value, value]
      );
    }

    logger.info(`Site settings updated by admin ${req.user.username}: ${entries.map(([k]) => k).join(', ')}`);

    // Return updated settings
    const [rows] = await pool.query('SELECT `key`, value FROM site_settings');
    const settings = {};
    for (const { key, value } of rows) settings[key] = value;

    res.json({ message: 'Settings updated successfully', data: settings });
  } catch (err) {
    next(err);
  }
};
