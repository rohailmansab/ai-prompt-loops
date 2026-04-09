import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiCode,
  FiBarChart2,
  FiList,
} from 'react-icons/fi';
import { adsAPI } from '../../services/api';

const PLACEMENT_LABELS = {
  prompt_top:     'Prompt — Top',
  prompt_bottom:  'Prompt — Bottom',
  sidebar:        'Sidebar',
  blog_top:       'Blog — Top',
  blog_middle:    'Blog — Middle',
  blog_bottom:    'Blog — Bottom',
  list_inline:    'List — Inline',
  // §2 — Interaction-based monetization
  tool_action:          '🔒 Tool Gate',
  popup_blog:           '📢 Blog Popup',
  redirect_click:       '🔗 Smart Redirect',
  popunder_global:      '💥 Popunder',
  native_banner_inline: '📰 Native Banner',
  social_bar_global:    '🔔 Social Bar',
};

// Determine badge color class for interaction placements
const isInteractionPlacement = (p) => [
  'tool_action', 'popup_blog', 'redirect_click', 
  'popunder_global', 'native_banner_inline', 'social_bar_global'
].includes(p);

/* ── Small stat card ── */
const StatCard = ({ label, value }) => (
  <div style={{
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-4) var(--space-5)',
    minWidth: 130,
  }}>
    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary-light)' }}>
      {value}
    </div>
    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
      {label}
    </div>
  </div>
);

/* ── CTR colour: green ≥5%, amber ≥2%, grey otherwise ── */
const ctrColor = (ctr) => {
  const v = parseFloat(ctr);
  if (v >= 5) return 'var(--color-success)';
  if (v >= 2) return 'var(--color-warning)';
  return 'var(--color-text-muted)';
};

const AdminAds = () => {
  const [ads,       setAds]       = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [tab,       setTab]       = useState('ads');   // 'ads' | 'analytics'
  const [loading,   setLoading]   = useState(true);
  const [aLoading,  setALoading]  = useState(false);
  const [actionId,  setActionId]  = useState(null);
  const navigate = useNavigate();

  /* ── Load ad list ── */
  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data } = await adsAPI.adminGetAll();
      setAds(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchAds(); }, []);

  /* ── Load analytics lazily on tab switch (§5) ── */
  useEffect(() => {
    if (tab !== 'analytics' || analytics) return;
    setALoading(true);
    adsAPI.adminAnalytics()
      .then(({ data }) => setAnalytics(data.data))
      .catch(console.error)
      .finally(() => setALoading(false));
  }, [tab, analytics]);

  const handleToggle = async (id) => {
    setActionId(id);
    try {
      const { data } = await adsAPI.toggle(id);
      setAds(prev => prev.map(a => a.id === id ? { ...a, status: data.status ? 1 : 0 } : a));
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ad "${name}"? This cannot be undone.`)) return;
    setActionId(id);
    try {
      await adsAPI.delete(id);
      setAds(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const tabBtn = (active) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    fontWeight: 600,
    fontSize: 'var(--font-size-sm)',
    cursor: 'pointer',
    border: '1px solid',
    borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
    background: active ? 'var(--color-primary-glow)' : 'transparent',
    color: active ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
    transition: 'all 0.15s ease',
  });

  return (
    <div>
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Ads Management</h1>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
            {ads.length} ad{ads.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <button style={tabBtn(tab === 'ads')} onClick={() => setTab('ads')} id="tab-ads">
            <FiList /> Ads
          </button>
          <button style={tabBtn(tab === 'analytics')} onClick={() => setTab('analytics')} id="tab-analytics">
            <FiBarChart2 /> Analytics
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/admin/ads/new')}
            id="new-ad-btn"
          >
            <FiPlus /> New Ad
          </button>
        </div>
      </div>

      {/* ══════════ ADS TAB ══════════ */}
      {tab === 'ads' && (
        <div className="dashboard-section">
          <div className="dashboard-table">
            {loading ? (
              <div className="loading-container" style={{ minHeight: '200px' }}>
                <div className="spinner" />
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Placement</th>
                    <th style={{ width: 70 }}>Priority</th>
                    <th style={{ width: 90 }}>Status</th>
                    <th>Updated</th>
                    <th style={{ width: 130 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map(ad => (
                    <tr key={ad.id}>
                      <td style={{ fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <FiCode style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                          {ad.name}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isInteractionPlacement(ad.placement) ? 'badge-warning' : 'badge-primary'}`}
                          style={isInteractionPlacement(ad.placement) ? { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' } : undefined}
                        >
                          {PLACEMENT_LABELS[ad.placement] || ad.placement}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)', fontWeight: ad.priority ? 700 : 400 }}>
                        {ad.priority ?? '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggle(ad.id)}
                          disabled={actionId === ad.id}
                          id={`toggle-ad-${ad.id}`}
                          title={ad.status ? 'Click to deactivate' : 'Click to activate'}
                          style={{
                            color: ad.status ? 'var(--color-success)' : 'var(--color-text-muted)',
                            fontSize: '1.3rem',
                            padding: 'var(--space-1)',
                          }}
                        >
                          {ad.status ? <FiToggleRight /> : <FiToggleLeft />}
                        </button>
                      </td>
                      <td style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        {new Date(ad.updated_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigate(`/admin/ads/${ad.id}`, { state: { ad } })}
                            title="Edit"
                            id={`edit-ad-${ad.id}`}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDelete(ad.id, ad.name)}
                            disabled={actionId === ad.id}
                            title="Delete"
                            id={`delete-ad-${ad.id}`}
                            style={{ color: 'var(--color-error)' }}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {ads.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-muted)' }}>
                        No ads configured yet. Click &ldquo;New Ad&rdquo; to add your first one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ══════════ ANALYTICS TAB (§5) ══════════ */}
      {tab === 'analytics' && (
        <div className="dashboard-section">
          {aLoading ? (
            <div className="loading-container" style={{ minHeight: '200px' }}>
              <div className="spinner" />
            </div>
          ) : analytics ? (
            <>
              {/* Totals */}
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
                <StatCard label="Total Impressions" value={analytics.totals.impressions.toLocaleString()} />
                <StatCard label="Total Clicks"      value={analytics.totals.clicks.toLocaleString()} />
                <StatCard
                  label="Overall CTR"
                  value={
                    analytics.totals.impressions > 0
                      ? `${((analytics.totals.clicks / analytics.totals.impressions) * 100).toFixed(2)}%`
                      : '—'
                  }
                />
                <StatCard label="Total Ads" value={analytics.totals.ads} />
              </div>

              {/* Per-ad table sorted by CTR desc */}
              <div className="dashboard-table" style={{ marginBottom: 'var(--space-8)' }}>
                <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', fontWeight: 700 }}>
                  Performance by Ad — sorted by CTR ↓
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Ad Name</th>
                      <th>Placement</th>
                      <th style={{ textAlign: 'right' }}>Impressions</th>
                      <th style={{ textAlign: 'right' }}>Clicks</th>
                      <th style={{ textAlign: 'right' }}>CTR %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.perAd.map((row) => (
                      <tr key={`${row.ad_id}_${row.placement}`}>
                        <td style={{ fontWeight: 600 }}>{row.ad_name || `Ad #${row.ad_id}`}</td>
                        <td>
                          <span className="badge badge-primary">
                            {PLACEMENT_LABELS[row.placement] || row.placement}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                          {Number(row.impressions).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                          {Number(row.clicks).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: ctrColor(row.ctr) }}>
                          {row.ctr != null ? `${row.ctr}%` : '—'}
                        </td>
                      </tr>
                    ))}
                    {analytics.perAd.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                          No ad events recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Top placements */}
              {analytics.topPlacements.length > 0 && (
                <div className="dashboard-table">
                  <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', fontWeight: 700 }}>
                    Top Performing Placements
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Placement</th>
                        <th style={{ textAlign: 'right' }}>Impressions</th>
                        <th style={{ textAlign: 'right' }}>Clicks</th>
                        <th style={{ textAlign: 'right' }}>CTR %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topPlacements.map((p) => (
                        <tr key={p.placement}>
                          <td style={{ fontWeight: 600 }}>{PLACEMENT_LABELS[p.placement] || p.placement}</td>
                          <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                            {Number(p.impressions).toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                            {Number(p.clicks).toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: ctrColor(p.ctr) }}>
                            {p.ctr != null ? `${p.ctr}%` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-muted)' }}>
              No analytics data available yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAds;
