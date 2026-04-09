import pool from '../config/database.js';
import logger from '../config/logger.js';

// ── In-Memory Sitemap Cache ──────────────────────────────
let sitemapCache = {
  data: null,
  timestamp: 0,
};

const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

// ── Generate Sitemap.xml ─────────────────────────────────
export const generateSitemap = async (req, res) => {
  try {
    const SITE_URL = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://aipromptloops.me';
    const now = Date.now();

    if (sitemapCache.data && (now - sitemapCache.timestamp < CACHE_TTL)) {
      res.setHeader('Content-Type', 'application/xml');
      return res.status(200).send(sitemapCache.data);
    }

    // Fetch dynamic URLs — exclude noindex pages
    const [prompts] = await pool.query(`
      SELECT slug, updated_at, seo_score
      FROM prompts
      WHERE is_published = TRUE AND (noindex IS NULL OR noindex = FALSE)
      ORDER BY updated_at DESC
    `);

    const [blogPosts] = await pool.query(`
      SELECT slug, updated_at, seo_score
      FROM blog_posts
      WHERE status = 'published' AND (noindex IS NULL OR noindex = FALSE)
      ORDER BY updated_at DESC
    `);

    const [categories] = await pool.query(`
      SELECT slug, updated_at
      FROM categories
      WHERE is_active = TRUE AND (noindex IS NULL OR noindex = FALSE)
      ORDER BY updated_at DESC
    `);

    const today = new Date().toISOString();

    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily', lastmod: today },
      { loc: '/prompts', priority: '0.9', changefreq: 'daily', lastmod: today },
      { loc: '/blog', priority: '0.9', changefreq: 'daily', lastmod: today },
      { loc: '/categories', priority: '0.8', changefreq: 'weekly', lastmod: today },
      { loc: '/tools', priority: '0.8', changefreq: 'weekly', lastmod: today },
      { loc: '/about', priority: '0.5', changefreq: 'monthly', lastmod: today },
      { loc: '/contact', priority: '0.5', changefreq: 'monthly', lastmod: today },
      { loc: '/privacy-policy', priority: '0.3', changefreq: 'monthly', lastmod: today },
      { loc: '/terms', priority: '0.3', changefreq: 'monthly', lastmod: today },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    for (const page of staticPages) {
      xml += `
  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    for (const category of categories) {
      xml += `
  <url>
    <loc>${SITE_URL}/categories/${category.slug}</loc>
    <lastmod>${new Date(category.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    for (const prompt of prompts) {
      // Higher priority for higher SEO score
      const priority = prompt.seo_score >= 70 ? '0.9' : prompt.seo_score >= 40 ? '0.8' : '0.6';
      xml += `
  <url>
    <loc>${SITE_URL}/prompts/${prompt.slug}</loc>
    <lastmod>${new Date(prompt.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }

    for (const post of blogPosts) {
      const priority = post.seo_score >= 70 ? '0.85' : post.seo_score >= 40 ? '0.75' : '0.6';
      xml += `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }

    xml += '\n</urlset>';

    sitemapCache = { data: xml, timestamp: now };

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    logger.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
};

// ── Generate Robots.txt ──────────────────────────────────
export const generateRobotsTxt = (req, res) => {
  const SITE_URL = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://aipromptloops.me';

  const robots = `# AI Prompt Engineering Hub — robots.txt
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /admin/login
Disallow: /api/
Disallow: /uploads/

# Block aggressive bots
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: MJ12bot
Disallow: /

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay for well-behaved bots
Crawl-delay: 1`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(robots);
};

// ── IndexNow API Integration ─────────────────────────────
export const submitToIndexNow = async (urls) => {
  const apiKey = process.env.INDEXNOW_API_KEY;
  const SITE_URL = process.env.SITE_URL || process.env.FRONTEND_URL;

  if (!apiKey || !SITE_URL) {
    logger.warn('IndexNow: Missing API key or SITE_URL, skipping submission');
    return { success: false, reason: 'missing_config' };
  }

  try {
    const host = new URL(SITE_URL).hostname;
    const fullUrls = urls.map(u => u.startsWith('http') ? u : `${SITE_URL}${u}`);

    const payload = {
      host,
      key: apiKey,
      keyLocation: `${SITE_URL}/${apiKey}.txt`,
      urlList: fullUrls,
    };

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const status = response.ok || response.status === 202 ? 'success' : 'failed';
    const responseText = status === 'failed' ? await response.text().catch(() => '') : '';

    // Log to DB
    try {
      await pool.query(
        `INSERT INTO indexnow_log (urls, status, response) VALUES (?, ?, ?)`,
        [JSON.stringify(fullUrls), status, responseText || null]
      );
    } catch (_) {}

    if (status === 'success') {
      logger.info(`IndexNow: Submitted ${fullUrls.length} URLs successfully`);
      return { success: true, submitted: fullUrls.length };
    } else {
      logger.warn(`IndexNow: Submission failed (${response.status}): ${responseText}`);
      return { success: false, status: response.status, body: responseText };
    }
  } catch (error) {
    logger.error(`IndexNow submission error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// ── API endpoint for manual IndexNow submission ──────────
export const triggerIndexNow = async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'urls array is required' });
    }

    if (urls.length > 10000) {
      return res.status(400).json({ error: 'Maximum 10000 URLs per submission' });
    }

    const result = await submitToIndexNow(urls);
    res.json(result);
  } catch (error) {
    logger.error(`IndexNow trigger error: ${error.message}`);
    res.status(500).json({ error: 'Failed to submit to IndexNow' });
  }
};

// ── SEO Dashboard ─────────────────────────────────────────
export const getSeoDashboard = async (req, res) => {
  try {
    // Totals
    const [[{ totalPrompts }]] = await pool.query(`SELECT COUNT(*) as totalPrompts FROM prompts WHERE is_published = TRUE`);
    const [[{ totalBlog }]] = await pool.query(`SELECT COUNT(*) as totalBlog FROM blog_posts WHERE status = 'published'`);
    const totalIndexed = totalPrompts + totalBlog;

    // Missing meta description
    const [[{ missingMetaPrompts }]] = await pool.query(
      `SELECT COUNT(*) as missingMetaPrompts FROM prompts WHERE is_published = TRUE AND (meta_description IS NULL OR meta_description = '')`
    );
    const [[{ missingMetaBlog }]] = await pool.query(
      `SELECT COUNT(*) as missingMetaBlog FROM blog_posts WHERE status = 'published' AND (meta_description IS NULL OR meta_description = '')`
    );

    // Missing seo_title
    const [[{ missingTitlePrompts }]] = await pool.query(
      `SELECT COUNT(*) as missingTitlePrompts FROM prompts WHERE is_published = TRUE AND (seo_title IS NULL OR seo_title = '')`
    );
    const [[{ missingTitleBlog }]] = await pool.query(
      `SELECT COUNT(*) as missingTitleBlog FROM blog_posts WHERE status = 'published' AND (seo_title IS NULL OR seo_title = '')`
    );

    // Missing focus keyword
    const [[{ missingKwPrompts }]] = await pool.query(
      `SELECT COUNT(*) as missingKwPrompts FROM prompts WHERE is_published = TRUE AND (focus_keyword IS NULL OR focus_keyword = '')`
    );
    const [[{ missingKwBlog }]] = await pool.query(
      `SELECT COUNT(*) as missingKwBlog FROM blog_posts WHERE status = 'published' AND (focus_keyword IS NULL OR focus_keyword = '')`
    );

    // Missing OG image
    const [[{ missingOgPrompts }]] = await pool.query(
      `SELECT COUNT(*) as missingOgPrompts FROM prompts WHERE is_published = TRUE AND (og_image IS NULL OR og_image = '')`
    );
    const [[{ missingOgBlog }]] = await pool.query(
      `SELECT COUNT(*) as missingOgBlog FROM blog_posts WHERE status = 'published' AND (og_image IS NULL OR og_image = '')`
    );

    // Low SEO score (< 40) pages
    const [[{ lowScorePrompts }]] = await pool.query(
      `SELECT COUNT(*) as lowScorePrompts FROM prompts WHERE is_published = TRUE AND seo_score < 40`
    );
    const [[{ lowScoreBlog }]] = await pool.query(
      `SELECT COUNT(*) as lowScoreBlog FROM blog_posts WHERE status = 'published' AND seo_score < 40`
    );

    // Average scores
    const [[{ avgPromptScore }]] = await pool.query(`SELECT AVG(seo_score) as avgPromptScore FROM prompts WHERE is_published = TRUE`);
    const [[{ avgBlogScore }]] = await pool.query(`SELECT AVG(seo_score) as avgBlogScore FROM blog_posts WHERE status = 'published'`);

    // Top pages (by views)
    const [topPrompts] = await pool.query(
      `SELECT title, slug, views, seo_score, 'prompt' as type FROM prompts WHERE is_published = TRUE ORDER BY views DESC LIMIT 5`
    );
    const [topBlog] = await pool.query(
      `SELECT title, slug, views, seo_score, 'blog' as type FROM blog_posts WHERE status = 'published' ORDER BY views DESC LIMIT 5`
    );
    const topPages = [...topPrompts, ...topBlog].sort((a, b) => b.views - a.views).slice(0, 10);

    // Keyword tracking table
    const [keywords] = await pool.query(
      `SELECT * FROM seo_keywords_tracking ORDER BY impressions DESC LIMIT 50`
    );

    // Warnings list
    const warnings = [];
    if (missingMetaPrompts + missingMetaBlog > 0) {
      warnings.push({ type: 'error', message: `${missingMetaPrompts + missingMetaBlog} pages missing meta description` });
    }
    if (missingTitlePrompts + missingTitleBlog > 0) {
      warnings.push({ type: 'warning', message: `${missingTitlePrompts + missingTitleBlog} pages missing SEO title` });
    }
    if (missingKwPrompts + missingKwBlog > 0) {
      warnings.push({ type: 'warning', message: `${missingKwPrompts + missingKwBlog} pages missing focus keyword` });
    }
    if (missingOgPrompts + missingOgBlog > 0) {
      warnings.push({ type: 'info', message: `${missingOgPrompts + missingOgBlog} pages missing OG image` });
    }
    if (lowScorePrompts + lowScoreBlog > 0) {
      warnings.push({ type: 'warning', message: `${lowScorePrompts + lowScoreBlog} pages have SEO score below 40` });
    }

    // Duplicate slug check
    const [dupSlugsPrompts] = await pool.query(
      `SELECT slug, COUNT(*) as cnt FROM prompts GROUP BY slug HAVING cnt > 1`
    );
    const [dupSlugsBlog] = await pool.query(
      `SELECT slug, COUNT(*) as cnt FROM blog_posts GROUP BY slug HAVING cnt > 1`
    );
    if (dupSlugsPrompts.length + dupSlugsBlog.length > 0) {
      warnings.push({ type: 'error', message: `${dupSlugsPrompts.length + dupSlugsBlog.length} duplicate slugs detected!` });
    }

    const totalMissingMeta = missingMetaPrompts + missingMetaBlog;
    const totalLowScore = lowScorePrompts + lowScoreBlog;
    const pagesOptimizedPct = totalIndexed > 0
      ? Math.round(((totalIndexed - totalMissingMeta) / totalIndexed) * 100)
      : 0;

    res.json({
      summary: {
        totalIndexed,
        missingMeta: totalMissingMeta,
        missingTitle: missingTitlePrompts + missingTitleBlog,
        missingKeyword: missingKwPrompts + missingKwBlog,
        missingOgImage: missingOgPrompts + missingOgBlog,
        lowSeoScore: totalLowScore,
        avgSeoScore: Math.round(((avgPromptScore || 0) + (avgBlogScore || 0)) / 2),
        pagesOptimizedPct,
      },
      topPages,
      keywords,
      warnings,
    });
  } catch (error) {
    logger.error('SEO dashboard error:', error);
    res.status(500).json({ error: 'Failed to load SEO dashboard' });
  }
};

// ── Keyword Tracking (upsert) ─────────────────────────────
export const upsertKeyword = async (req, res) => {
  try {
    const { keyword, page_slug, impressions, clicks, position } = req.body;
    if (!keyword || !page_slug) return res.status(400).json({ error: 'keyword and page_slug are required' });

    await pool.query(
      `INSERT INTO seo_keywords_tracking (keyword, page_slug, impressions, clicks, position)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         impressions = impressions + VALUES(impressions),
         clicks = clicks + VALUES(clicks),
         position = VALUES(position),
         updated_at = CURRENT_TIMESTAMP`,
      [keyword, page_slug, impressions || 0, clicks || 0, position || 0]
    ).catch(async () => {
      // fallback if no UNIQUE index — just insert
      await pool.query(
        `INSERT INTO seo_keywords_tracking (keyword, page_slug, impressions, clicks, position)
         VALUES (?, ?, ?, ?, ?)`,
        [keyword, page_slug, impressions || 0, clicks || 0, position || 0]
      );
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Low SEO score pages list ──────────────────────────────
export const getLowSeoPages = async (req, res) => {
  try {
    const [prompts] = await pool.query(
      `SELECT id, title, slug, seo_score, 'prompt' as type, focus_keyword, meta_description, seo_title
       FROM prompts WHERE is_published = TRUE AND seo_score < 60 ORDER BY seo_score ASC LIMIT 20`
    );
    const [blog] = await pool.query(
      `SELECT id, title, slug, seo_score, 'blog' as type, focus_keyword, meta_description, seo_title
       FROM blog_posts WHERE status = 'published' AND seo_score < 60 ORDER BY seo_score ASC LIMIT 20`
    );
    res.json({ data: [...prompts, ...blog].sort((a, b) => a.seo_score - b.seo_score) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── SEO Audit Report ──────────────────────────────────────
export const getSeoAuditReport = async (req, res) => {
  try {
    const [allPrompts] = await pool.query(
      `SELECT id, title, slug, seo_title, meta_description, focus_keyword, og_image, seo_score,
              noindex, schema_type, is_published
       FROM prompts WHERE is_published = TRUE`
    );
    const [allBlog] = await pool.query(
      `SELECT id, title, slug, seo_title, meta_description, focus_keyword, og_image, seo_score,
              noindex, schema_type, status
       FROM blog_posts WHERE status = 'published'`
    );

    const all = [
      ...allPrompts.map(p => ({ ...p, type: 'prompt' })),
      ...allBlog.map(p => ({ ...p, type: 'blog' })),
    ];

    const errors = [];
    for (const page of all) {
      const pageErrors = [];
      if (!page.seo_title) pageErrors.push('Missing SEO title');
      if (!page.meta_description) pageErrors.push('Missing meta description');
      if (!page.focus_keyword) pageErrors.push('Missing focus keyword');
      if (!page.og_image) pageErrors.push('Missing OG image');
      if (page.seo_score < 40) pageErrors.push(`Low SEO score: ${page.seo_score}`);
      if (pageErrors.length > 0) {
        errors.push({ type: page.type, title: page.title, slug: page.slug, errors: pageErrors, seoScore: page.seo_score });
      }
    }

    const avgScore = all.length > 0
      ? Math.round(all.reduce((sum, p) => sum + (p.seo_score || 0), 0) / all.length)
      : 0;

    const optimized = all.filter(p => p.seo_score >= 60).length;
    const optimizedPct = all.length > 0 ? Math.round((optimized / all.length) * 100) : 0;

    res.json({
      totalPages: all.length,
      optimizedPages: optimized,
      optimizedPct,
      avgSeoScore: avgScore,
      errorPages: errors.length,
      errors: errors.slice(0, 50),
      seoReadiness: optimizedPct >= 80 ? '🟢 Good' : optimizedPct >= 50 ? '🟡 Needs Work' : '🔴 Critical',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Invalidate sitemap cache ──────────────────────────────
export const invalidateSitemapCache = () => {
  sitemapCache = { data: null, timestamp: 0 };
};
