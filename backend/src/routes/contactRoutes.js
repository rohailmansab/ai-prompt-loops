import express from 'express';
import { body, validationResult } from 'express-validator';
import logger from '../config/logger.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  submitContact,
  getMessages,
  getUnreadCount,
  toggleRead,
  deleteMessage,
} from '../controllers/contactController.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};

export const verifyRecaptcha = async (req, res, next) => {
  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    logger.warn('Contact attempt without reCAPTCHA token');
    return res.status(400).json({ error: 'reCAPTCHA token is missing. Are you a robot?' });
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET;

    // In dev, bypass verification if no secret key is provided
    if (!secretKey && process.env.NODE_ENV !== 'production') {
      logger.warn('Bypassing reCAPTCHA: Missing secret key in development');
      return next();
    }

    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: secretKey, response: recaptchaToken }),
    });

    const data = await response.json();

    if (!data.success || data.score < 0.5) {
      logger.warn(`reCAPTCHA failed. Score: ${data.score}`);
      return res.status(403).json({ error: 'reCAPTCHA verification failed or score too low.' });
    }

    next();
  } catch (error) {
    logger.error('reCAPTCHA verification error:', error);
    return res.status(500).json({ error: 'Error validating reCAPTCHA' });
  }
};

// ── Public routes ─────────────────────────────────────────
// POST /api/contact  — submit a contact message (validated + recaptcha checked)
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }).escape(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 300 }).escape(),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 5000 }).escape(),
  ],
  validate,
  verifyRecaptcha,
  submitContact
);

// ── Admin routes ──────────────────────────────────────────
// GET  /api/contact/admin               — list all messages
router.get('/admin', authenticate, requireAdmin, getMessages);

// GET  /api/contact/admin/unread-count  — badge count only
router.get('/admin/unread-count', authenticate, requireAdmin, getUnreadCount);

// PATCH /api/contact/:id/read           — toggle read status
router.patch('/:id/read', authenticate, requireAdmin, toggleRead);

// DELETE /api/contact/:id               — delete message
router.delete('/:id', authenticate, requireAdmin, deleteMessage);

export default router;
