import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiAlertTriangle, FiLink, FiImage, FiExternalLink, FiSquare } from 'react-icons/fi';
import { blogAPI } from '../../services/api';

// ── SEO Score Ring ─────────────────────────────────────────
const SeoScoreRing = ({ score }) => {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: `conic-gradient(${color} ${score * 3.6}deg, var(--color-bg-secondary) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--color-bg-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 'var(--font-size-sm)',
          color,
        }}>{score}</div>
      </div>
      <div>
        <div style={{ fontWeight: 700, color }}>{label}</div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>SEO Score / 100</div>
      </div>
    </div>
  );
};

// ── Character Counter ─────────────────────────────────────
const CharCounter = ({ value, max }) => {
  const len = (value || '').length;
  const over = len > max;
  const close = len > max * 0.9;
  return (
    <span style={{
      fontSize: 'var(--font-size-xs)',
      color: over ? 'var(--color-error)' : close ? 'var(--color-warning)' : 'var(--color-text-muted)',
      marginLeft: 'var(--space-2)',
    }}>
      {len}/{max}
    </span>
  );
};

// ── Slug generator ─────────────────────────────────────────
const slugify = (text) =>
  text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-').replace(/^-+|-+$/g, '');

// ── URL validation (only http/https/relative) ──────────────
const isSafeUrl = (url) => {
  if (!url) return false;
  if (url.startsWith('/') || url.startsWith('./')) return true;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
};

// ── Content Toolbar (§5 — Images, Links, Buttons) ──────────
const ContentToolbar = ({ onInsert }) => {
  const [showModal, setShowModal] = useState(null); // null|'image'|'link'|'button'
  const [imgUrl, setImgUrl] = useState('');
  const [imgAlt, setImgAlt] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [btnLabel, setBtnLabel] = useState('');
  const [btnUrl, setBtnUrl] = useState('');
  const [btnStyle, setBtnStyle] = useState('primary');
  const [btnId, setBtnId] = useState(() => `btn-${Date.now()}`);

  const reset = () => {
    setImgUrl(''); setImgAlt(''); setLinkText(''); setLinkUrl('');
    setBtnLabel(''); setBtnUrl(''); setBtnStyle('primary');
    setBtnId(`btn-${Date.now()}`);
    setShowModal(null);
  };

  const insertImage = () => {
    if (!isSafeUrl(imgUrl)) { alert('Please enter a valid https:// image URL'); return; }
    const snippet = `<figure>\n  <img src="${imgUrl}" alt="${imgAlt || 'image'}" loading="lazy" style="max-width:100%;border-radius:8px;" />\n  ${imgAlt ? `<figcaption>${imgAlt}</figcaption>` : ''}\n</figure>`;
    onInsert(snippet);
    reset();
  };

  const insertLink = () => {
    if (!linkText.trim()) { alert('Please enter link text'); return; }
    if (!isSafeUrl(linkUrl)) { alert('Please enter a valid URL (https:// or /path)'); return; }
    const isExternal = linkUrl.startsWith('http');
    const snippet = `<a href="${linkUrl}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>${linkText}</a>`;
    onInsert(snippet);
    reset();
  };

  const insertButton = () => {
    if (!btnLabel.trim()) { alert('Please enter a button label'); return; }
    if (!isSafeUrl(btnUrl)) { alert('Please enter a valid URL (https:// or /path)'); return; }
    // §4: SmartRedirectButton rendered from data attributes in blog content
    const snippet = `<div class="blog-smart-btn-wrapper">\n  <a href="${btnUrl}" data-redirect-id="${btnId}" data-redirect-style="${btnStyle}" class="smart-redirect-link" target="_blank" rel="noopener noreferrer">${btnLabel}</a>\n</div>`;
    onInsert(snippet);
    reset();
  };

  const toolbarBtnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.35rem 0.75rem', borderRadius: '6px',
    fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface-2)',
    color: 'var(--color-text-secondary)',
    transition: 'all 0.15s', flexShrink: 0,
  };

  const modalOverlay = {
    position: 'fixed', inset: 0, zIndex: 8000,
    background: 'rgba(0,0,0,0.6)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '1rem',
  };
  const modalCard = {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px', padding: '1.5rem',
    width: 'min(480px, 96vw)',
    display: 'flex', flexDirection: 'column', gap: '1rem',
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--color-surface-1)', borderRadius: '8px 8px 0 0', border: '1px solid var(--color-border)', borderBottom: 'none' }}>
        <button type="button" style={toolbarBtnStyle} onClick={() => setShowModal('image')} title="Insert Image">
          <FiImage /> Image
        </button>
        <button type="button" style={toolbarBtnStyle} onClick={() => setShowModal('link')} title="Insert Link">
          <FiLink /> Link
        </button>
        <button type="button" style={{ ...toolbarBtnStyle, borderColor: 'rgba(139,92,246,0.4)', color: 'var(--color-primary-light)' }} onClick={() => setShowModal('button')} title="Insert Smart Redirect Button">
          <FiSquare /> Smart Button
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
          Content Editor
        </span>
      </div>

      {/* Image modal */}
      {showModal === 'image' && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Insert Image</h3>
            <div className="form-group">
              <label className="form-label">Image URL (https://...)*</label>
              <input className="form-input" value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
            </div>
            <div className="form-group">
              <label className="form-label">Alt Text (accessibility + SEO)</label>
              <input className="form-input" value={imgAlt} onChange={e => setImgAlt(e.target.value)} placeholder="Describe the image..." />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={insertImage}><FiImage /> Insert Image</button>
            </div>
          </div>
        </div>
      )}

      {/* Link modal */}
      {showModal === 'link' && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Insert Link</h3>
            <div className="form-group">
              <label className="form-label">Link Text *</label>
              <input className="form-input" value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="Click here" />
            </div>
            <div className="form-group">
              <label className="form-label">URL (https://... or /internal/path) *</label>
              <input className="form-input" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://example.com or /blog/my-post" />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                Internal paths start with /. External links open in a new tab.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={insertLink}><FiLink /> Insert Link</button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Button modal */}
      {showModal === 'button' && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Insert Smart Redirect Button</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
              First click opens a sponsor ad. Second click goes to the target URL. (§4)
            </p>
            <div className="form-group">
              <label className="form-label">Button Label *</label>
              <input className="form-input" value={btnLabel} onChange={e => setBtnLabel(e.target.value)} placeholder="Visit Resource" />
            </div>
            <div className="form-group">
              <label className="form-label">Target URL *</label>
              <input className="form-input" value={btnUrl} onChange={e => setBtnUrl(e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Style</label>
                <select className="form-select" value={btnStyle} onChange={e => setBtnStyle(e.target.value)}>
                  <option value="primary">Primary (Filled)</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Button ID (auto)</label>
                <input className="form-input" value={btnId} onChange={e => setBtnId(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '0.8rem' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={insertButton}><FiSquare /> Insert Button</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AdminBlogForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = !!id;

  const contentRef = useRef(null); // §5: reference for cursor-position insert

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [seoWarnings, setSeoWarnings] = useState([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', featured_image: '',
    category: '', tags: '', status: 'draft',
    reading_time: 5, is_featured: false,
    meta_title: '', meta_description: '',
    // SEO fields
    seo_title: '', focus_keyword: '', slug: '',
    canonical_url: '', og_image: '', noindex: false, schema_type: 'Article',
    seo_score: 0,
  });

  const calcScore = useCallback(() => {
    const kw = (form.focus_keyword || '').toLowerCase();
    const title = (form.seo_title || form.title || '').toLowerCase();
    const desc = (form.meta_description || form.excerpt || '').toLowerCase();
    const sl = (form.slug || '').toLowerCase();
    let score = 0;
    if (kw && title.includes(kw)) score += 20;
    if (kw && desc.includes(kw)) score += 15;
    const wc = (form.content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
    if (wc > 300) score += 20;
    if (kw && sl.includes(kw)) score += 15;
    const internalLinks = (form.content || '').match(/href=["']\/[^"']+["']/g)?.length || 0;
    if (internalLinks > 0) score += 10;
    if (form.og_image || form.featured_image) score += 10;
    if (form.schema_type && form.schema_type !== 'WebPage') score += 10;
    return Math.min(100, score);
  }, [form]);

  useEffect(() => {
    if (isEdit && location.state?.post) {
      const p = location.state.post;
      const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []);
      setForm({
        title: p.title || '', excerpt: p.excerpt || '', content: p.content || '',
        featured_image: p.featured_image || '', category: p.category || '',
        tags: tags.join(', '), status: p.status || 'draft',
        reading_time: p.reading_time || 5, is_featured: !!p.is_featured,
        meta_title: p.meta_title || '', meta_description: p.meta_description || '',
        seo_title: p.seo_title || '', focus_keyword: p.focus_keyword || '',
        slug: p.slug || '', canonical_url: p.canonical_url || '',
        og_image: p.og_image || '', noindex: !!p.noindex,
        schema_type: p.schema_type || 'Article', seo_score: p.seo_score || 0,
      });
      setSlugManuallyEdited(true);
    }
  }, [id, location]);

  useEffect(() => {
    if (!slugManuallyEdited && form.title) {
      setForm(prev => ({ ...prev, slug: slugify(form.title) }));
    }
  }, [form.title, slugManuallyEdited]);

  useEffect(() => {
    if (!form.seo_title && form.title) {
      const kw = form.focus_keyword;
      const auto = kw && !form.title.toLowerCase().includes(kw.toLowerCase())
        ? `${form.title} — ${kw}`
        : form.title;
      setForm(prev => ({ ...prev, seo_title: auto.substring(0, 60) }));
    }
  }, [form.title, form.focus_keyword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    setSeoWarnings([]);

    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        reading_time: parseInt(form.reading_time) || 5,
        og_image: form.og_image || form.featured_image, // Fallback for SEO
      };

      let resp;
      if (isEdit) {
        resp = await blogAPI.update(id, payload);
        setSuccess('Post updated successfully!');
      } else {
        resp = await blogAPI.create(payload);
        setSuccess('Post created successfully!');
        setTimeout(() => navigate('/admin/blog'), 2000);
      }

      if (resp?.data?.seoWarnings?.length) {
        setSeoWarnings(resp.data.seoWarnings);
      }
      if (resp?.data?.seoScore !== undefined) {
        setForm(prev => ({ ...prev, seo_score: resp.data.seoScore }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const liveScore = calcScore();

  // §5: Insert snippet at current cursor position in the content textarea
  const insertAtCursor = useCallback((snippet) => {
    const ta = contentRef.current;
    if (!ta) {
      update('content', (form.content || '') + '\n' + snippet);
      return;
    }
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const before = (form.content || '').slice(0, start);
    const after  = (form.content || '').slice(end);
    const newContent = before + '\n' + snippet + '\n' + after;
    update('content', newContent);
    // Restore cursor after snippet
    requestAnimationFrame(() => {
      const newPos = start + snippet.length + 2;
      ta.setSelectionRange(newPos, newPos);
      ta.focus();
    });
  }, [form.content]);

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <button onClick={() => navigate('/admin/blog')} className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-3)' }}>
            <FiArrowLeft /> Back to Blog
          </button>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{isEdit ? 'Edit Blog Post' : 'Create Blog Post'}</h1>
        </div>
        <SeoScoreRing score={liveScore} />
      </div>

      <form onSubmit={handleSubmit} className="dashboard-section" style={{ padding: 'var(--space-6)' }}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {seoWarnings.length > 0 && (
          <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
            <strong><FiAlertTriangle /> SEO Warnings:</strong>
            <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 'var(--space-5)' }}>
              {seoWarnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        {/* ── Content ───────────────────────────────── */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            Content
          </div>

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Post title" />
          </div>

          <div className="form-group">
            <label className="form-label">Excerpt (also used for fallback meta description)</label>
            <textarea className="form-textarea" rows={3} value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} placeholder="Brief summary" />
          </div>

          <div className="form-group">
            <label className="form-label">Content * (HTML supported)</label>
            {/* §5 — Content Toolbar: Image / Link / Smart Button */}
            <ContentToolbar onInsert={insertAtCursor} />
            <textarea
              ref={contentRef}
              className="form-textarea"
              rows={15}
              required
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder="Full blog post content..."
              style={{ fontFamily: "'Fira Code', monospace", fontSize: 'var(--font-size-sm)', borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}
            />
          </div>
        </div>

        {/* ── Settings ──────────────────────────────── */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            Settings
          </div>
          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="e.g., Guide, Tips" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Reading Time (min)</label>
              <input className="form-input" type="number" value={form.reading_time} onChange={(e) => update('reading_time', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="e.g., AI, guide" />
            </div>
            <div className="form-group">
              <label className="form-label">Featured Image URL</label>
              <input className="form-input" value={form.featured_image} onChange={(e) => update('featured_image', e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-5)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} /> Featured Post
            </label>
          </div>
        </div>

        {/* ── SEO Panel ─────────────────────────────── */}
        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          background: 'var(--color-bg-secondary)',
          marginBottom: 'var(--space-6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)' }}>
              🔍 SEO Settings
            </div>
            <SeoScoreRing score={liveScore} />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">
                SEO Title
                <CharCounter value={form.seo_title} max={60} />
              </label>
              <input className="form-input" value={form.seo_title} onChange={(e) => update('seo_title', e.target.value)} placeholder="Auto-generated from title" maxLength={70} />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Recommended: 50–60 characters</span>
            </div>
            <div className="form-group">
              <label className="form-label">Focus Keyword</label>
              <input className="form-input" value={form.focus_keyword} onChange={(e) => update('focus_keyword', e.target.value)} placeholder="e.g., ai prompt engineering" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Meta Description
              <CharCounter value={form.meta_description} max={160} />
            </label>
            <textarea className="form-textarea" rows={3}
              value={form.meta_description}
              onChange={(e) => update('meta_description', e.target.value)}
              placeholder="Searches will see this (100–160 chars). Falls back to excerpt."
              maxLength={175}
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label"><FiLink size={12} /> Slug (URL)</label>
              <input className="form-input"
                value={form.slug}
                onChange={(e) => { setSlugManuallyEdited(true); update('slug', slugify(e.target.value)); }}
                placeholder="auto-generated-from-title"
                style={{ fontFamily: 'monospace' }}
              />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                URL: /blog/<strong>{form.slug || 'your-slug'}</strong>
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Schema Type</label>
              <select className="form-select" value={form.schema_type} onChange={(e) => update('schema_type', e.target.value)}>
                <option value="Article">Article</option>
                <option value="BlogPosting">BlogPosting</option>
                <option value="HowTo">HowTo</option>
                <option value="FAQ">FAQ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label"><FiImage size={12} /> OG Image URL</label>
              <input className="form-input" value={form.og_image} onChange={(e) => update('og_image', e.target.value)} placeholder="Leave blank to use Featured Image" />
            </div>
            <div className="form-group">
              <label className="form-label">Canonical URL (optional)</label>
              <input className="form-input" value={form.canonical_url} onChange={(e) => update('canonical_url', e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.noindex} onChange={(e) => update('noindex', e.target.checked)} />
              <span style={{ color: form.noindex ? 'var(--color-error)' : undefined }}>
                NoIndex (hide from search engines)
              </span>
            </label>
          </div>

          {/* SEO Breakdown */}
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>SEO Score Breakdown</div>
            {[
              { label: 'Keyword in SEO title', points: 20, met: form.focus_keyword && (form.seo_title || form.title).toLowerCase().includes(form.focus_keyword.toLowerCase()) },
              { label: 'Keyword in meta description', points: 15, met: form.focus_keyword && (form.meta_description || form.excerpt || '').toLowerCase().includes(form.focus_keyword.toLowerCase()) },
              { label: 'Content > 300 words', points: 20, met: (form.content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length > 300 },
              { label: 'Keyword in slug', points: 15, met: form.focus_keyword && form.slug.includes(form.focus_keyword.toLowerCase().replace(/\s+/g, '-')) },
              { label: 'Internal links in content', points: 10, met: (form.content || '').match(/href=["']\/[^"']+["']/g)?.length > 0 },
              { label: 'Image set', points: 10, met: !!(form.og_image || form.featured_image) },
              { label: 'Schema type optimized', points: 10, met: form.schema_type && form.schema_type !== 'WebPage' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-1) 0', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)' }}>
                <span style={{ color: item.met ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                  {item.met ? '✅' : '⬜'} {item.label}
                </span>
                <span style={{ color: item.met ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 700 }}>
                  {item.met ? `+${item.points}` : `+0/${item.points}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
          <FiSave /> {saving ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default AdminBlogForm;
