import { useState, useEffect } from 'react';
import { FiTrendingUp, FiAlertCircle, FiSearch, FiCheckCircle, FiLink, FiActivity } from 'react-icons/fi';
import { seoAPI } from '../../services/api';

const AdminSeoDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await seoAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      setError('Failed to load SEO dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <div style={{ padding: 'var(--space-6)' }}>Loading SEO data...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return null;

  const { summary, warnings, topPages, keywords } = data;

  const scoreColor = summary.avgSeoScore >= 70 ? 'var(--color-success)' : summary.avgSeoScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)';
  const pctColor = summary.pagesOptimizedPct >= 80 ? 'var(--color-success)' : summary.pagesOptimizedPct >= 50 ? 'var(--color-warning)' : 'var(--color-error)';

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>SEO Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Monitor and optimize search engine performance</p>
        </div>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────── */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dashboard-card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Avg SEO Score</div>
          <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 900, color: scoreColor, marginTop: 'var(--space-2)' }}>
            {summary.avgSeoScore}
          </div>
        </div>
        <div className="dashboard-card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Optimized Pages</div>
          <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 900, color: pctColor, marginTop: 'var(--space-2)' }}>
            {summary.pagesOptimizedPct}%
          </div>
        </div>
        <div className="dashboard-card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Total Indexed</div>
          <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 900, marginTop: 'var(--space-2)' }}>
            {summary.totalIndexed}
          </div>
        </div>
        <div className="dashboard-card">
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Critical Missing Meta</div>
          <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 900, color: summary.missingMeta > 0 ? 'var(--color-error)' : 'var(--color-success)', marginTop: 'var(--space-2)' }}>
            {summary.missingMeta}
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 'var(--space-6)', alignItems: 'start' }}>
        
        {/* ── SEO Action Items (Warnings) ────────────────────────── */}
        <div className="dashboard-card" style={{ height: '100%' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FiAlertCircle /> Action Items
          </h2>
          {warnings.length === 0 ? (
            <div className="alert alert-success"><FiCheckCircle /> Site is 100% SEO optimized!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {warnings.map((w, i) => (
                <div key={i} style={{
                  padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                  background: w.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : w.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  color: w.type === 'error' ? 'var(--color-error)' : w.type === 'warning' ? 'var(--color-warning)' : 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--font-size-sm)', fontWeight: 600
                }}>
                  <FiAlertCircle /> {w.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Keyword Tracking ───────────────────────────────────── */}
        <div className="dashboard-card" style={{ height: '100%' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FiSearch /> Keyword Performance
          </h2>
          {keywords.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No keyword data recorded yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: 'var(--space-2) 0' }}>Keyword</th>
                    <th style={{ padding: 'var(--space-2) 0' }}>Impr</th>
                    <th style={{ padding: 'var(--space-2) 0' }}>Clicks</th>
                    <th style={{ padding: 'var(--space-2) 0' }}>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.slice(0, 7).map(k => {
                    const ctr = k.impressions > 0 ? ((k.clicks / k.impressions) * 100).toFixed(1) : 0;
                    return (
                      <tr key={k.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: 'var(--space-3) 0', fontWeight: 600 }}>{k.keyword}</td>
                        <td style={{ padding: 'var(--space-3) 0', color: 'var(--color-text-muted)' }}>{k.impressions.toLocaleString()}</td>
                        <td style={{ padding: 'var(--space-3) 0', color: 'var(--color-primary)', fontWeight: 600 }}>{k.clicks.toLocaleString()}</td>
                        <td style={{ padding: 'var(--space-3) 0' }}>
                          <span style={{ color: ctr > 5 ? 'var(--color-success)' : ctr > 2 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
                            {ctr}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Top Performing Pages ───────────────────────────────── */}
      <div className="dashboard-card">
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <FiTrendingUp /> Top Indexed Pages
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Slug</th>
                <th>Views</th>
                <th>SEO Score</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((page, i) => (
                <tr key={`${page.type}-${page.slug}-${i}`}>
                  <td style={{ fontWeight: 600 }}>{page.title}</td>
                  <td>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', background: page.type === 'prompt' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: page.type === 'prompt' ? 'var(--color-primary)' : 'var(--color-success)' }}>
                      {page.type}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>/{page.type === 'prompt' ? 'prompts' : 'blog'}/{page.slug}</td>
                  <td style={{ fontWeight: 600 }}>{page.views.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div style={{ width: '40px', height: '6px', background: 'var(--color-bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${page.seo_score}%`, background: page.seo_score >= 70 ? 'var(--color-success)' : page.seo_score >= 40 ? 'var(--color-warning)' : 'var(--color-error)' }} />
                      </div>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>{page.seo_score}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {topPages.length === 0 && (
                <tr><td colSpan="5" className="text-center">No pages indexed yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSeoDashboard;
