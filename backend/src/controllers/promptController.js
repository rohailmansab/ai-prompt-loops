import pool from '../config/database.js';
import {
  slugify, generateSchemaMarkup, paginate, buildPaginationMeta,
  buildSeoMeta, generateHowToSchema, generateBreadcrumbSchema, TOOL_LINK,
} from '../utils/helpers.js';
import { generateSEO, validateSEO, ensureUniqueSlug } from '../utils/seoEngine.js';
import { submitToIndexNow } from './seoController.js';

const SEO_FIELDS = [
  'title', 'slug', 'description', 'content', 'example_output', 'category_id',
  'tags', 'difficulty', 'ai_model', 'use_case', 'is_featured', 'is_published',
  'meta_title', 'meta_description',
  'seo_title', 'focus_keyword', 'canonical_url', 'og_image', 'noindex', 'schema_type', 'seo_score',
];

export const getAllPrompts = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const { category, difficulty, ai_model, search, featured } = req.query;

    let whereClause = 'WHERE p.is_published = TRUE';
    const params = [];

    if (category) { whereClause += ' AND c.slug = ?'; params.push(category); }
    if (difficulty) { whereClause += ' AND p.difficulty = ?'; params.push(difficulty); }
    if (ai_model) { whereClause += ' AND p.ai_model = ?'; params.push(ai_model); }
    if (featured === 'true') { whereClause += ' AND p.is_featured = TRUE'; }
    if (search) {
      whereClause += ' AND (MATCH(p.title, p.description, p.content) AGAINST(? IN BOOLEAN MODE) OR p.title LIKE ?)';
      params.push(search, `%${search}%`);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM prompts p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`,
      params
    );

    const [prompts] = await pool.query(
      `SELECT p.id, p.title, p.slug, p.description, p.difficulty, p.ai_model, p.use_case,
              p.views, p.likes, p.is_featured, p.tags, p.created_at, p.seo_score,
              c.name as category_name, c.slug as category_slug, c.icon as category_icon, c.color as category_color,
              u.username as author_name
       FROM prompts p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.author_id = u.id
       ${whereClause}
       ORDER BY p.is_featured DESC, p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      data: prompts,
      pagination: buildPaginationMeta(countResult[0].total, page, limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPromptBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Check for 301 redirect
    const [redirects] = await pool.query(
      `SELECT new_slug FROM slug_redirects WHERE old_slug = ? AND content_type = 'prompt' LIMIT 1`,
      [slug]
    );
    if (redirects.length > 0) {
      return res.redirect(301, `/prompts/${redirects[0].new_slug}`);
    }

    const [prompts] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon,
              c.color as category_color, u.username as author_name
       FROM prompts p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.slug = ? AND p.is_published = TRUE`,
      [slug]
    );

    if (prompts.length === 0) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    await pool.query('UPDATE prompts SET views = views + 1 WHERE slug = ?', [slug]);

    const prompt = prompts[0];

    // Related prompts (same category)
    const [relatedPrompts] = await pool.query(
      `SELECT p.id, p.title, p.slug, p.description, p.difficulty, p.ai_model,
              c.name as category_name, c.icon as category_icon
       FROM prompts p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ? AND p.slug != ? AND p.is_published = TRUE
       ORDER BY RAND() LIMIT 5`,
      [prompt.category_id, slug]
    );

    // Related blog (tag-matched first, fallback random)
    const promptTags = typeof prompt.tags === 'string' ? JSON.parse(prompt.tags) : (prompt.tags || []);
    let relevantBlog = null;
    if (promptTags.length > 0) {
      const tagConditions = promptTags.slice(0, 3).map(() => 'bp.tags LIKE ?').join(' OR ');
      const tagParams = promptTags.slice(0, 3).map(t => `%${t}%`);
      const [blogs] = await pool.query(
        `SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.reading_time
         FROM blog_posts bp
         WHERE bp.status = 'published' AND (${tagConditions})
         ORDER BY RAND() LIMIT 1`,
        tagParams
      );
      if (blogs.length > 0) relevantBlog = blogs[0];
    }
    if (!relevantBlog) {
      const [blogs] = await pool.query(
        `SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.reading_time
         FROM blog_posts bp WHERE bp.status = 'published'
         ORDER BY RAND() LIMIT 1`
      );
      if (blogs.length > 0) relevantBlog = blogs[0];
    }

    // SEO — use DB-stored SEO fields if present, fallback to buildSeoMeta
    const SITE_URL = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://yourdomain.com';
    const seo = {
      title: prompt.seo_title || prompt.meta_title || `${prompt.title} – AI Prompt for ${prompt.ai_model || 'ChatGPT'}`,
      description: prompt.meta_description || prompt.description?.substring(0, 155),
      canonical: prompt.canonical_url || `${SITE_URL}/prompts/${prompt.slug}`,
      focusKeyword: prompt.focus_keyword,
      ogImage: prompt.og_image,
      noindex: !!prompt.noindex,
      schemaType: prompt.schema_type || 'HowTo',
      seoScore: prompt.seo_score || 0,
    };
    const schemas = [
      generateHowToSchema(prompt),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Prompts', url: '/prompts' },
        { name: prompt.category_name, url: `/prompts?category=${prompt.category_slug}` },
        { name: prompt.title },
      ]),
    ];

    res.json({
      data: prompt,
      relatedPrompts,
      relevantBlog,
      tool: TOOL_LINK,
      seo: { ...seo, schemas },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPrompt = async (req, res) => {
  try {
    const {
      title, description, content, example_output, category_id, tags,
      difficulty, ai_model, use_case, is_featured, is_published,
      meta_title, meta_description,
      seo_title, meta_description: mdesc, focus_keyword, canonical_url,
      og_image, noindex, schema_type,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Generate SEO
    const seoResult = await generateSEO({
      title,
      content,
      description,
      keyword: focus_keyword || '',
      existing: { seo_title, meta_description: meta_description || mdesc, focus_keyword, canonical_url, og_image, noindex, schema_type },
      table: 'prompts',
    });

    // SEO Validation warnings (non-blocking)
    const warnings = validateSEO({
      seoTitle: seoResult.seo_title,
      metaDescription: seoResult.meta_description,
      focusKeyword: seoResult.focus_keyword,
      slug: seoResult.slug,
      content,
    });

    const schema_markup = JSON.stringify(generateSchemaMarkup('prompt', { title, description, content }));

    const [result] = await pool.query(
      `INSERT INTO prompts (title, slug, description, content, example_output, category_id,
       author_id, tags, difficulty, ai_model, use_case, is_featured, is_published,
       meta_title, meta_description, schema_markup,
       seo_title, focus_keyword, canonical_url, og_image, noindex, schema_type, seo_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, seoResult.slug, description, content, example_output, category_id,
        req.user.id, JSON.stringify(tags || []), difficulty || 'intermediate',
        ai_model || 'ChatGPT', use_case, is_featured || false, is_published !== false,
        meta_title || title, seoResult.meta_description, schema_markup,
        seoResult.seo_title, seoResult.focus_keyword, seoResult.canonical_url,
        seoResult.og_image, seoResult.noindex ? 1 : 0, seoResult.schema_type, seoResult.seo_score,
      ]
    );

    // IndexNow on publish
    if (is_published !== false) {
      submitToIndexNow([`/prompts/${seoResult.slug}`]).catch(() => {});
    }

    res.status(201).json({
      id: result.insertId,
      slug: seoResult.slug,
      seoScore: seoResult.seo_score,
      seoWarnings: warnings,
      message: 'Prompt created successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    // Fetch existing record to detect slug change
    const [existing] = await pool.query('SELECT * FROM prompts WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Prompt not found' });
    const existingRecord = existing[0];

    // Generate SEO (pass existing stored values as defaults)
    const seoResult = await generateSEO({
      title: fields.title || existingRecord.title,
      content: fields.content || existingRecord.content,
      description: fields.description || existingRecord.description,
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
      table: 'prompts',
      excludeId: parseInt(id),
    });

    // Log 301 redirect if slug changed
    if (seoResult.slug !== existingRecord.slug) {
      await pool.query(
        `INSERT INTO slug_redirects (old_slug, new_slug, content_type) VALUES (?, ?, 'prompt')`,
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

    const updateFields = {};
    const allowedFields = [
      'title', 'description', 'content', 'example_output', 'category_id',
      'tags', 'difficulty', 'ai_model', 'use_case', 'is_featured', 'is_published',
      'meta_title', 'meta_description',
    ];
    for (const k of allowedFields) {
      if (fields[k] !== undefined) updateFields[k] = fields[k];
    }
    if (updateFields.tags && typeof updateFields.tags !== 'string') {
      updateFields.tags = JSON.stringify(updateFields.tags);
    }

    // Always write back computed SEO fields
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
      `UPDATE prompts SET ${updates.join(', ')} WHERE id = ?`,
      [...values, id]
    );

    // IndexNow on publish
    if (fields.is_published !== false) {
      submitToIndexNow([`/prompts/${seoResult.slug}`]).catch(() => {});
    }

    res.json({
      message: 'Prompt updated successfully',
      slug: seoResult.slug,
      seoScore: seoResult.seo_score,
      seoWarnings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM prompts WHERE id = ?', [id]);
    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const likePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE prompts SET likes = likes + 1 WHERE id = ?', [id]);
    const [result] = await pool.query('SELECT likes FROM prompts WHERE id = ?', [id]);
    res.json({ likes: result[0]?.likes || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const adminGetAllPrompts = async (req, res) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM prompts');

    const [prompts] = await pool.query(
      `SELECT p.*, c.name as category_name, u.username as author_name
       FROM prompts p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      data: prompts,
      pagination: buildPaginationMeta(countResult[0].total, page, limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
