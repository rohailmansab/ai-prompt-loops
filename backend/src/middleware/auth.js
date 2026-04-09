import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Authenticate middleware — supports both:
 * 1. Bearer token in Authorization header (primary)
 * 2. HTTP-only cookie refresh flow (fallback)
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    const [users] = await pool.query(
      'SELECT id, username, email, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`, { ip: req.ip });
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Role-based access control — Admin only
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn(`Unauthorized admin access attempt by user: ${req.user?.username || 'unknown'}`, { ip: req.ip, path: req.originalUrl });
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * Role-based access control — Editor or Admin
 */
export const requireEditor = (req, res, next) => {
  if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
    logger.warn(`Unauthorized editor access attempt by user: ${req.user?.username || 'unknown'}`, { ip: req.ip, path: req.originalUrl });
    return res.status(403).json({ error: 'Editor access required' });
  }
  next();
};
