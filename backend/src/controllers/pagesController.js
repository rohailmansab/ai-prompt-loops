import pool from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Lightweight server-side HTML sanitiser.
 * Removes <script>, on* event attrs, and javascript: hrefs.
 * Admin-only input, so this is defence-in-depth.
 */
const sanitizeHtml = (raw) => {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/ on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*["']?\s*javascript\s*:/gi, 'href="#"');
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — GET /api/pages/:slug
// Returns the page only if is_published = true; 404 otherwise.
// ─────────────────────────────────────────────────────────────────────────────
export const getPageBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const [rows] = await pool.query(
      `SELECT id, title, slug, content, meta_title, meta_description, is_published, updated_at
       FROM pages WHERE slug = ? LIMIT 1`,
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const page = rows[0];

    // MySQL tinyint / driver types: normalize so 1 is published
    const pub = page.is_published;
    const isLive =
      pub === true ||
      pub === 1 ||
      pub === '1' ||
      (Buffer.isBuffer(pub) && pub.length && pub[0] === 1);

    if (!isLive) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ data: page });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — GET /api/pages/admin/all
// Returns all pages including unpublished ones.
// ─────────────────────────────────────────────────────────────────────────────
export const adminGetAllPages = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, slug, meta_title, meta_description, is_published, created_at, updated_at
       FROM pages ORDER BY id ASC`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — GET /api/pages/admin/:id
// Returns full page data for the editor.
// ─────────────────────────────────────────────────────────────────────────────
export const adminGetPage = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM pages WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — PUT /api/pages/:id
// Full update of a page's editable fields.
// ─────────────────────────────────────────────────────────────────────────────
export const updatePage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, meta_title, meta_description, is_published } = req.body;

    // Validate
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (title.length > 255) {
      return res.status(400).json({ error: 'Title must be 255 characters or less' });
    }
    if (meta_title && meta_title.length > 255) {
      return res.status(400).json({ error: 'Meta title must be 255 characters or less' });
    }
    if (meta_description && meta_description.length > 500) {
      return res.status(400).json({ error: 'Meta description must be 500 characters or less' });
    }

    const [existing] = await pool.query('SELECT id FROM pages WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const sanitizedContent = sanitizeHtml(content || '');

    await pool.query(
      `UPDATE pages
       SET title = ?, content = ?, meta_title = ?, meta_description = ?, is_published = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        title.trim(),
        sanitizedContent,
        (meta_title || '').trim(),
        (meta_description || '').trim(),
        is_published ? 1 : 0,
        id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM pages WHERE id = ?', [id]);

    logger.info(`Page "${updated[0].slug}" updated by admin ${req.user.username}`);
    res.json({ message: 'Page updated successfully', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — PATCH /api/pages/:id/toggle
// Toggle the is_published status.
// ─────────────────────────────────────────────────────────────────────────────
export const togglePage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id, slug, is_published FROM pages WHERE id = ?', [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const newStatus = existing[0].is_published ? 0 : 1;
    await pool.query(
      'UPDATE pages SET is_published = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );

    logger.info(`Page "${existing[0].slug}" ${newStatus ? 'published' : 'unpublished'} by admin ${req.user.username}`);
    res.json({
      message: `Page ${newStatus ? 'published' : 'unpublished'} successfully`,
      is_published: !!newStatus,
    });
  } catch (err) {
    next(err);
  }
};
