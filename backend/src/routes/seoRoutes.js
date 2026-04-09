import { Router } from 'express';
import pool from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  triggerIndexNow,
  getSeoDashboard,
  upsertKeyword,
  getLowSeoPages,
  getSeoAuditReport,
} from '../controllers/seoController.js';

const router = Router();

// ── Keyword tracking (public upsert, called by analytics) ─
router.post('/keywords', upsertKeyword);

// ── Admin SEO endpoints ───────────────────────────────────
router.get('/dashboard', authenticate, requireAdmin, getSeoDashboard);
router.get('/low-score', authenticate, requireAdmin, getLowSeoPages);
router.get('/audit', authenticate, requireAdmin, getSeoAuditReport);
router.post('/indexnow', authenticate, requireAdmin, triggerIndexNow);

// ── IndexNow log ──────────────────────────────────────────
router.get('/indexnow-log', authenticate, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM indexnow_log ORDER BY created_at DESC LIMIT 50`
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Slug redirect lookup ──────────────────────────────────
router.get('/redirect/:type/:slug', async (req, res) => {
  try {
    const { type, slug } = req.params;
    const [rows] = await pool.query(
      `SELECT new_slug FROM slug_redirects WHERE old_slug = ? AND content_type = ? ORDER BY created_at DESC LIMIT 1`,
      [slug, type]
    );
    if (rows.length > 0) {
      return res.json({ redirect: true, newSlug: rows[0].new_slug });
    }
    res.json({ redirect: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
