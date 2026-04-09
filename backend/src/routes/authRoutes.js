import { Router } from 'express';
import {
  login, getProfile, updateProfile, changePassword,
  getDashboardStats, refreshAccessToken, logout, resetCredentials
} from '../controllers/authController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

const router = Router();

// ── Rate Limiters ────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many refresh requests.' },
});

// ── Validation Helper ────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// ── Public Routes ────────────────────────────────────────
router.post('/login',
  loginLimiter,
  [
    body('username').trim().notEmpty().withMessage('Username or Email is required').escape(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// Refresh token (uses HTTP-only cookie, no Bearer token needed)
router.post('/refresh', refreshLimiter, refreshAccessToken);

// Logout (clears HTTP-only cookie)
router.post('/logout', authenticate, logout);

// ── Authenticated Routes ─────────────────────────────────
router.get('/profile', authenticate, getProfile);

router.put('/profile',
  authenticate,
  [
    body('username').optional().trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters').escape(),
    body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  ],
  validate,
  updateProfile
);

router.put('/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  ],
  validate,
  changePassword
);

// ── Admin Routes ─────────────────────────────────────────
router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);

router.put('/admin/reset-credentials',
  authenticate,
  requireAdmin,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .optional({ checkFalsy: true })
      .isLength({ min: 8 }).withMessage('Password does not meet security requirements.')
      .matches(/[A-Z]/).withMessage('Password does not meet security requirements.')
      .matches(/[0-9]/).withMessage('Password does not meet security requirements.'),
    body('newUsername')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters').escape(),
  ],
  validate,
  resetCredentials
);

export default router;
