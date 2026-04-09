import pool from '../config/database.js';

export const trackEvent = async (req, res) => {
  try {
    const { event_type, path, item_id, duration } = req.body;
    
    // Validate basic inputs
    if (!event_type) {
      return res.status(400).json({ error: 'event_type is required' });
    }

    const user_agent = req.headers['user-agent'] || '';
    const ip_address = req.ip || req.connection.remoteAddress || '';

    await pool.query(
      `INSERT INTO analytics_events (event_type, path, item_id, duration, user_agent, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [event_type, path || null, item_id || null, duration || 0, user_agent, ip_address]
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    // Do not fail the client request if analytics fail
    res.status(200).json({ success: false, error: 'Failed to record event' });
  }
};

export const getAnalyticsDashboard = async (req, res) => {
  try {
    // 1. Total views
    const [[viewsRow]] = await pool.query(`SELECT COUNT(*) as total FROM analytics_events WHERE event_type = "page_view"`);
    
    // 2. Total prompt copies
    const [[copiesRow]] = await pool.query(`SELECT COUNT(*) as total FROM analytics_events WHERE event_type = "prompt_copy"`);
    
    // 3. Total tool usages
    const [[toolRow]] = await pool.query(`SELECT COUNT(*) as total FROM analytics_events WHERE event_type = "tool_usage"`);

    // 4. Avg engagement time
    const [[engagementRow]] = await pool.query(`SELECT AVG(duration) as avg_duration FROM analytics_events WHERE event_type = "engagement_time"`);

    // 5. Popular prompts (by copy)
    const [popularPrompts] = await pool.query(`
      SELECT p.title, COUNT(a.id) as actions_count 
      FROM analytics_events a 
      JOIN prompts p ON a.item_id = p.slug 
      WHERE a.event_type = 'prompt_copy' 
      GROUP BY p.title 
      ORDER BY actions_count DESC 
      LIMIT 5
    `);

    // fallback popular prompts by view if copies are empty
    let finalPopularPrompts = popularPrompts;
    if (finalPopularPrompts.length === 0) {
      const [popularByView] = await pool.query(`
        SELECT title, views as actions_count 
        FROM prompts 
        ORDER BY views DESC 
        LIMIT 5
      `);
      finalPopularPrompts = popularByView;
    }

    // 6. Page views over time (last 7 days grouped by day)
    const [viewsOverTime] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM analytics_events 
      WHERE event_type = "page_view" AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at) 
      ORDER BY date ASC
    `);

    res.json({
      totalViews: viewsRow.total || 0,
      totalCopies: copiesRow.total || 0,
      totalToolUsage: toolRow.total || 0,
      avgEngagementTime: Math.round(engagementRow.avg_duration || 0),
      popularPrompts: finalPopularPrompts,
      viewsOverTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
