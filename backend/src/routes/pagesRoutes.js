import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getPageBySlug,
  adminGetAllPages,
  adminGetPage,
  updatePage,
  togglePage,
} from '../controllers/pagesController.js';

const router = express.Router();

// ── Public routes ─────────────────────────────────────────
// GET /api/pages/:slug  — published page by slug
// NOTE: the /admin prefix must come first to avoid ':slug' swallowing it
router.get('/admin/all', authenticate, requireAdmin, adminGetAllPages);
router.get('/admin/:id', authenticate, requireAdmin, adminGetPage);

// ── Admin routes ──────────────────────────────────────────
// PUT  /api/pages/:id         — full update
router.put('/:id', authenticate, requireAdmin, updatePage);

// PATCH /api/pages/:id/toggle — publish/unpublish
router.patch('/:id/toggle', authenticate, requireAdmin, togglePage);

// Public slug route (must be last to avoid swallowing /admin/* paths)
router.get('/:slug', getPageBySlug);

export default router;
