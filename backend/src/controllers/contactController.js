import pool from '../config/database.js';
import logger from '../config/logger.js';

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — POST /api/contact
//   Save a contact message to DB (called after reCAPTCHA passes in router)
// ─────────────────────────────────────────────────────────────────────────────
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    await pool.query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), subject.trim(), message.trim()]
    );

    logger.info(`Contact message saved from: ${email}`);
    res.status(201).json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — GET /api/contact/admin
//   List all messages newest-first. Admin only.
// ─────────────────────────────────────────────────────────────────────────────
export const getMessages = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT id, name, email, subject, message, is_read, created_at
       FROM contact_messages
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM contact_messages');
    const [[{ unread }]] = await pool.query(
      'SELECT COUNT(*) AS unread FROM contact_messages WHERE is_read = FALSE'
    );

    res.json({
      data: rows,
      meta: { total, unread, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — GET /api/contact/admin/unread-count
//   Lightweight poll endpoint for the navbar badge. Admin only.
// ─────────────────────────────────────────────────────────────────────────────
export const getUnreadCount = async (req, res, next) => {
  try {
    const [[{ unread }]] = await pool.query(
      'SELECT COUNT(*) AS unread FROM contact_messages WHERE is_read = FALSE'
    );
    res.json({ unread });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — PATCH /api/contact/:id/read
//   Toggle is_read status. Admin only.
// ─────────────────────────────────────────────────────────────────────────────
export const toggleRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id, is_read FROM contact_messages WHERE id = ?', [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const newRead = existing[0].is_read ? 0 : 1;
    await pool.query('UPDATE contact_messages SET is_read = ? WHERE id = ?', [newRead, id]);

    res.json({ message: `Message marked as ${newRead ? 'read' : 'unread'}`, is_read: !!newRead });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — DELETE /api/contact/:id
//   Delete a message permanently. Admin only.
// ─────────────────────────────────────────────────────────────────────────────
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM contact_messages WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
    logger.info(`Contact message #${id} deleted by admin ${req.user.username}`);

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    next(err);
  }
};
