import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { pagesAPI } from '../services/api';

/**
 * Universal CMS page renderer.
 * Used for /about, /company, /privacy-policy, /terms
 * Props:
 *   slug — the page slug (string, e.g. 'about')
 */
const CmsPage = ({ slug: propSlug }) => {
  const { slug: paramSlug } = useParams();
  const slug = propSlug || paramSlug;
  const navigate = useNavigate();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setPage(null);

    pagesAPI.getBySlug(slug)
      .then(({ data }) => setPage(data.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="prompts-hero">
          <div className="container">
            <div style={{ height: '40px', width: '300px', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', margin: '0 auto var(--space-4)' }} />
            <div style={{ height: '20px', width: '200px', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', margin: '0 auto' }} />
          </div>
        </section>
        <section className="section">
          <div className="container" style={{ maxWidth: '800px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: '18px', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-sm)', marginBottom: '12px', width: `${70 + (i % 3) * 10}%` }} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  // 404 — unpublished or not found
  if (notFound || !page) {
    return (
      <>
        <SEO title="Page Not Found" description="The page you are looking for does not exist." />
        <div className="page-enter" style={{ paddingTop: 'var(--header-height)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-6xl)', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              404
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-6)' }}>
              This page doesn&apos;t exist or isn&apos;t available right now.
            </p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Go Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={page.meta_title || page.title}
        description={page.meta_description || ''}
      />
      <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="prompts-hero">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1>{page.title}</h1>
              {page.updated_at && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  Last updated: {new Date(page.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              )}
            </motion.div>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: '800px' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
              style={{ padding: 'var(--space-8)', lineHeight: 1.8 }}
            >
              {/* Content is sanitized on the backend before being stored */}
              <div
                className="prose cms-content"
                dangerouslySetInnerHTML={{ __html: page.content || '' }}
              />
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CmsPage;
