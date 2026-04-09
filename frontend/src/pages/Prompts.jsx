import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiArrowRight, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import AdBlock from '../components/AdBlock';
import { PromptGridSkeleton } from '../components/Skeleton';
import { promptsAPI, categoriesAPI } from '../services/api';
import './Prompts.css';

const Prompts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const currentCategory = searchParams.get('category') || '';
  const currentDifficulty = searchParams.get('difficulty') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [promptsRes, catRes] = await Promise.all([
          promptsAPI.getAll({
            page: currentPage,
            limit: 12,
            category: currentCategory,
            difficulty: currentDifficulty,
            search: searchParams.get('search'),
          }),
          categoriesAPI.getAll(),
        ]);
        setPrompts(promptsRes.data.data);
        setPagination(promptsRes.data.pagination);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('search', search);
  };

  return (
    <>
      <SEO
        title="AI Prompt Library"
        description="Browse our comprehensive library of curated AI prompts for ChatGPT, Midjourney, and more."
        keywords="AI prompts, prompt library, ChatGPT prompts, Midjourney prompts"
      />

      <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="prompts-hero">
          <div className="container">
            <h1>AI Prompt Library</h1>
            <p>Discover {pagination.total || 'curated'} prompts crafted for maximum results</p>

            <form className="search-bar" onSubmit={handleSearch} id="prompt-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search prompts by title, description, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="prompts-layout">
              <aside className="prompts-sidebar" id="prompts-filters">
                <div className="filter-section">
                  <h3 className="filter-title">Categories</h3>
                  <button
                    className={`filter-btn ${!currentCategory ? 'active' : ''}`}
                    onClick={() => updateFilter('category', '')}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`filter-btn ${currentCategory === cat.slug ? 'active' : ''}`}
                      onClick={() => updateFilter('category', cat.slug)}
                    >
                      <span>{cat.icon}</span> {cat.name}
                      <span className="filter-count">{cat.prompt_count}</span>
                    </button>
                  ))}
                </div>

                <div className="filter-section">
                  <h3 className="filter-title">Difficulty</h3>
                  {['', 'beginner', 'intermediate', 'advanced'].map(level => (
                    <button
                      key={level}
                      className={`filter-btn ${currentDifficulty === level ? 'active' : ''}`}
                      onClick={() => updateFilter('difficulty', level)}
                    >
                      {level || 'All Levels'}
                    </button>
                  ))}
                </div>
              </aside>

              <div className="prompts-main">
                {loading ? (
                  <PromptGridSkeleton count={6} />
                ) : prompts.length === 0 ? (
                  <div className="empty-state">
                    <h3>No prompts found</h3>
                    <p>Try adjusting your filters or search terms</p>
                  </div>
                ) : (
                  <>
                    <div className="prompts-list">
                      {prompts.reduce((acc, prompt, i) => {
                        acc.push(
                          <motion.div
                            key={prompt.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: (i % 6) * 0.05 }}
                          >
                            <div className="prompt-card">
                              <div className="prompt-card-header">
                                <span className="badge badge-primary" style={prompt.category_color ? { background: `${prompt.category_color}20`, color: prompt.category_color } : {}}>
                                  {prompt.category_icon} {prompt.category_name}
                                </span>
                                <span className={`badge badge-${prompt.difficulty === 'beginner' ? 'success' : prompt.difficulty === 'advanced' ? 'error' : 'warning'}`}>
                                  {prompt.difficulty}
                                </span>
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
                                  View Prompt <FiArrowRight />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        );
                        // Insert native_banner_inline ad after every 4th card
                        if ((i + 1) % 4 === 0 && i + 1 < prompts.length) {
                          acc.push(
                            <div key={`ad-native-${i}`} className="prompts-ad-inline" style={{ gridColumn: '1 / -1', margin: 'var(--space-2) 0' }}>
                              <AdBlock placement="native_banner_inline" fallbackText="Sponsored Ad" minHeight={90} />
                            </div>
                          );
                        }
                        return acc;
                      }, [])}
                    </div>

                    {pagination.totalPages > 1 && (
                      <div className="pagination" id="pagination">
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={!pagination.hasPrevPage}
                          onClick={() => updateFilter('page', currentPage - 1)}
                        >
                          <FiChevronLeft /> Prev
                        </button>
                        <span className="pagination-info">
                          Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={!pagination.hasNextPage}
                          onClick={() => updateFilter('page', currentPage + 1)}
                        >
                          Next <FiChevronRight />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Prompts;
