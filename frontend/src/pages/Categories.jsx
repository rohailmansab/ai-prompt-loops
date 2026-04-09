import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import SEO from '../components/SEO';
import { categoriesAPI } from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await categoriesAPI.getAll();
        setCategories(data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <>
      <SEO title="Prompt Categories" description="Browse AI prompts by category. Find the perfect prompt for your needs." />
      <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="prompts-hero">
          <div className="container">
            <h1>Prompt Categories</h1>
            <p>Explore prompts organized by topic and use case</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {loading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : (
              <div className="grid grid-3">
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link to={`/prompts?category=${cat.slug}`} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ fontSize: '36px', marginBottom: 'var(--space-4)' }}>{cat.icon}</div>
                      <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)' }}>{cat.name}</h3>
                      <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>{cat.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-primary">{cat.prompt_count || 0} prompts</span>
                        <FiArrowRight style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Categories;
