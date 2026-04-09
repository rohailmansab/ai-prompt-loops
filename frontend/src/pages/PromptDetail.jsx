import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiArrowLeft, FiTag, FiClock, FiEye, FiZap, FiBookOpen, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import AdBlock from '../components/AdBlock';
import PromptContentLock from '../components/PromptContentLock';
import { DetailHeroSkeleton, DetailContentSkeleton } from '../components/Skeleton';
import { promptsAPI, analyticsAPI } from '../services/api';
import './PromptDetail.css';

const PromptDetail = () => {
  const { slug } = useParams();
  const [prompt, setPrompt] = useState(null);
  const [relatedPrompts, setRelatedPrompts] = useState([]);
  const [relevantBlog, setRelevantBlog] = useState(null);
  const [toolItem, setToolItem] = useState(null);
  const [seo, setSeo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      setLoading(true);
      try {
        const { data } = await promptsAPI.getBySlug(slug);
        setPrompt(data.data);
        setRelatedPrompts(data.relatedPrompts || []);
        setRelevantBlog(data.relevantBlog || null);
        setToolItem(data.tool || null);
        setSeo(data.seo || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrompt();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleCopy = useCallback(() => {
    if (!prompt?.content) return;
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    analyticsAPI.track({ event_type: 'prompt_copy', item_id: prompt.slug, path: window.location.pathname }).catch(() => {});
    setTimeout(() => setCopied(false), 3000);
  }, [prompt]);

  const handleLike = async () => {
    try {
      const { data } = await promptsAPI.like(prompt.id);
      setPrompt(prev => ({ ...prev, likes: data.likes }));
      setLiked(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: 'var(--header-height)' }}>
        <div className="prompt-detail-hero">
          <div className="container">
            <DetailHeroSkeleton />
          </div>
        </div>
        <section className="section">
          <div className="container">
            <div className="prompt-detail-layout">
              <div className="prompt-detail-main"><DetailContentSkeleton /></div>
              <aside className="prompt-detail-sidebar" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
        <div className="container section">
          <div className="empty-state">
            <h2>Prompt Not Found</h2>
            <p>The prompt you&apos;re looking for doesn&apos;t exist.</p>
            <Link to="/prompts" className="btn btn-primary">Browse Prompts</Link>
          </div>
        </div>
      </div>
    );
  }

  const tags = typeof prompt.tags === 'string' ? JSON.parse(prompt.tags) : (prompt.tags || []);

  return (
    <>
      <SEO
        title={seo?.title || prompt.meta_title || prompt.title}
        description={seo?.description || prompt.meta_description || prompt.description}
        keywords={tags.join(', ')}
        focusKeyword={seo?.focusKeyword}
        canonical={seo?.canonical}
        ogType="article"
        ogImage={seo?.ogImage}
        noIndex={seo?.noindex}
        schemaType={seo?.schemaType}
        schemas={seo?.schemas}
      />

      <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <div className="container">
            <ol className="breadcrumb-list">
              <li><Link to="/">Home</Link></li>
              <li><FiChevronRight /></li>
              <li><Link to="/prompts">Prompts</Link></li>
              <li><FiChevronRight /></li>
              <li><Link to={`/prompts?category=${prompt.category_slug}`}>{prompt.category_name}</Link></li>
              <li><FiChevronRight /></li>
              <li aria-current="page">{prompt.title}</li>
            </ol>
          </div>
        </nav>

        <div className="prompt-detail-hero">
          <div className="container">
            <Link to="/prompts" className="back-link" id="back-to-prompts">
              <FiArrowLeft /> Back to Prompts
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prompt-detail-header"
            >
              <div className="prompt-badges">
                <span className="badge badge-primary" style={prompt.category_color ? { background: `${prompt.category_color}20`, color: prompt.category_color } : {}}>
                  {prompt.category_icon} {prompt.category_name}
                </span>
                <span className={`badge badge-${prompt.difficulty === 'beginner' ? 'success' : prompt.difficulty === 'advanced' ? 'error' : 'warning'}`}>
                  {prompt.difficulty}
                </span>
                <span className="badge badge-primary">
                  <FiZap /> {prompt.ai_model}
                </span>
              </div>

              <h1 className="prompt-detail-title">{prompt.title}</h1>
              <p className="prompt-detail-desc">{prompt.description}</p>

              <div className="prompt-meta-row">
                <span><FiEye /> {prompt.views || 0} views</span>
                <span><FiHeart /> {prompt.likes || 0} likes</span>
                {prompt.use_case && <span><FiTag /> {prompt.use_case}</span>}
                <span><FiClock /> {new Date(prompt.created_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          </div>
        </div>

        <section className="section">
          <div className="container">
            <div className="prompt-detail-layout">
              <div className="prompt-detail-main">
                {/* Ad Placement: Below title, above content */}
                <AdBlock placement="prompt_top" className="ad-in-feed" minHeight={90} />
                <div className="prompt-content-card">
                  <div className="prompt-content-header">
                    <h2>Prompt Template</h2>
                    <div className="prompt-content-actions">
                      <button
                        className={`btn btn-sm ${liked ? 'btn-liked' : 'btn-secondary'}`}
                        onClick={handleLike}
                        disabled={liked}
                        id="like-btn"
                      >
                        <FiHeart /> {liked ? 'Liked!' : 'Like'}
                      </button>
                    </div>
                  </div>
                  {/* Content lock: shows 40% → ad unlock → full copy */}
                  <PromptContentLock
                    content={prompt.content}
                    onCopy={handleCopy}
                    copied={copied}
                  />
                </div>

                {prompt.example_output && (
                  <div className="prompt-content-card">
                    <h2>Expected Output</h2>
                    <div className="prompt-example">
                      {prompt.example_output}
                    </div>
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="prompt-tags">
                    {tags.map(tag => (
                      <span key={tag} className="tag">
                        <FiTag /> {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Ad Placement: Below prompt content */}
                <AdBlock placement="prompt_bottom" className="ad-in-feed" minHeight={100} />
              </div>

              {/* ── Sidebar with Internal Links ── */}
              <aside className="prompt-detail-sidebar">
                {/* Ad Placement: Sidebar */}
                <div style={{ marginBottom: 'var(--space-8)' }}>
                  <AdBlock placement="sidebar" className="ad-sidebar" minHeight={250} />
                </div>

                {/* 3 Related Prompts */}
                {relatedPrompts.length > 0 && (
                  <div className="sidebar-section">
                    <h3>Related Prompts</h3>
                    <div className="related-list">
                      {relatedPrompts.map(r => (
                        <Link to={`/prompts/${r.slug}`} key={r.id} className="related-card" id={`related-${r.slug}`}>
                          <span className="related-icon">{r.category_icon || '📝'}</span>
                          <div>
                            <h4>{r.title}</h4>
                            <span className="related-meta">{r.difficulty} · {r.ai_model}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1 Prompt Generator Tool */}
                {toolItem && (
                  <div className="sidebar-section">
                    <h3>Try Our Tool</h3>
                    <Link to={toolItem.url} className="related-card tool-link-card">
                      <span className="related-icon">{toolItem.icon}</span>
                      <div>
                        <h4>{toolItem.title}</h4>
                        <span className="related-meta">{toolItem.description}</span>
                      </div>
                    </Link>
                  </div>
                )}

                {/* 1 Relevant Blog Article */}
                {relevantBlog && (
                  <div className="sidebar-section">
                    <h3>Further Reading</h3>
                    <Link to={`/blog/${relevantBlog.slug}`} className="related-card blog-link-card">
                      <span className="related-icon"><FiBookOpen /></span>
                      <div>
                        <h4>{relevantBlog.title}</h4>
                        <span className="related-meta">{relevantBlog.reading_time || 5} min read</span>
                      </div>
                    </Link>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PromptDetail;
