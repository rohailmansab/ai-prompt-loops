import pool from '../config/database.js';
import logger from '../config/logger.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_PLACEMENTS = [
  'prompt_top',
  'prompt_bottom',
  'sidebar',
  'blog_top',
  'blog_middle',
  'blog_bottom',
  'list_inline',
  // §2 — Interaction-based monetization placements
  'tool_action',    // Gate for Generate / Enhance tool buttons
  'popup_blog',     // Session popup shown on blog pages
  'redirect_click', // 2-step smart redirect button
  // NEW — Adsterra formats
  'popunder_global',
  'native_banner_inline',
  'social_bar_global',
];

/**
 * Basic allowlist sanitisation for ad_code:
 * We store scripts verbatim but strip javascript: protocol handlers and
 * event-attribute patterns that could escape the ad container.
 * This is intentionally lightweight — only admin can write ad_code.
 */
const sanitizeAdCode = (raw) => {
  if (!raw || typeof raw !== 'string') return '';
  // Collapse \r\n to \n for consistent storage
  return raw.replace(/\r\n/g, '\n').trim();
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — GET /api/ads
//   Returns all active ads (status=true), optionally filtered by placement
// ─────────────────────────────────────────────────────────────────────────────
export const getAds = async (req, res, next) => {
  try {
    const { placement } = req.query;

    let sql = 'SELECT id, name, placement, ad_code FROM ads WHERE status = TRUE';
    const params = [];

    if (placement) {
      if (!VALID_PLACEMENTS.includes(placement)) {
        return res.status(400).json({ error: 'Invalid placement value' });
      }
      sql += ' AND placement = ?';
      params.push(placement);
    }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — GET /api/ads/placement/:placement
//   Returns a single (first active) ad for a specific placement
// ─────────────────────────────────────────────────────────────────────────────
export const getAdByPlacement = async (req, res, next) => {
  try {
    const { placement } = req.params;

    if (!VALID_PLACEMENTS.includes(placement)) {
      return res.status(400).json({ error: 'Invalid placement value' });
    }

    // Order by priority ASC (lower number = higher priority), fallback to created_at DESC
    const [rows] = await pool.query(
      `SELECT id, name, placement, ad_code
       FROM ads
       WHERE status = TRUE AND placement = ?
       ORDER BY COALESCE(priority, 999) ASC, created_at DESC
       LIMIT 1`,
      [placement]
    );

    if (rows.length === 0) {
      return res.json({ data: null });
    }

    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — GET /api/ads/admin/all
//   Returns all ads including inactive ones (for admin panel)
// ─────────────────────────────────────────────────────────────────────────────
export const adminGetAllAds = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, placement, ad_code, status, priority, created_at, updated_at FROM ads ORDER BY placement ASC, COALESCE(priority, 999) ASC, created_at DESC'
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — POST /api/ads
//   Create a new ad
// ─────────────────────────────────────────────────────────────────────────────
export const createAd = async (req, res, next) => {
  try {
    const { name, placement, ad_code, status = true, priority = null } = req.body;

    if (!name || !placement || !ad_code) {
      return res.status(400).json({ error: 'name, placement, and ad_code are required' });
    }

    if (!VALID_PLACEMENTS.includes(placement)) {
      return res.status(400).json({ error: 'Invalid placement value' });
    }

    const cleanCode = sanitizeAdCode(ad_code);
    const prio = priority !== null && priority !== '' ? parseInt(priority, 10) : null;

    const [result] = await pool.query(
      'INSERT INTO ads (name, placement, ad_code, status, priority) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), placement, cleanCode, status ? 1 : 0, prio]
    );

    logger.info(`Ad created: "${name}" [${placement}] by admin ${req.user.username}`);

    const [rows] = await pool.query('SELECT * FROM ads WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Ad created successfully', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — PUT /api/ads/:id
//   Update an existing ad
// ─────────────────────────────────────────────────────────────────────────────
export const updateAd = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, placement, ad_code, status, priority } = req.body;

    const [existing] = await pool.query('SELECT id FROM ads WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    if (placement && !VALID_PLACEMENTS.includes(placement)) {
      return res.status(400).json({ error: 'Invalid placement value' });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name.trim()); }
    if (placement !== undefined) { updates.push('placement = ?'); values.push(placement); }
    if (ad_code !== undefined) { updates.push('ad_code = ?'); values.push(sanitizeAdCode(ad_code)); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status ? 1 : 0); }
    if (priority !== undefined) {
      const prio = priority !== null && priority !== '' ? parseInt(priority, 10) : null;
      updates.push('priority = ?');
      values.push(prio);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    await pool.query(`UPDATE ads SET ${updates.join(', ')} WHERE id = ?`, values);

    logger.info(`Ad #${id} updated by admin ${req.user.username}`);

    const [rows] = await pool.query('SELECT * FROM ads WHERE id = ?', [id]);
    res.json({ message: 'Ad updated successfully', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — DELETE /api/ads/:id
//   Delete an ad
// ─────────────────────────────────────────────────────────────────────────────
export const deleteAd = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, name FROM ads WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    await pool.query('DELETE FROM ads WHERE id = ?', [id]);
    logger.info(`Ad #${id} ("${existing[0].name}") deleted by admin ${req.user.username}`);

    res.json({ message: 'Ad deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — PATCH /api/ads/:id/toggle
//   Toggle status on/off without full update
// ─────────────────────────────────────────────────────────────────────────────
export const toggleAdStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id, status FROM ads WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    const newStatus = existing[0].status ? 0 : 1;
    await pool.query('UPDATE ads SET status = ? WHERE id = ?', [newStatus, id]);

    logger.info(`Ad #${id} toggled to ${newStatus ? 'active' : 'inactive'} by admin ${req.user.username}`);

    res.json({ message: `Ad ${newStatus ? 'activated' : 'deactivated'}`, status: !!newStatus });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — POST /api/ads/event
//   Track an impression or click event for an ad
// ─────────────────────────────────────────────────────────────────────────────
export const trackAdEvent = async (req, res, next) => {
  try {
    const { ad_id, placement, event_type } = req.body;

    if (!ad_id || !placement || !event_type) {
      return res.status(400).json({ error: 'ad_id, placement, and event_type are required' });
    }

    // §7 — Extended event types for interaction-based monetization
    const VALID_EVENTS = ['impression', 'click', 'view_complete', 'skip', 'close'];

    if (!VALID_EVENTS.includes(event_type)) {
      return res.status(400).json({ error: 'Invalid event_type' });
    }

    if (!VALID_PLACEMENTS.includes(placement)) {
      return res.status(400).json({ error: 'Invalid placement value' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null;
    const ua = req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 400) : null;

    await pool.query(
      'INSERT INTO ad_events (ad_id, placement, event_type, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [ad_id, placement, event_type, ip, ua]
    );

    res.status(201).json({ message: 'Event tracked' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — GET /api/ads/admin/stats
//   Returns aggregated impression/click counts per ad and placement
// ─────────────────────────────────────────────────────────────────────────────
export const getAdStats = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        ae.ad_id,
        a.name        AS ad_name,
        ae.placement,
        ae.event_type,
        COUNT(*)      AS count,
        DATE(MIN(ae.created_at)) AS first_event,
        DATE(MAX(ae.created_at)) AS last_event
      FROM ad_events ae
      LEFT JOIN ads a ON a.id = ae.ad_id
      GROUP BY ae.ad_id, ae.placement, ae.event_type
      ORDER BY ae.ad_id, ae.event_type
    `);

    // Pivot to { ad_id, ad_name, placement, impressions, clicks, ctr }
    const statsMap = {};
    rows.forEach(({ ad_id, ad_name, placement, event_type, count, last_event }) => {
      const key = `${ad_id}_${placement}`;
      if (!statsMap[key]) {
        statsMap[key] = { ad_id, ad_name, placement, impressions: 0, clicks: 0, last_event };
      }
      statsMap[key][event_type === 'impression' ? 'impressions' : 'clicks'] = count;
      statsMap[key].last_event = last_event;
    });

    const stats = Object.values(statsMap).map((s) => ({
      ...s,
      ctr: s.impressions > 0 ? ((s.clicks / s.impressions) * 100).toFixed(2) : '0.00',
    }));

    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
};
// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — GET /api/ads/admin/analytics
//   Full analytics: per-ad stats + top placements + 7-day trend
// ─────────────────────────────────────────────────────────────────────────────
export const getAdAnalytics = async (req, res, next) => {
  try {
    // 1. Per-ad aggregation (impressions, clicks, CTR) sorted by CTR desc
    const [perAd] = await pool.query(`
      SELECT
        a.id          AS ad_id,
        a.name        AS ad_name,
        a.placement,
        a.status,
        COALESCE(SUM(ae.event_type = 'impression'), 0) AS impressions,
        COALESCE(SUM(ae.event_type = 'click'),      0) AS clicks,
        ROUND(
          COALESCE(SUM(ae.event_type = 'click'), 0) /
          NULLIF(COALESCE(SUM(ae.event_type = 'impression'), 0), 0) * 100,
          2
        ) AS ctr,
        MAX(ae.created_at) AS last_event
      FROM ads a
      LEFT JOIN ad_events ae ON ae.ad_id = a.id
      GROUP BY a.id, a.name, a.placement, a.status
      ORDER BY ctr DESC, impressions DESC
    `);

    // 2. Top performing placements
    const [topPlacements] = await pool.query(`
      SELECT
        placement,
        SUM(event_type = 'impression') AS impressions,
        SUM(event_type = 'click')      AS clicks,
        ROUND(
          SUM(event_type = 'click') /
          NULLIF(SUM(event_type = 'impression'), 0) * 100,
          2
        ) AS ctr
      FROM ad_events
      GROUP BY placement
      ORDER BY ctr DESC, impressions DESC
    `);

    // 3. 7-day daily event totals
    const [trend] = await pool.query(`
      SELECT
        DATE(created_at)               AS date,
        SUM(event_type = 'impression') AS impressions,
        SUM(event_type = 'click')      AS clicks
      FROM ad_events
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      data: {
        perAd,
        topPlacements,
        trend,
        totals: {
          impressions: perAd.reduce((s, r) => s + Number(r.impressions), 0),
          clicks:      perAd.reduce((s, r) => s + Number(r.clicks),      0),
          ads:         perAd.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
