import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiZap, FiLayers, FiBookOpen, FiTrendingUp, FiStar, FiCopy, FiCheck, FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { promptsAPI, categoriesAPI, blogAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [featuredPrompts, setFeaturedPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [promptsRes, categoriesRes, blogRes] = await Promise.allSettled([
          promptsAPI.getAll({ featured: 'true', limit: 4 }),
          categoriesAPI.getAll(),
          blogAPI.getAll({ limit: 3 }),
        ]);

        if (promptsRes.status === 'fulfilled') setFeaturedPrompts(promptsRes.value.data.data);
        if (categoriesRes.status === 'fulfilled') setCategories(categoriesRes.value.data.data);
        if (blogRes.status === 'fulfilled') setBlogPosts(blogRes.value.data.data);
      } catch (err) {
        console.error('Failed to fetch homepage data:', err);
      }
    };
    fetchData();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stats = [
    { icon: <FiZap />, value: '500+', label: 'AI Prompts' },
    { icon: <FiLayers />, value: '8+', label: 'Categories' },
    { icon: <FiBookOpen />, value: '50+', label: 'Articles' },
    { icon: <FiTrendingUp />, value: '10K+', label: 'Users' },
  ];

  return (
    <>
      <SEO
        title="AI Prompt Engineering Hub - Master AI Prompts"
        description="Discover, create, and master AI prompts. The ultimate prompt engineering resource for ChatGPT, Midjourney, Claude, and more."
        keywords="AI prompts, prompt engineering, ChatGPT, Midjourney, AI tools"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'AI Prompt Engineering Hub',
          description: 'The ultimate AI prompt engineering resource',
          url: window.location.origin,
        }}
      />

      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero-bg-effects">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
          <div className="hero-grid-lines"></div>
        </div>

        <div className="container hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-text"
          >
            <span className="hero-badge">
              <FiZap /> The #1 Prompt Engineering Resource
            </span>
            <h1 className="hero-title">
              Master the Art of
              <span className="hero-title-gradient"> AI Prompt</span>
              <br />Engineering
            </h1>
            <p className="hero-subtitle">
              Discover curated prompts, powerful tools, and expert guides to unlock 
              the full potential of AI models like ChatGPT, Midjourney, Claude, and more.
            </p>
            <div className="hero-actions">
              <Link to="/prompts" className="btn btn-primary btn-lg" id="hero-cta-explore">
                Explore Prompts <FiArrowRight />
              </Link>
              <Link to="/tools" className="btn btn-secondary btn-lg" id="hero-cta-tools">
                Try AI Tools <FiZap />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-stats"
          >
            {stats.map(({ icon, value, label }, i) => (
              <div key={label} className="hero-stat">
                <div className="stat-icon">{icon}</div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section" id="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Browse by Category</h2>
            <p>Explore AI prompts organized across popular categories and use cases</p>
          </div>

          <div className="categories-grid">
            {categories.slice(0, 8).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link to={`/prompts?category=${cat.slug}`} className="category-card" id={`category-${cat.slug}`}>
                  <div className="category-icon" style={{ background: `${cat.color}15`, color: cat.color }}>
                    <span>{cat.icon}</span>
                  </div>
                  <h3 className="category-name">{cat.name}</h3>
                  <p className="category-desc">{cat.description}</p>
                  <span className="category-count">{cat.prompt_count || 0} prompts</span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="section-cta">
            <Link to="/categories" className="btn btn-secondary" id="view-all-categories">
              View All Categories <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Prompts */}
      <section className="section section-alt" id="featured-prompts-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Prompts</h2>
            <p>Hand-picked prompts that deliver exceptional results</p>
          </div>

          <div className="prompts-grid">
            {featuredPrompts.map((prompt, i) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="prompt-card" id={`prompt-${prompt.slug}`}>
                  <div className="prompt-card-header">
                    <span className="badge badge-primary" style={prompt.category_color ? { background: `${prompt.category_color}20`, color: prompt.category_color } : {}}>
                      {prompt.category_icon} {prompt.category_name}
                    </span>
                    <div className="prompt-meta-badges">
                      <span className={`badge badge-${prompt.difficulty === 'beginner' ? 'success' : prompt.difficulty === 'advanced' ? 'error' : 'warning'}`}>
                        {prompt.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="prompt-card-title">
                    <Link to={`/prompts/${prompt.slug}`}>{prompt.title}</Link>
                  </h3>
                  <p className="prompt-card-desc">{prompt.description}</p>

                  <div className="prompt-card-footer">
                    <div className="prompt-stats">
                      <span><FiStar /> {prompt.likes || 0}</span>
                      <span>{prompt.ai_model}</span>
                    </div>
                    <Link to={`/prompts/${prompt.slug}`} className="btn btn-ghost btn-sm">
                      View <FiArrowRight />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="section-cta">
            <Link to="/prompts" className="btn btn-primary" id="view-all-prompts">
              Browse All Prompts <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {blogPosts.length > 0 && (
        <section className="section" id="blog-section">
          <div className="container">
            <div className="section-header">
              <h2>Latest from the Blog</h2>
              <p>Tips, guides, and insights on AI prompt engineering</p>
            </div>

            <div className="blog-grid">
              {blogPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link to={`/blog/${post.slug}`} className="blog-card" id={`blog-${post.slug}`}>
                    <div className="blog-card-image">
                      <div className="blog-card-placeholder">
                        <FiBookOpen />
                      </div>
                    </div>
                    <div className="blog-card-content">
                      <div className="blog-card-meta">
                        <span className="badge badge-primary">{post.category}</span>
                        <span className="blog-date">{post.reading_time} min read</span>
                      </div>
                      <h3 className="blog-card-title">{post.title}</h3>
                      <p className="blog-card-excerpt">{post.excerpt}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="section-cta">
              <Link to="/blog" className="btn btn-secondary" id="view-all-blog">
                Read All Articles <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section" id="cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="cta-content"
          >
            <h2>Ready to Master AI Prompts?</h2>
            <p>Start exploring our library of curated prompts and powerful AI tools today.</p>
            <div className="hero-actions">
              <Link to="/prompts" className="btn btn-primary btn-lg">
                Get Started Free <FiArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
