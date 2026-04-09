/**
 * SEO Engine — generateSEO(), score, slug uniqueness, validation
 * Used by promptController and blogController on CREATE + UPDATE
 */

import pool from '../config/database.js';

// ─── Slug generator ───────────────────────────────────────
export const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

// ─── Ensure unique slug in a given table ─────────────────
export const ensureUniqueSlug = async (baseSlug, table, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const excludeClause = excludeId ? ' AND id != ?' : '';
    const params = excludeId ? [slug, excludeId] : [slug];
    const [rows] = await pool.query(
      `SELECT id FROM ${table} WHERE slug = ?${excludeClause}`,
      params
    );
    if (rows.length === 0) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
};

// ─── Truncate to sentence boundary ───────────────────────
const truncate = (text, max) => {
  if (!text) return '';
  const clean = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.lastIndexOf(' ', max);
  return clean.substring(0, cut > 0 ? cut : max) + '…';
};

// ─── Word count (strips HTML) ─────────────────────────────
const wordCount = (text) => {
  if (!text) return 0;
  return text.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
};

// ─── SEO Score calculator ─────────────────────────────────
export const calcSeoScore = ({
  seoTitle,
  metaDescription,
  focusKeyword,
  slug,
  content,
  ogImage,
  schemaType,
  internalLinks,
}) => {
  let score = 0;
  const kw = (focusKeyword || '').toLowerCase();
  const title = (seoTitle || '').toLowerCase();
  const desc = (metaDescription || '').toLowerCase();
  const sl = (slug || '').toLowerCase();

  if (kw && title.includes(kw)) score += 20;
  if (kw && desc.includes(kw)) score += 15;
  if (wordCount(content) > 300) score += 20;
  if (kw && sl.includes(kw)) score += 15;
  if (internalLinks > 0) score += 10;
  if (ogImage) score += 10;
  if (schemaType && schemaType !== 'WebPage') score += 10;

  return Math.min(100, score);
};

// ─── Main SEO generator ───────────────────────────────────
/**
 * generateSEO({ title, content, keyword, existing, table, excludeId })
 *   existing = { seo_title, meta_description, focus_keyword, slug, og_image, canonical_url, noindex, schema_type }
 *
 * Returns enriched SEO fields + score.
 */
export const generateSEO = async ({
  title,
  content,
  description,
  keyword,
  existing = {},
  table,
  excludeId = null,
}) => {
  const kw = keyword || existing.focus_keyword || '';

  // 1. SEO Title — use stored value or auto-generate
  let seoTitle = existing.seo_title || '';
  if (!seoTitle) {
    if (kw) {
      seoTitle = title.toLowerCase().includes(kw.toLowerCase())
        ? title
        : `${title} — ${kw}`;
    } else {
      seoTitle = title;
    }
  }
  // Clamp to 60 chars
  if (seoTitle.length > 60) seoTitle = seoTitle.substring(0, 57) + '…';

  // 2. Meta Description — use stored value or auto-generate
  let metaDescription = existing.meta_description || '';
  if (!metaDescription) {
    const base = description || content || '';
    metaDescription = truncate(base, 155);
    // Try to include keyword
    if (kw && !metaDescription.toLowerCase().includes(kw.toLowerCase())) {
      const prefix = `${kw.charAt(0).toUpperCase() + kw.slice(1)}: `;
      metaDescription = truncate(prefix + base, 155);
    }
  }

  // 3. Slug
  let baseSlug = existing.slug || slugify(title);
  baseSlug = slugify(baseSlug); // re-normalize
  const slug = table
    ? await ensureUniqueSlug(baseSlug, table, excludeId)
    : baseSlug;

  // 4. Other SEO fields (use existing or defaults)
  const focusKeyword = kw;
  const canonicalUrl = existing.canonical_url || null;
  const ogImage = existing.og_image || null;
  const noindex = existing.noindex || false;
  const schemaType = existing.schema_type || 'Article';

  // 5. Count internal links in content (href="/...")
  const internalLinks = (content || '').match(/href=["']\/[^"']+["']/g)?.length || 0;

  // 6. SEO Score
  const seoScore = calcSeoScore({
    seoTitle,
    metaDescription,
    focusKeyword,
    slug,
    content,
    ogImage,
    schemaType,
    internalLinks,
  });

  return {
    seo_title: seoTitle,
    meta_description: metaDescription,
    focus_keyword: focusKeyword,
    slug,
    canonical_url: canonicalUrl,
    og_image: ogImage,
    noindex,
    schema_type: schemaType,
    seo_score: seoScore,
  };
};

// ─── SEO Validation ───────────────────────────────────────
export const validateSEO = ({ seoTitle, metaDescription, focusKeyword, slug, content }) => {
  const warnings = [];
  if (!seoTitle || seoTitle.length < 10) warnings.push('SEO title is missing or too short (min 10 chars)');
  if (seoTitle && seoTitle.length > 60) warnings.push('SEO title exceeds 60 characters');
  if (!metaDescription || metaDescription.length < 50) warnings.push('Meta description is missing or too short (min 50 chars)');
  if (metaDescription && metaDescription.length > 160) warnings.push('Meta description exceeds 160 characters');
  if (!focusKeyword) warnings.push('Focus keyword is missing');
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) warnings.push('Slug is invalid — must be lowercase hyphen-separated');
  if (wordCount(content) < 150) warnings.push('Content is too short — under 150 words');
  return warnings;
};
