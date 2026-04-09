const SITE_URL = process.env.SITE_URL || 'https://aipromptloops.me';
const SITE_NAME = 'AI Prompt Engineering Hub';

// ─── Slug ────────────────────────────────────────────────
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// ─── Auto SEO Meta Builder ───────────────────────────────
// Builds optimized page titles & meta descriptions from DB content
export const buildSeoMeta = (type, data) => {
  switch (type) {
    case 'prompt': {
      const title = data.meta_title
        || `${data.title} – AI Prompt for ${data.ai_model || 'ChatGPT'}`;
      const description = data.meta_description
        || `${data.description?.substring(0, 140)}. Use this ${data.difficulty || 'intermediate'}-level AI prompt in ${data.ai_model || 'ChatGPT'}.`;
      const canonical = `${SITE_URL}/prompts/${data.slug}`;
      return { title, description, canonical };
    }
    case 'blogPost': {
      const title = data.meta_title
        || `${data.title} | ${SITE_NAME} Blog`;
      const description = data.meta_description
        || data.excerpt?.substring(0, 155)
        || `Read ${data.title} on the ${SITE_NAME} blog.`;
      const canonical = `${SITE_URL}/blog/${data.slug}`;
      return { title, description, canonical };
    }
    case 'category': {
      const title = `${data.name} AI Prompts – Browse & Copy | ${SITE_NAME}`;
      const description = data.meta_description
        || `Explore curated ${data.name} AI prompts. Copy, customize, and use them in ChatGPT, Claude, Midjourney and more.`;
      const canonical = `${SITE_URL}/prompts?category=${data.slug}`;
      return { title, description, canonical };
    }
    default:
      return { title: SITE_NAME, description: '', canonical: SITE_URL };
  }
};

// ─── Schema Generators ───────────────────────────────────

const schemaBase = { '@context': 'https://schema.org' };

// HowTo schema for prompt pages
export const generateHowToSchema = (prompt) => ({
  ...schemaBase,
  '@type': 'HowTo',
  name: prompt.title,
  description: prompt.description,
  totalTime: 'PT5M',
  tool: { '@type': 'HowToTool', name: prompt.ai_model || 'ChatGPT' },
  step: [{
    '@type': 'HowToStep',
    name: 'Copy the prompt template',
    text: prompt.content?.substring(0, 500),
  }, {
    '@type': 'HowToStep',
    name: 'Customize placeholders',
    text: 'Replace the bracketed placeholders with your own specific details.',
  }, {
    '@type': 'HowToStep',
    name: `Paste into ${prompt.ai_model || 'ChatGPT'}`,
    text: `Open ${prompt.ai_model || 'ChatGPT'} and paste the customized prompt to get your result.`,
  }],
});

// BlogPosting schema
export const generateBlogPostingSchema = (post) => ({
  ...schemaBase,
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.excerpt || post.meta_description,
  author: { '@type': 'Person', name: post.author_name || 'AI Prompt Hub' },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
  },
  datePublished: post.published_at,
  dateModified: post.updated_at || post.published_at,
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  image: post.featured_image || `${SITE_URL}/og-image.png`,
});

// FAQ schema – auto-extracts FAQ pairs from HTML content
export const generateFAQSchema = (htmlContent) => {
  const faqPairs = [];
  // Match <h3> followed by <p> inside FAQ sections
  const faqRegex = /<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/gs;
  let match;
  while ((match = faqRegex.exec(htmlContent)) !== null) {
    faqPairs.push({
      '@type': 'Question',
      name: match[1].replace(/<[^>]+>/g, ''),
      acceptedAnswer: {
        '@type': 'Answer',
        text: match[2].replace(/<[^>]+>/g, ''),
      },
    });
  }
  if (faqPairs.length === 0) return null;
  return {
    ...schemaBase,
    '@type': 'FAQPage',
    mainEntity: faqPairs,
  };
};

// BreadcrumbList schema
export const generateBreadcrumbSchema = (items) => ({
  ...schemaBase,
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url ? `${SITE_URL}${item.url}` : undefined,
  })),
});

// CollectionPage schema for category listing pages
export const generateCollectionSchema = (data) => ({
  ...schemaBase,
  '@type': 'CollectionPage',
  name: data.name,
  description: data.description,
  url: `${SITE_URL}/prompts?category=${data.slug}`,
});

// Backward-compatible wrapper used by existing code paths
export const generateSchemaMarkup = (type, data) => {
  switch (type) {
    case 'prompt':
      return generateHowToSchema(data);
    case 'blogPost':
      return generateBlogPostingSchema(data);
    case 'category':
      return generateCollectionSchema(data);
    default:
      return schemaBase;
  }
};

// ─── Internal Linking Engine ─────────────────────────────

export const TOOL_LINK = {
  title: 'AI Prompt Generator',
  description: 'Generate optimized prompts or enhance your existing ones with our free AI tools.',
  url: '/tools',
  icon: '⚡',
};

// ─── Pagination ──────────────────────────────────────────

export const paginate = (page = 1, limit = 12) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(50, Math.max(1, parseInt(limit)));
  const offset = (p - 1) * l;
  return { page: p, limit: l, offset };
};

export const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
