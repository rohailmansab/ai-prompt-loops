import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiGrid, FiBookOpen, FiClock, FiEye, FiCopy, FiZap, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { analyticsAPI } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: res } = await analyticsAPI.getDashboard();
        setData(res);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  const statCards = [
    { icon: <FiEye />, label: 'Page Views', value: data?.totalViews || 0, color: '#6366f1' },
    { icon: <FiCopy />, label: 'Prompt Copies', value: data?.totalCopies || 0, color: '#10b981' },
    { icon: <FiZap />, label: 'Tool Usages', value: data?.totalToolUsage || 0, color: '#06b6d4' },
    { icon: <FiClock />, label: 'Avg Engagement (sec)', value: data?.avgEngagementTime || 0, color: '#f59e0b' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Real-time insights and usage tracking</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/admin/prompts/new" className="btn btn-primary btn-sm"><FiPlus /> New Prompt</Link>
          <Link to="/admin/blog/new" className="btn btn-secondary btn-sm"><FiPlus /> New Post</Link>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-card-info">
                <span className="stat-card-value">{stat.value.toLocaleString()}</span>
                <span className="stat-card-label">{stat.label}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section" style={{ gridColumn: 'span 2' }}>
           <div className="dashboard-section-header">
            <h2><FiTrendingUp style={{ marginRight: '8px' }}/> Traffic Over Time (Views)</h2>
          </div>
          <div style={{ width: '100%', height: 300, paddingRight: '20px' }}>
            <ResponsiveContainer>
              <LineChart data={data?.viewsOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--color-text-secondary)" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="var(--color-text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString([], { month: 'long', day: 'numeric' })}
                />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={3} dot={{ fill: 'var(--color-primary)', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2><FiFileText style={{ marginRight: '8px' }}/> Popular Prompts</h2>
          </div>
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th style={{ textAlign: 'right' }}>Copies/Views</th>
                </tr>
              </thead>
              <tbody>
                {(data?.popularPrompts || []).map((p, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ color: 'var(--color-text-primary)' }}>{p.title}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--color-primary-light)' }}>
                      {p.actions_count}
                    </td>
                  </tr>
                ))}
                {(!data?.popularPrompts || data.popularPrompts.length === 0) && (
                  <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Not enough data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
