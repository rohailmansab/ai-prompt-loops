import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiEye, FiEyeOff, FiInfo } from 'react-icons/fi';
import { adsAPI } from '../../services/api';

// §2 — Extended placements including interaction-based monetization
const PLACEMENTS = [
  { value: 'prompt_top',    label: 'Prompt — Top',        group: 'Content Ads' },
  { value: 'prompt_bottom', label: 'Prompt — Bottom',     group: 'Content Ads' },
  { value: 'sidebar',       label: 'Sidebar',              group: 'Content Ads' },
  { value: 'blog_top',      label: 'Blog — Top',           group: 'Content Ads' },
  { value: 'blog_middle',   label: 'Blog — Middle',        group: 'Content Ads' },
  { value: 'blog_bottom',   label: 'Blog — Bottom',        group: 'Content Ads' },
  { value: 'list_inline',   label: 'List — Inline',        group: 'Content Ads' },
  // Interaction-based
  { value: 'tool_action',         label: '🔒 Tool Action Gate',  group: 'Interaction Monetization' },
  { value: 'popup_blog',          label: '📢 Blog Popup',         group: 'Interaction Monetization' },
  { value: 'redirect_click',      label: '🔗 Smart Redirect',     group: 'Interaction Monetization' },
  { value: 'popunder_global',     label: '💥 Popunder (Global)',  group: 'Interaction Monetization' },
  { value: 'native_banner_inline',label: '📰 Native Banner (Inline)', group: 'Interaction Monetization' },
  { value: 'social_bar_global',   label: '🔔 Social Bar (Global)', group: 'Interaction Monetization' },
];

const PLACEMENT_DESCRIPTIONS = {
  tool_action:          'Fullscreen ad shown when users click Generate or Enhance. Ad must play for 4 seconds before user can proceed.',
  popup_blog:           'Centered modal popup shown once per session when a blog page loads (after 1.5s delay). Non-blocking.',
  redirect_click:       'Ad URL shown in a new tab on first button click; actual destination opened on second click.',
  popunder_global:      'Triggers on FIRST user click anywhere on site. Automatically guarded to trigger only ONCE per session.',
  native_banner_inline: 'Injected between paragraphs in blog posts and between prompt cards in lists.',
  social_bar_global:    'Sticky floating bar (top or bottom). User can close it, and it auto-hides for 24 hours.',
};

const PLACEMENT_GROUPS = [...new Set(PLACEMENTS.map(p => p.group))];

const AdminAdsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    placement: 'prompt_top',
    ad_code: '',
    status: true,
    priority: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);

  // Pre-populate from router state or fetch from API
  useEffect(() => {
    if (isEdit) {
      const stateAd = location.state?.ad;
      if (stateAd) {
        setForm({
          name: stateAd.name || '',
          placement: stateAd.placement || 'prompt_top',
          ad_code: stateAd.ad_code || '',
          status: Boolean(stateAd.status),
          priority: stateAd.priority != null ? String(stateAd.priority) : '',
        });
      } else {
        setLoading(true);
        adsAPI.adminGetAll()
          .then(({ data }) => {
            const found = data.data.find(a => String(a.id) === String(id));
            if (found) {
              setForm({
                name: found.name,
                placement: found.placement,
                ad_code: found.ad_code,
                status: Boolean(found.status),
                priority: found.priority != null ? String(found.priority) : '',
              });
            } else {
              setError('Ad not found');
            }
          })
          .catch(() => setError('Failed to load ad'))
          .finally(() => setLoading(false));
      }
    }
  }, [id, isEdit, location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Ad name is required'); return; }
    if (!form.ad_code.trim()) { setError('Ad code is required'); return; }

    // Validate priority if set
    if (form.priority !== '' && (isNaN(parseInt(form.priority)) || parseInt(form.priority) < 1)) {
      setError('Priority must be a positive number (1 = highest)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        priority: form.priority !== '' ? parseInt(form.priority) : null,
      };
      if (isEdit) {
        await adsAPI.update(id, payload);
      } else {
        await adsAPI.create(payload);
      }
      navigate('/admin/ads');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save ad');
    } finally {
      setSaving(false);
    }
  };

  const selectedPlacement = PLACEMENTS.find(p => p.value === form.placement);

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '300px' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
            {isEdit ? 'Edit Ad' : 'New Ad'}
          </h1>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
            {isEdit ? 'Update the ad configuration below' : 'Create an ad for any placement — including interaction-based monetization'}
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/admin/ads')}
          id="back-to-ads"
        >
          <FiArrowLeft /> Back to Ads
        </button>
      </div>

      <div className="dashboard-section">
        <form onSubmit={handleSubmit} id="ad-form">
          {error && (
            <div
              className="form-error-banner"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                color: 'var(--color-error)',
                marginBottom: 'var(--space-6)',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              {error}
            </div>
          )}

          {/* Name + Placement row */}
          <div className="grid grid-2" style={{ marginBottom: 'var(--space-5)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="ad-name">Ad Name</label>
              <input
                id="ad-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. Tool Gate — Generator, Blog Popup — Sponsor"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ad-placement">Placement</label>
              <select
                id="ad-placement"
                name="placement"
                className="form-input"
                value={form.placement}
                onChange={handleChange}
              >
                {PLACEMENT_GROUPS.map(group => (
                  <optgroup key={group} label={group}>
                    {PLACEMENTS.filter(p => p.group === group).map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {/* Placement description */}
              {PLACEMENT_DESCRIPTIONS[form.placement] && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-2)',
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                }}>
                  <FiInfo style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                  {PLACEMENT_DESCRIPTIONS[form.placement]}
                </div>
              )}
            </div>
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-2" style={{ marginBottom: 'var(--space-5)' }}>
            {/* Status toggle */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="ad-status"
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', width: 'fit-content' }}
              >
                <span className="toggle-switch">
                  <input
                    id="ad-status"
                    name="status"
                    type="checkbox"
                    checked={form.status}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  <span
                    className="toggle-track"
                    style={{
                      display: 'inline-flex',
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      background: form.status ? 'var(--color-success)' : 'var(--color-surface-3)',
                      position: 'relative',
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '3px',
                        left: form.status ? '23px' : '3px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }}
                    />
                  </span>
                </span>
                <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                  {form.status ? 'Active — Ad will show on site' : 'Inactive — Ad is hidden'}
                </span>
              </label>
            </div>

            {/* Priority input */}
            <div className="form-group">
              <label className="form-label" htmlFor="ad-priority">
                Priority
                <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 4 }}>(optional — 1 = highest)</span>
              </label>
              <input
                id="ad-priority"
                name="priority"
                type="number"
                className="form-input"
                placeholder="e.g. 1"
                min="1"
                max="999"
                value={form.priority}
                onChange={handleChange}
              />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                When multiple ads share a placement, lower number wins.
              </span>
            </div>
          </div>

          {/* Ad Code textarea */}
          <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <label className="form-label" htmlFor="ad-code" style={{ marginBottom: 0 }}>
                Ad Code
              </label>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setPreview(p => !p)}
                style={{ fontSize: 'var(--font-size-xs)' }}
              >
                {preview ? <><FiEyeOff /> Hide Preview</> : <><FiEye /> Preview</>}
              </button>
            </div>
            <textarea
              id="ad-code"
              name="ad_code"
              className="form-input"
              placeholder={'Paste your full Adsterra or Google AdSense code here…\n\n<!-- Example Adsterra -->\n<script type="text/javascript" src="//..."></script>\n\n<!-- Example AdSense -->\n<ins class="adsbygoogle" ...></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>\n\n<!-- For redirect_click: just paste a link URL or HTML with href -->\n<a href="https://your-ad-url.com">Ad link</a>'}
              value={form.ad_code}
              onChange={handleChange}
              rows={10}
              style={{
                fontFamily: 'monospace',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 1.6,
                resize: 'vertical',
              }}
            />
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-1)' }}>
              Paste the complete ad snippet including all &lt;script&gt; tags. Only admin can submit ad code.
            </p>
          </div>

          {/* Live preview */}
          {preview && form.ad_code && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <p className="form-label">Preview (HTML structure only — scripts won't execute in preview)</p>
              <div
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  minHeight: '90px',
                  overflow: 'auto',
                }}
                dangerouslySetInnerHTML={{
                  __html: form.ad_code
                    .replace(/<script[\s\S]*?<\/script>/gi, '<em style="color:var(--color-text-muted);font-size:0.8em">[script tag — will execute on page]</em>')
                }}
              />
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              id="save-ad-btn"
            >
              <FiSave /> {saving ? 'Saving…' : isEdit ? 'Update Ad' : 'Create Ad'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/ads')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAdsForm;
