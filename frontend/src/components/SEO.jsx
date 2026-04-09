import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://aipromptloops.me';
const SITE_NAME = 'AI Prompt Loops';

/**
 * Production-grade SEO component.
 * Handles: title, meta description, canonical, robots, OG tags,
 *          Twitter card, JSON-LD schemas, preloads, author.
 */
const SEO = ({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage,
  schema,        // single schema (backward compat)
  schemas,       // array of schemas (new)
  breadcrumbs,   // array of { name, url } for visual breadcrumbs
  noIndex = false,
  noFollow = false,
  focusKeyword,
  schemaType,
  author,
  publishedAt,
  modifiedAt,
}) => {
  const location = useLocation();
  const siteName = SITE_NAME;

  // Title — 60 char max encouraged
  const fullTitle = title
    ? `${title.substring(0, 55)} | ${siteName}`
    : siteName;

  // Description — 160 char max
  const finalDescription = description
    ? description.substring(0, 160)
    : 'Discover, create, and master AI prompts. The ultimate prompt engineering resource for ChatGPT, Midjourney, Claude, and more.';

  const defaultImage = '/og-image.png';
  const dynamicCanonical = canonical || `${SITE_URL}${location.pathname}`;

  // Robots directive
  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ');

  // Merge single schema + schemas array
  const allSchemas = [];
  if (schemas && Array.isArray(schemas)) {
    allSchemas.push(...schemas);
  } else if (schema) {
    allSchemas.push(schema);
  }

  // Auto-inject Website schema on home-like pages
  if (!title && allSchemas.length === 0) {
    allSchemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/prompts?search={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    });
  }

  const finalOgImage = ogImage || defaultImage;

  return (
    <Helmet>
      {/* ── Primary Meta ───────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {focusKeyword && <meta name="news_keywords" content={focusKeyword} />}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />

      {/* ── Canonical ──────────────────────────────────── */}
      <link rel="canonical" href={dynamicCanonical} />

      {/* ── Open Graph ─────────────────────────────────── */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={finalOgImage.startsWith('http') ? finalOgImage : `${SITE_URL}${finalOgImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={dynamicCanonical} />
      <meta property="og:locale" content="en_US" />

      {/* ── Article-specific OG ────────────────────────── */}
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}
      {author && <meta property="article:author" content={author} />}

      {/* ── Twitter Card ───────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@AIPromptLoops" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage.startsWith('http') ? finalOgImage : `${SITE_URL}${finalOgImage}`} />

      {/* ── Performance: preconnect ─────────────────────── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* ── JSON-LD Schema Markups ─────────────────────── */}
      {allSchemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
