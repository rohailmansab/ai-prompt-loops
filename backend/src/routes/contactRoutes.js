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
  const secretKey = process.env.RECAPTCHA_SECRET;

  // No token at all
  if (!recaptchaToken) {
    logger.warn('Contact attempt without reCAPTCHA token');
    return res.status(400).json({ error: 'reCAPTCHA token is missing. Are you a robot?' });
  }

  // 'bypass' token means the frontend site key is not configured.
  // Allow it through so the contact form works without a configured reCAPTCHA pair.
  if (recaptchaToken === 'bypass') {
    logger.warn('reCAPTCHA bypassed: frontend site key not configured (VITE_RECAPTCHA_SITE_KEY missing)');
    return next();
  }

  // No secret key on backend — skip verification
  if (!secretKey) {
    logger.warn('Bypassing reCAPTCHA: RECAPTCHA_SECRET not configured');
    return next();
  }

  try {
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: secretKey, response: recaptchaToken }),
    });

    const data = await response.json();

    // Only hard-block if Google explicitly marks it as invalid (not a score issue).
    // Score threshold removed — v3 scores vary widely across devices/browsers/modes
    // and blocking real users on score alone causes false negatives.
    if (!data.success) {
      logger.warn(`reCAPTCHA verification failed. Error codes: ${(data['error-codes'] || []).join(', ')}`);
      return res.status(403).json({ error: 'reCAPTCHA verification failed. Please try again.' });
    }

    logger.info(`reCAPTCHA passed. Score: ${data.score}`);
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
