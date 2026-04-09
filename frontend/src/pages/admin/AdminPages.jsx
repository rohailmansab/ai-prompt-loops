import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiEdit2, FiEye, FiEyeOff, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { pagesAPI } from '../../services/api';
import './AdminDashboard.css';

const StatusBadge = ({ published }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
    background: published ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
    color: published ? '#10b981' : '#ef4444',
  }}>
    {published ? <FiEye size={11} /> : <FiEyeOff size={11} />}
    {published ? 'Published' : 'Hidden'}
  </span>
);

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    pagesAPI.adminGetAll()
      .then(({ data }) => setPages(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (page) => {
    setToggling(page.id);
    try {
      const { data } = await pagesAPI.toggle(page.id);
      setPages(prev =>
        prev.map(p => p.id === page.id ? { ...p, is_published: data.is_published } : p)
      );
    } catch (err) {
      console.error('Failed to toggle page:', err);
    } finally {
      setToggling(null);
    }
  };

  const slugToUrl = (slug) => `/${slug}`;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiFileText /> CMS Pages
          </h1>
          <p>Manage static content pages — edit, publish, or hide</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-section"
        >
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Page Title</th>
                  <th>Slug / URL</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{page.title}</div>
                      {page.meta_title && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          {page.meta_title}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <code style={{ fontSize: '13px', color: 'var(--color-primary-light)', background: 'var(--color-primary-glow)', padding: '2px 8px', borderRadius: '4px' }}>
                          /{page.slug}
                        </code>
                        {page.is_published && (
                          <a
                            href={slugToUrl(page.slug)}
                            target="_blank"
                            rel="noreferrer"
                            title="View live page"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <FiExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td><StatusBadge published={page.is_published} /></td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(page.updated_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {/* Toggle publish */}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggle(page)}
                          disabled={toggling === page.id}
                          title={page.is_published ? 'Hide page' : 'Publish page'}
                          style={{ padding: '6px 10px', color: page.is_published ? 'var(--color-error)' : '#10b981' }}
                          id={`toggle-page-${page.id}`}
                        >
                          {page.is_published ? <><FiEyeOff size={14} /> Hide</> : <><FiEye size={14} /> Publish</>}
                        </button>
                        {/* Edit */}
                        <Link
                          to={`/admin/pages/${page.id}`}
                          className="btn btn-secondary btn-sm"
                          id={`edit-page-${page.id}`}
                        >
                          <FiEdit2 size={14} /> Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminPages;
