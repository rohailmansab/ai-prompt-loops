import pool from '../config/database.js';
import logger from '../config/logger.js';

const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:')) {
    return trimmed;
  }
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return '#';
  return trimmed;
};

const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/<[^>]*>/g, '').trim();
};

export const getFooter = async (req, res, next) => {
  try {
    const [[settings]] = await pool.query('SELECT * FROM footer_settings ORDER BY id ASC LIMIT 1');
    const [links] = await pool.query('SELECT id, label, url, position, is_visible, column_group FROM footer_links WHERE is_visible = TRUE ORDER BY position ASC');
    const [socials] = await pool.query('SELECT id, platform, url, position, is_visible FROM footer_socials WHERE is_visible = TRUE ORDER BY position ASC');

    res.json({
      data: {
        ...(settings || {}),
        links,
        socials,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const adminGetFooter = async (req, res, next) => {
  try {
    const [[settings]] = await pool.query('SELECT * FROM footer_settings ORDER BY id ASC LIMIT 1');
    const [links] = await pool.query('SELECT * FROM footer_links ORDER BY position ASC');
    const [socials] = await pool.query('SELECT * FROM footer_socials ORDER BY position ASC');

    res.json({ data: { ...(settings || {}), links, socials } });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { site_name, footer_text, copyright_text, show_footer, show_social } = req.body;
    const [[existing]] = await pool.query('SELECT id FROM footer_settings LIMIT 1');
    
    if (existing) {
      await pool.query(
        `UPDATE footer_settings SET site_name=?, footer_text=?, copyright_text=?, show_footer=?, show_social=?, updated_at=NOW() WHERE id=?`,
        [sanitizeText(site_name), sanitizeText(footer_text), sanitizeText(copyright_text), show_footer ? 1 : 0, show_social ? 1 : 0, existing.id]
      );
    } else {
      await pool.query(
        `INSERT INTO footer_settings (site_name, footer_text, copyright_text, show_footer, show_social) VALUES (?,?,?,?,?)`,
        [sanitizeText(site_name), sanitizeText(footer_text), sanitizeText(copyright_text), show_footer ? 1 : 0, show_social ? 1 : 0]
      );
    }
    const [[updated]] = await pool.query('SELECT * FROM footer_settings LIMIT 1');
    res.json({ message: 'Footer settings updated', data: updated });
  } catch (err) {
    next(err);
  }
};

export const createLink = async (req, res, next) => {
  try {
    const { label, url, position, column_group } = req.body;
    const [result] = await pool.query(
      'INSERT INTO footer_links (label, url, position, column_group, is_visible) VALUES (?, ?, ?, ?, TRUE)',
      [sanitizeText(label), sanitizeUrl(url), position ?? 0, sanitizeText(column_group)]
    );
    const [[link]] = await pool.query('SELECT * FROM footer_links WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Link created', data: link });
  } catch (err) {
    next(err);
  }
};

export const updateLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, url, position, column_group, is_visible } = req.body;
    await pool.query(
      'UPDATE footer_links SET label=?, url=?, position=?, column_group=?, is_visible=?, updated_at=NOW() WHERE id=?',
      [sanitizeText(label), sanitizeUrl(url), position ?? 0, sanitizeText(column_group), is_visible ? 1 : 0, id]
    );
    const [[updated]] = await pool.query('SELECT * FROM footer_links WHERE id = ?', [id]);
    res.json({ message: 'Link updated', data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM footer_links WHERE id = ?', [id]);
    res.json({ message: 'Link deleted' });
  } catch (err) {
    next(err);
  }
};

export const toggleLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[existing]] = await pool.query('SELECT is_visible FROM footer_links WHERE id = ?', [id]);
    const newStatus = existing.is_visible ? 0 : 1;
    await pool.query('UPDATE footer_links SET is_visible=?, updated_at=NOW() WHERE id=?', [newStatus, id]);
    res.json({ message: 'Link toggled', is_visible: !!newStatus });
  } catch (err) {
    next(err);
  }
};

export const createSocial = async (req, res, next) => {
  try {
    const { platform, url, position } = req.body;
    const [result] = await pool.query(
      'INSERT INTO footer_socials (platform, url, position, is_visible) VALUES (?, ?, ?, TRUE)',
      [sanitizeText(platform).toLowerCase(), sanitizeUrl(url), position ?? 0]
    );
    const [[social]] = await pool.query('SELECT * FROM footer_socials WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Social created', data: social });
  } catch (err) {
    next(err);
  }
};

export const updateSocial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { platform, url, position, is_visible } = req.body;
    await pool.query(
      'UPDATE footer_socials SET platform=?, url=?, position=?, is_visible=?, updated_at=NOW() WHERE id=?',
      [sanitizeText(platform).toLowerCase(), sanitizeUrl(url), position ?? 0, is_visible ? 1 : 0, id]
    );
    const [[updated]] = await pool.query('SELECT * FROM footer_socials WHERE id = ?', [id]);
    res.json({ message: 'Social updated', data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteSocial = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM footer_socials WHERE id = ?', [id]);
    res.json({ message: 'Social deleted' });
  } catch (err) {
    next(err);
  }
};

export const toggleSocial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[existing]] = await pool.query('SELECT is_visible FROM footer_socials WHERE id = ?', [id]);
    const newStatus = existing.is_visible ? 0 : 1;
    await pool.query('UPDATE footer_socials SET is_visible=?, updated_at=NOW() WHERE id=?', [newStatus, id]);
    res.json({ message: 'Social toggled', is_visible: !!newStatus });
  } catch (err) {
    next(err);
  }
};
