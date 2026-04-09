import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getPublicSettings,
  getAdminSettings,
  updateSettings,
} from '../controllers/settingsController.js';

const router = express.Router();

// ── Public routes ─────────────────────────────────────────
// GET /api/settings/public  — contact info + about_content visible to everyone
router.get('/public', getPublicSettings);

// ── Admin routes ──────────────────────────────────────────
// GET /api/settings/admin   — full settings list
router.get('/admin', authenticate, requireAdmin, getAdminSettings);

// PUT /api/settings         — bulk-update settings
router.put('/', authenticate, requireAdmin, updateSettings);

export default router;
