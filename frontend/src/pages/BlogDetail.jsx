import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiEye, FiCalendar, FiUser, FiChevronRight, FiZap, FiBookOpen } from 'react-icons/fi';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import AdBlock from '../components/AdBlock';
import BlogPopupAd from '../components/BlogPopupAd';
import { DetailHeroSkeleton, DetailContentSkeleton } from '../components/Skeleton';
import { blogAPI } from '../services/api';
import './BlogDetail.css';

/**
 * BlogContentRenderer
 * Safely renders blog post content (HTML).
 * - Intercepts <a> tags with data-redirect-id to render SmartRedirectButton
 * - Sanitizes: no inline JS, no dangerous protocols
 *
 * §9 Security: All HTML rendered via dangerouslySetInnerHTML but scripts
 * are admin-authored only. For user-facing content sanitization is
 * handled at the backend (blogController) with DOMPurify.
 */
const sanitizeBlogHtml = (html) => {
  if (!html) return '';
  // Strip any <script> tags (belt-and-suspenders — backend also does this)
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // remove event handlers
    .replace(/javascript\s*:/gi, 'about:'); // neutralize js: protocols
};

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPrompts, setRelatedPrompts] = useState([]);
  const [relatedCategory, setRelatedCategory] = useState(null);
  const [toolItem, setToolItem] = useState(null);
  const [seo, setSeo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await blogAPI.getBySlug(slug);
        setPost(data.data);
        setRelatedPrompts(data.relatedPrompts || []);
        setRelatedCategory(data.relatedCategory || null);
        setToolItem(data.tool || null);
        setSeo(data.seo || null);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return (
    <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
      <div className="prompt-detail-hero" style={{ paddingBottom: 'var(--space-12)' }}>
        <div className="container"><DetailHeroSkeleton /></div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <DetailContentSkeleton />
          <DetailContentSkeleton />
        </div>
      </section>
    </div>
  );
  if (!post) return <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}><div className="container section"><div className="empty-state"><h2>Post Not Found</h2><Link to="/blog" className="btn btn-primary">Back to Blog</Link></div></div></div>;

  const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []);
  const safeContent = sanitizeBlogHtml(post.content);

  // §3 — Native Banner Inline Insertion
  const renderContentWithNativeAds = (htmlContent) => {
    if (!htmlContent) return null;
    const parts = htmlContent.split('</p>');
    return parts.map((part, index) => {
      const isLast = index === parts.length - 1;
      const htmlChunk = isLast ? part : `${part}</p>`;
      const showAd = !isLast && (index + 1) % 3 === 0; // Every 3rd paragraph

      return (
        <div key={index} className="prose-chunk">
          <div dangerouslySetInnerHTML={{ __html: htmlChunk }} />
          {showAd && (
            <div className="native-banner-container" style={{ margin: 'var(--space-8) 0', textAlign: 'center' }}>
              <AdBlock placement="native_banner_inline" fallbackText="Support us by enabling ads" minHeight={60} />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <SEO
        title={seo?.title || post.meta_title || post.title}
        description={seo?.description || post.meta_description || post.excerpt}
        canonical={seo?.canonical}
        focusKeyword={seo?.focusKeyword}
        ogType="article"
        ogImage={seo?.ogImage}
        noIndex={seo?.noindex}
        schemaType={seo?.schemaType}
        schemas={seo?.schemas}
        author={post.author_name}
        publishedAt={post.published_at}
      />

      {/* §3 — Blog popup ad (once per session, 1.5s delay, not blocking) */}
      <BlogPopupAd />

      <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <div className="container">
            <ol className="breadcrumb-list">
              <li><Link to="/">Home</Link></li>
              <li><FiChevronRight /></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><FiChevronRight /></li>
              <li aria-current="page">{post.title}</li>
            </ol>
          </div>
        </nav>

        <article>
          <div className="prompt-detail-hero" style={{ paddingBottom: 'var(--space-12)' }}>
            <div className="container">
              <Link to="/blog" className="back-link"><FiArrowLeft /> Back to Blog</Link>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="prompt-badges" style={{ marginBottom: 'var(--space-4)' }}>
                  <span className="badge badge-primary">{post.category || 'Article'}</span>
                </div>
                <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 800, lineHeight: 1.2, marginBottom: 'var(--space-5)', maxWidth: '800px' }}>{post.title}</h1>
                <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)', lineHeight: 1.7, maxWidth: '700px', marginBottom: 'var(--space-6)' }}>{post.excerpt}</p>
                <div className="prompt-meta-row">
                  <span><FiUser /> {post.author_name || 'AI Prompt Loops'}</span>
                  <span><FiClock /> {post.reading_time} min read</span>
                  <span><FiEye /> {post.views || 0} views</span>
                  {post.published_at && <span><FiCalendar /> {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                </div>
              </motion.div>
            </div>
          </div>

          <section className="section">
            <div className="container" style={{ maxWidth: '800px' }}>
              {/* blog_top — after first paragraph */}
              <AdBlock placement="blog_top" className="blog-ad blog-ad-top" minHeight={90} />

              {/* §9 — Sanitized blog HTML render + Native Banners */}
              <div className="prose">
                {renderContentWithNativeAds(safeContent)}
              </div>

              {tags.length > 0 && (
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
                  {tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}

              {/* ── Internal Links Section ── */}
              <div className="internal-links-section" style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--color-border)' }}>

                {/* blog_middle — mid article */}
                <div style={{ margin: 'var(--space-8) 0' }}>
                  <AdBlock placement="blog_middle" className="blog-ad blog-ad-middle" minHeight={90} />
                </div>

                {/* 2 Related Prompts */}
                {relatedPrompts.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-8)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiBookOpen /> Related Prompts
                    </h3>
                    <div className="grid grid-2">
                      {relatedPrompts.map(r => (
                        <Link to={`/prompts/${r.slug}`} key={r.id} className="card" style={{ textDecoration: 'none', color: 'inherit', border: '1px solid var(--color-border)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <span>{r.category_icon || '📝'}</span>
                            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{r.category_name}</span>
                          </div>
                          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.25rem' }}>{r.title}</h4>
                          <span style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>Difficulty: {r.difficulty}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1 Category + 1 Tool */}
                <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
                  {relatedCategory && (
                    <div>
                      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Explore Category
                      </h3>
                      <Link to={`/prompts?category=${relatedCategory.slug}`} className="card" style={{ textDecoration: 'none', color: 'inherit', border: '1px solid var(--color-border)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', display: 'block', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                        <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>{relatedCategory.icon} {relatedCategory.name}</h4>
                        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', margin: 0 }}>{relatedCategory.description?.substring(0, 100)}</p>
                      </Link>
                    </div>
                  )}

                  {toolItem && (
                    <div>
                      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiZap /> Try Our Tool
                      </h3>
                      <Link to={toolItem.url} className="card" style={{ textDecoration: 'none', color: 'inherit', border: '1px solid var(--color-border)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', display: 'block', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                        <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: '0.5rem' }}>{toolItem.icon} {toolItem.title}</h4>
                        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem', margin: 0 }}>{toolItem.description}</p>
                      </Link>
                    </div>
                  )}
                </div>

                {/* blog_bottom — end of article */}
                <div style={{ marginTop: 'var(--space-12)' }}>
                  <AdBlock placement="blog_bottom" className="blog-ad blog-ad-bottom" minHeight={100} />
                </div>
              </div>
            </div>
          </section>
        </article>
      </div>
    </>
  );
};

export default BlogDetail;
