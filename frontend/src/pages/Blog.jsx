import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiBookOpen, FiClock, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { BlogGridSkeleton } from '../components/Skeleton';
import { blogAPI } from '../services/api';
import './Blog.css';

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await blogAPI.getAll({ page: currentPage, limit: 9 });
        setPosts(data.data);
        setPagination(data.pagination);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [searchParams]);

  return (
    <>
      <SEO title="Blog" description="Expert articles, tips, and guides on AI prompt engineering." />
      <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="prompts-hero">
          <div className="container">
            <h1>Blog & Insights</h1>
            <p>Expert articles, tips, and guides on AI prompt engineering</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {loading ? (
              <BlogGridSkeleton count={6} />
            ) : posts.length === 0 ? (
              <div className="empty-state"><h3>No posts yet</h3><p>Check back soon for new content.</p></div>
            ) : (
              <>
                <div className="grid grid-3">
                  {posts.map((post, i) => (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                      <Link to={`/blog/${post.slug}`} className="card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit', padding: 0, overflow: 'hidden' }}>
                        <div style={{ height: '180px', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiBookOpen style={{ fontSize: '40px', color: 'var(--color-primary)', opacity: 0.3 }} />
                        </div>
                        <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                            <span className="badge badge-primary">{post.category || 'Article'}</span>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><FiClock /> {post.reading_time} min</span>
                          </div>
                          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', lineHeight: 1.4 }}>{post.title}</h3>
                          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', lineHeight: 1.6, flex: 1 }}>{post.excerpt}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)', color: 'var(--color-primary-light)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                            Read More <FiArrowRight />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="pagination" style={{ marginTop: 'var(--space-12)' }}>
                    <button className="btn btn-secondary btn-sm" disabled={!pagination.hasPrevPage} onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', currentPage - 1); setSearchParams(p); }}>
                      <FiChevronLeft /> Prev
                    </button>
                    <span className="pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
                    <button className="btn btn-secondary btn-sm" disabled={!pagination.hasNextPage} onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', currentPage + 1); setSearchParams(p); }}>
                      Next <FiChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Blog;
