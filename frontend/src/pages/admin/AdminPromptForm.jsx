import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiInfo, FiCheckCircle, FiAlertTriangle, FiLink, FiImage } from 'react-icons/fi';
import { promptsAPI, categoriesAPI } from '../../services/api';

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
const CharCounter = ({ value, max, warn = false }) => {
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

const AdminPromptForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [seoWarnings, setSeoWarnings] = useState([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', content: '', example_output: '',
    category_id: '', tags: '', difficulty: 'intermediate',
    ai_model: 'ChatGPT', use_case: '', is_featured: false, is_published: true,
    meta_title: '', meta_description: '',
    // New SEO fields
    seo_title: '', focus_keyword: '', slug: '',
    canonical_url: '', og_image: '', noindex: false, schema_type: 'HowTo',
    seo_score: 0,
  });

  // Real-time SEO score (client-side preview)
  const calcScore = useCallback(() => {
    const kw = (form.focus_keyword || '').toLowerCase();
    const title = (form.seo_title || form.title || '').toLowerCase();
    const desc = (form.meta_description || '').toLowerCase();
    const sl = (form.slug || '').toLowerCase();
    let score = 0;
    if (kw && title.includes(kw)) score += 20;
    if (kw && desc.includes(kw)) score += 15;
    const wc = (form.content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
    if (wc > 300) score += 20;
    if (kw && sl.includes(kw)) score += 15;
    const internalLinks = (form.content || '').match(/href=["']\/[^"']+["']/g)?.length || 0;
    if (internalLinks > 0) score += 10;
    if (form.og_image) score += 10;
    if (form.schema_type && form.schema_type !== 'WebPage') score += 10;
    return Math.min(100, score);
  }, [form]);

  useEffect(() => {
    categoriesAPI.getAll().then(res => setCategories(res.data.data)).catch(() => {});

    if (isEdit && location.state?.prompt) {
      const p = location.state.prompt;
      const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []);
      setForm({
        title: p.title || '', description: p.description || '', content: p.content || '',
        example_output: p.example_output || '', category_id: p.category_id || '',
        tags: tags.join(', '), difficulty: p.difficulty || 'intermediate',
        ai_model: p.ai_model || 'ChatGPT', use_case: p.use_case || '',
        is_featured: !!p.is_featured, is_published: p.is_published !== false,
        meta_title: p.meta_title || '', meta_description: p.meta_description || '',
        seo_title: p.seo_title || '', focus_keyword: p.focus_keyword || '',
        slug: p.slug || '', canonical_url: p.canonical_url || '',
        og_image: p.og_image || '', noindex: !!p.noindex,
        schema_type: p.schema_type || 'HowTo', seo_score: p.seo_score || 0,
      });
      setSlugManuallyEdited(true);
    }
  }, [id]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && form.title) {
      setForm(prev => ({ ...prev, slug: slugify(form.title) }));
    }
  }, [form.title, slugManuallyEdited]);

  // Auto-fill seo_title from title if empty
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
        category_id: form.category_id || null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      let resp;
      if (isEdit) {
        resp = await promptsAPI.update(id, payload);
        setSuccess('Prompt updated successfully!');
      } else {
        resp = await promptsAPI.create(payload);
        setSuccess('Prompt created successfully!');
        setTimeout(() => navigate('/admin/prompts'), 2000);
      }

      if (resp?.data?.seoWarnings?.length) {
        setSeoWarnings(resp.data.seoWarnings);
      }
      if (resp?.data?.seoScore !== undefined) {
        setForm(prev => ({ ...prev, seo_score: resp.data.seoScore }));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save prompt');
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const liveScore = calcScore();

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <button onClick={() => navigate('/admin/prompts')} className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-3)' }}>
            <FiArrowLeft /> Back to Prompts
          </button>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{isEdit ? 'Edit Prompt' : 'Create Prompt'}</h1>
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
            <input className="form-input" required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Prompt title" />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Brief description" />
          </div>

          <div className="form-group">
            <label className="form-label">Prompt Content *</label>
            <textarea className="form-textarea" rows={10} required value={form.content} onChange={(e) => update('content', e.target.value)} placeholder="Full prompt template..." style={{ fontFamily: "'Fira Code', monospace", fontSize: 'var(--font-size-sm)' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Example Output</label>
            <textarea className="form-textarea" rows={3} value={form.example_output} onChange={(e) => update('example_output', e.target.value)} placeholder="What the expected output looks like" />
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
              <select className="form-select" value={form.category_id} onChange={(e) => update('category_id', e.target.value)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select className="form-select" value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">AI Model</label>
              <select className="form-select" value={form.ai_model} onChange={(e) => update('ai_model', e.target.value)}>
                <option value="ChatGPT">ChatGPT</option>
                <option value="Claude">Claude</option>
                <option value="Gemini">Gemini</option>
                <option value="Midjourney">Midjourney</option>
                <option value="DALL-E">DALL-E</option>
                <option value="Stable Diffusion">Stable Diffusion</option>
              </select>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="e.g., content, marketing, SEO" />
            </div>
            <div className="form-group">
              <label className="form-label">Use Case</label>
              <input className="form-input" value={form.use_case} onChange={(e) => update('use_case', e.target.value)} placeholder="e.g., Content Marketing" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} /> Featured
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_published} onChange={(e) => update('is_published', e.target.checked)} /> Published
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
              <input className="form-input" value={form.focus_keyword} onChange={(e) => update('focus_keyword', e.target.value)} placeholder="e.g., ChatGPT marketing prompt" />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>The main keyword for this page</span>
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
              placeholder="Short description shown in search results (100–160 chars)"
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
                URL: /prompts/<strong>{form.slug || 'your-slug'}</strong>
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Schema Type</label>
              <select className="form-select" value={form.schema_type} onChange={(e) => update('schema_type', e.target.value)}>
                <option value="HowTo">HowTo</option>
                <option value="Article">Article</option>
                <option value="FAQ">FAQ</option>
                <option value="WebPage">WebPage</option>
              </select>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label"><FiImage size={12} /> OG Image URL</label>
              <input className="form-input" value={form.og_image} onChange={(e) => update('og_image', e.target.value)} placeholder="https://yourdomain.com/image.webp" />
              {form.og_image && (
                <img src={form.og_image} alt="OG Preview"
                  style={{ marginTop: 'var(--space-2)', maxHeight: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  onError={e => e.target.style.display = 'none'}
                />
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Canonical URL (optional)</label>
              <input className="form-input" value={form.canonical_url} onChange={(e) => update('canonical_url', e.target.value)} placeholder="https://yourdomain.com/prompts/..." />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Leave blank to auto-generate</span>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.noindex} onChange={(e) => update('noindex', e.target.checked)} />
              <span style={{ color: form.noindex ? 'var(--color-error)' : undefined }}>
                NoIndex (hide from search engines)
              </span>
            </label>
            {form.noindex && (
              <div style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)' }}>
                ⚠️ This page will not appear in Google / Bing results
              </div>
            )}
          </div>

          {/* SEO Score breakdown */}
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>SEO Score Breakdown</div>
            {[
              { label: 'Keyword in SEO title', points: 20, met: form.focus_keyword && (form.seo_title || form.title).toLowerCase().includes(form.focus_keyword.toLowerCase()) },
              { label: 'Keyword in meta description', points: 15, met: form.focus_keyword && form.meta_description.toLowerCase().includes(form.focus_keyword.toLowerCase()) },
              { label: 'Content > 300 words', points: 20, met: (form.content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length > 300 },
              { label: 'Keyword in slug', points: 15, met: form.focus_keyword && form.slug.includes(form.focus_keyword.toLowerCase().replace(/\s+/g, '-')) },
              { label: 'Internal links in content', points: 10, met: (form.content || '').match(/href=["']\/[^"']+["']/g)?.length > 0 },
              { label: 'OG Image set', points: 10, met: !!form.og_image },
              { label: 'Schema type (not WebPage)', points: 10, met: form.schema_type && form.schema_type !== 'WebPage' },
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

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Meta Title (legacy)</label>
            <input className="form-input" value={form.meta_title} onChange={(e) => update('meta_title', e.target.value)} placeholder="Falls back to SEO title" />
          </div>
          <div className="form-group" style={{ display: 'none' }} />
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
          <FiSave /> {saving ? 'Saving...' : isEdit ? 'Update Prompt' : 'Create Prompt'}
        </button>
      </form>
    </div>
  );
};

export default AdminPromptForm;
