import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiEye, FiEyeOff, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { pagesAPI } from '../../services/api';
import './AdminDashboard.css';

const Toggle = ({ checked, onChange, id, label }) => (
  <label
    htmlFor={id}
    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}
  >
    <div
      id={id}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={onChange}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange()}
      style={{
        width: '44px', height: '24px', borderRadius: '999px',
        background: checked ? 'var(--color-primary)' : 'var(--color-border)',
        position: 'relative', transition: 'background 0.2s',
        cursor: 'pointer', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '3px',
        left: checked ? '22px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: 'white', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
      {label}
    </span>
  </label>
);

const AdminPageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    content: '',
    is_published: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [charCounts, setCharCounts] = useState({ meta_title: 0, meta_description: 0 });

  useEffect(() => {
    pagesAPI.adminGet(id)
      .then(({ data }) => {
        const p = data.data;
        setForm({
          title: p.title || '',
          slug: p.slug || '',
          meta_title: p.meta_title || '',
          meta_description: p.meta_description || '',
          content: p.content || '',
          is_published: !!p.is_published,
        });
        setCharCounts({
          meta_title: (p.meta_title || '').length,
          meta_description: (p.meta_description || '').length,
        });
      })
      .catch(() => navigate('/admin/pages'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === 'meta_title' || key === 'meta_description') {
      setCharCounts(prev => ({ ...prev, [key]: value.length }));
    }
  };

  const handleSave = async () => {
    setErrorMsg('');
    setSaveStatus(null);

    if (!form.title.trim()) {
      setSaveStatus('error');
      setErrorMsg('Title is required.');
      return;
    }

    setSaving(true);
    try {
      await pagesAPI.update(id, form);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      setErrorMsg(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link to="/admin/pages" className="btn btn-ghost btn-sm">
            <FiArrowLeft /> Back
          </Link>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
              Edit: {form.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <code style={{ fontSize: '13px', color: 'var(--color-primary-light)', background: 'var(--color-primary-glow)', padding: '2px 8px', borderRadius: '4px' }}>
                /{form.slug}
              </code>
              {form.is_published && (
                <a href={`/${form.slug}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiExternalLink size={12} /> View live
                </a>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowPreview(p => !p)}
            id="toggle-preview"
          >
            <FiEye size={14} /> {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving}
            id="save-page"
          >
            <FiSave /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Status banners */}
      {saveStatus === 'success' && (
        <div className="alert alert-success" style={{ marginBottom: 'var(--space-5)' }}>
          ✅ Page saved successfully.
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
          ❌ {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr', gap: 'var(--space-6)' }}>
        {/* ── Editor Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          {/* Basic Info */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>Page Details</h2>
            </div>
            <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Page title"
                  maxLength={255}
                  id="page-title"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Slug <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>(read-only)</span></label>
                <input
                  className="form-input"
                  value={`/${form.slug}`}
                  readOnly
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  id="page-slug"
                />
              </div>
              <div>
                <Toggle
                  id="page-published"
                  checked={form.is_published}
                  onChange={() => set('is_published', !form.is_published)}
                  label={form.is_published
                    ? '✅ Published — visible to everyone'
                    : '🔒 Hidden — only visible to admins'
                  }
                />
              </div>
            </div>
          </motion.div>

          {/* SEO Fields */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>SEO Meta Tags</h2>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Optimise for search engines</span>
            </div>
            <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Meta Title
                  <span style={{ fontSize: '11px', color: charCounts.meta_title > 60 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                    {charCounts.meta_title}/60
                  </span>
                </label>
                <input
                  className="form-input"
                  value={form.meta_title}
                  onChange={(e) => set('meta_title', e.target.value)}
                  placeholder="Appears in browser tab & search results"
                  maxLength={255}
                  id="page-meta-title"
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Meta Description
                  <span style={{ fontSize: '11px', color: charCounts.meta_description > 160 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                    {charCounts.meta_description}/160
                  </span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={form.meta_description}
                  onChange={(e) => set('meta_description', e.target.value)}
                  placeholder="Short description shown in search engine results"
                  maxLength={500}
                  id="page-meta-desc"
                />
              </div>

              {/* SERP preview */}
              {(form.meta_title || form.meta_description) && (
                <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Search Preview
                  </div>
                  <div style={{ color: '#4a90e2', fontSize: '18px', fontWeight: 400, marginBottom: '2px' }}>
                    {form.meta_title || form.title}
                  </div>
                  <div style={{ color: '#006621', fontSize: '13px', marginBottom: '4px' }}>
                    https://aipromptloops.me/{form.slug}
                  </div>
                  <div style={{ color: '#545454', fontSize: '13px', lineHeight: 1.4 }}>
                    {form.meta_description || 'No description set.'}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Content Editor */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>Page Content</h2>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Supports HTML. Scripts are removed automatically.</span>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              <textarea
                className="form-textarea"
                rows={20}
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                placeholder="<h2>Section Title</h2>&#10;<p>Your page content here...</p>"
                id="page-content"
                style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.6 }}
              />
            </div>
          </motion.div>
        </div>

        {/* ── Live Preview Column ── */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="dashboard-section"
            style={{ position: 'sticky', top: '80px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="dashboard-section-header">
              <h2><FiEye size={14} style={{ marginRight: '6px' }} /> Live Preview</h2>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              {/* Title preview */}
              <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
                {form.title || 'Page Title'}
              </h1>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-5) 0' }} />
              {/* Content preview */}
              <div
                className="prose cms-content"
                style={{ lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:var(--color-text-muted)">No content yet.</p>' }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky bottom save */}
      <div style={{ position: 'sticky', bottom: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          id="save-page-bottom"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <FiSave /> {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default AdminPageForm;
