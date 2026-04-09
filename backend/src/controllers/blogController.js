import pool from '../config/database.js';
import {
  slugify, generateSchemaMarkup, paginate, buildPaginationMeta,
  buildSeoMeta, generateBlogPostingSchema, generateFAQSchema,
  generateBreadcrumbSchema, TOOL_LINK,
} from '../utils/helpers.js';
import { generateSEO, validateSEO } from '../utils/seoEngine.js';
import { submitToIndexNow } from './seoController.js';

export const getAllBlogPosts = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const { category, search, featured } = req.query;

    let whereClause = "WHERE bp.status = 'published'";
    const params = [];

    if (category) { whereClause += ' AND bp.category = ?'; params.push(category); }
    if (featured === 'true') { whereClause += ' AND bp.is_featured = TRUE'; }
    if (search) {
      whereClause += ' AND (MATCH(bp.title, bp.excerpt, bp.content) AGAINST(? IN BOOLEAN MODE) OR bp.title LIKE ?)';
      params.push(search, `%${search}%`);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM blog_posts bp ${whereClause}`, params
    );

    const [posts] = await pool.query(
      `SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.featured_image, bp.category,
              bp.tags, bp.views, bp.reading_time, bp.is_featured, bp.published_at, bp.created_at,
              bp.seo_score,
              u.username as author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       ${whereClause}
       ORDER BY bp.is_featured DESC, bp.published_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      data: posts,
      pagination: buildPaginationMeta(countResult[0].total, page, limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Check for 301 redirect
    const [redirects] = await pool.query(
      `SELECT new_slug FROM slug_redirects WHERE old_slug = ? AND content_type = 'blog' LIMIT 1`,
      [slug]
    );
    if (redirects.length > 0) {
      return res.redirect(301, `/blog/${redirects[0].new_slug}`);
    }

    const [posts] = await pool.query(
      `SELECT bp.*, u.username as author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.slug = ? AND bp.status = 'published'`,
      [slug]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    await pool.query('UPDATE blog_posts SET views = views + 1 WHERE slug = ?', [slug]);

    const post = posts[0];

    // Related prompts (tag-matched)
    const postTags = typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []);
    let relatedPrompts = [];
    if (postTags.length > 0) {
      const tagConds = postTags.slice(0, 3).map(() => 'p.tags LIKE ?').join(' OR ');
      const tagParams = postTags.slice(0, 3).map(t => `%${t}%`);
      const [matched] = await pool.query(
        `SELECT p.id, p.title, p.slug, p.description, p.difficulty,
                c.name as category_name, c.icon as category_icon
         FROM prompts p LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.is_published = TRUE AND (${tagConds})
         ORDER BY RAND() LIMIT 3`,
        tagParams
      );
      relatedPrompts = matched;
    }
    if (relatedPrompts.length < 3) {
      const existingIds = relatedPrompts.map(p => p.id);
      const exclude = existingIds.length ? `AND p.id NOT IN (${existingIds.map(() => '?').join(',')})` : '';
      const [extra] = await pool.query(
        `SELECT p.id, p.title, p.slug, p.description, p.difficulty,
                c.name as category_name, c.icon as category_icon
         FROM prompts p LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.is_published = TRUE ${exclude}
         ORDER BY RAND() LIMIT ?`,
        [...existingIds, 3 - relatedPrompts.length]
      );
      relatedPrompts = [...relatedPrompts, ...extra];
    }

    // Related articles (same tag)
    let relatedArticles = [];
    if (postTags.length > 0) {
      const tagConds = postTags.slice(0, 2).map(() => 'bp.tags LIKE ?').join(' OR ');
      const tagParams = postTags.slice(0, 2).map(t => `%${t}%`);
      const [articles] = await pool.query(
        `SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.reading_time, bp.featured_image
         FROM blog_posts bp
         WHERE bp.status = 'published' AND bp.slug != ? AND (${tagConds})
         ORDER BY RAND() LIMIT 3`,
        [slug, ...tagParams]
      );
      relatedArticles = articles;
    }

    const [relatedCategory] = await pool.query(
      `SELECT id, name, slug, description, icon, color
       FROM categories WHERE is_active = TRUE
       ORDER BY RAND() LIMIT 1`
    );

    // SEO
    const SITE_URL = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://yourdomain.com';
    const seo = {
      title: post.seo_title || post.meta_title || `${post.title} | AI Prompt Engineering Hub Blog`,
      description: post.meta_description || post.excerpt?.substring(0, 155),
      canonical: post.canonical_url || `${SITE_URL}/blog/${post.slug}`,
      focusKeyword: post.focus_keyword,
      ogImage: post.og_image || post.featured_image,
      noindex: !!post.noindex,
      schemaType: post.schema_type || 'Article',
      seoScore: post.seo_score || 0,
    };
    const schemas = [
      generateBlogPostingSchema(post),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: post.title },
      ]),
    ];
    const faqSchema = generateFAQSchema(post.content || '');
    if (faqSchema) schemas.push(faqSchema);

    res.json({
      data: post,
      relatedPrompts,
      relatedArticles,
      relatedCategory: relatedCategory.length > 0 ? relatedCategory[0] : null,
      tool: TOOL_LINK,
      seo: { ...seo, schemas },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createBlogPost = async (req, res) => {
  try {
    const {
      title, excerpt, content, featured_image, category, tags,
      status, reading_time, is_featured, meta_title, meta_description,
      seo_title, focus_keyword, canonical_url, og_image, noindex, schema_type,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const seoResult = await generateSEO({
      title,
      content,
      description: excerpt,
      keyword: focus_keyword || '',
      existing: { seo_title, meta_description, focus_keyword, canonical_url, og_image, noindex, schema_type },
      table: 'blog_posts',
    });

    const warnings = validateSEO({
      seoTitle: seoResult.seo_title,
      metaDescription: seoResult.meta_description,
      focusKeyword: seoResult.focus_keyword,
      slug: seoResult.slug,
      content,
    });

    const publishedAt = status === 'published' ? new Date() : null;

    const [result] = await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author_id,
       category, tags, status, reading_time, is_featured, meta_title, meta_description, published_at,
       seo_title, focus_keyword, canonical_url, og_image, noindex, schema_type, seo_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, seoResult.slug, excerpt, content, featured_image, req.user.id,
        category, JSON.stringify(tags || []), status || 'draft', reading_time || 0,
        is_featured || false, meta_title || title, seoResult.meta_description, publishedAt,
        seoResult.seo_title, seoResult.focus_keyword, seoResult.canonical_url,
        seoResult.og_image, seoResult.noindex ? 1 : 0, seoResult.schema_type, seoResult.seo_score,
      ]
    );

    if (status === 'published') {
      submitToIndexNow([`/blog/${seoResult.slug}`]).catch(() => {});
    }

    res.status(201).json({
      id: result.insertId,
      slug: seoResult.slug,
      seoScore: seoResult.seo_score,
      seoWarnings: warnings,
      message: 'Blog post created successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const [existing] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Blog post not found' });
    const existingRecord = existing[0];

    const seoResult = await generateSEO({
      title: fields.title || existingRecord.title,
      content: fields.content || existingRecord.content,
      description: fields.excerpt || existingRecord.excerpt,
      keyword: fields.focus_keyword || existingRecord.focus_keyword || '',
      existing: {
        seo_title: fields.seo_title !== undefined ? fields.seo_title : existingRecord.seo_title,
        meta_description: fields.meta_description !== undefined ? fields.meta_description : existingRecord.meta_description,
        focus_keyword: fields.focus_keyword !== undefined ? fields.focus_keyword : existingRecord.focus_keyword,
        slug: fields.slug !== undefined ? fields.slug : existingRecord.slug,
        canonical_url: fields.canonical_url !== undefined ? fields.canonical_url : existingRecord.canonical_url,
        og_image: fields.og_image !== undefined ? fields.og_image : existingRecord.og_image,
        noindex: fields.noindex !== undefined ? fields.noindex : existingRecord.noindex,
        schema_type: fields.schema_type !== undefined ? fields.schema_type : existingRecord.schema_type,
      },
      table: 'blog_posts',
      excludeId: parseInt(id),
    });

    if (seoResult.slug !== existingRecord.slug) {
      await pool.query(
        `INSERT INTO slug_redirects (old_slug, new_slug, content_type) VALUES (?, ?, 'blog')`,
        [existingRecord.slug, seoResult.slug]
      );
    }

    const seoWarnings = validateSEO({
      seoTitle: seoResult.seo_title,
      metaDescription: seoResult.meta_description,
      focusKeyword: seoResult.focus_keyword,
      slug: seoResult.slug,
      content: fields.content || existingRecord.content,
    });

    const allowedFields = [
      'title', 'excerpt', 'content', 'featured_image', 'category',
      'tags', 'status', 'reading_time', 'is_featured', 'meta_title', 'meta_description',
    ];

    const updateFields = {};
    for (const k of allowedFields) {
      if (fields[k] !== undefined) updateFields[k] = fields[k];
    }
    if (updateFields.tags && typeof updateFields.tags !== 'string') {
      updateFields.tags = JSON.stringify(updateFields.tags);
    }
    if (fields.status === 'published' && !existingRecord.published_at) {
      updateFields.published_at = new Date();
    }

    updateFields.slug = seoResult.slug;
    updateFields.seo_title = seoResult.seo_title;
    updateFields.focus_keyword = seoResult.focus_keyword;
    updateFields.canonical_url = seoResult.canonical_url;
    updateFields.og_image = seoResult.og_image;
    updateFields.noindex = seoResult.noindex ? 1 : 0;
    updateFields.schema_type = seoResult.schema_type;
    updateFields.seo_score = seoResult.seo_score;

    const updates = Object.keys(updateFields).map(k => `${k} = ?`);
    const values = Object.values(updateFields);

    await pool.query(
      `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`,
      [...values, id]
    );

    if (fields.status === 'published' || existingRecord.status === 'published') {
      submitToIndexNow([`/blog/${seoResult.slug}`]).catch(() => {});
    }

    res.json({
      message: 'Blog post updated successfully',
      slug: seoResult.slug,
      seoScore: seoResult.seo_score,
      seoWarnings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM blog_posts WHERE id = ?', [id]);
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const adminGetAllBlogPosts = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM blog_posts');

    const [posts] = await pool.query(
      `SELECT bp.*, u.username as author_name
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       ORDER BY bp.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      data: posts,
      pagination: buildPaginationMeta(countResult[0].total, page, limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
