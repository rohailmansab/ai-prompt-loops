import express from 'express';
import {
  getAds,
  getAdByPlacement,
  adminGetAllAds,
  createAd,
  updateAd,
  deleteAd,
  toggleAdStatus,
  trackAdEvent,
  getAdStats,
  getAdAnalytics,
} from '../controllers/adsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ── Public routes ─────────────────────────────────────────
// GET  /api/ads?placement=prompt_top   — all active ads (optional filter)
router.get('/', getAds);

// GET  /api/ads/placement/:placement   — first active ad for a placement
router.get('/placement/:placement', getAdByPlacement);

// POST /api/ads/event                  — track impression or click (public, fire-and-forget)
router.post('/event', trackAdEvent);

// ── Admin routes (auth required) ──────────────────────────
// GET  /api/ads/admin/all              — all ads incl. inactive
router.get('/admin/all', authenticate, requireAdmin, adminGetAllAds);

// GET  /api/ads/admin/stats            — impression/click stats per ad
router.get('/admin/stats', authenticate, requireAdmin, getAdStats);

// GET  /api/ads/admin/analytics        — full analytics dashboard data
router.get('/admin/analytics', authenticate, requireAdmin, getAdAnalytics);

// POST /api/ads                        — create ad
router.post('/', authenticate, requireAdmin, createAd);

// PUT  /api/ads/:id                    — update ad
router.put('/:id', authenticate, requireAdmin, updateAd);

// PATCH /api/ads/:id/toggle            — toggle status
router.patch('/:id/toggle', authenticate, requireAdmin, toggleAdStatus);

// DELETE /api/ads/:id                  — delete ad
router.delete('/:id', authenticate, requireAdmin, deleteAd);

export default router;
