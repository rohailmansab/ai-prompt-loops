import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogIn, FiZap, FiLock, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/SEO';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(credentials);
      navigate('/admin');
    } catch (err) {
      setError(err.error || 'Login failed');
    }
  };

  return (
    <>
      <SEO title="Admin Login" noIndex />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', top: '-200px', right: '-200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)', filter: 'blur(80px)' }}></div>
        <div style={{ position: 'absolute', width: '400px', height: '400px', bottom: '-150px', left: '-150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)', filter: 'blur(80px)' }}></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '420px', padding: 'var(--space-6)', position: 'relative', zIndex: 1 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', fontSize: '24px', color: 'white', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
              <FiZap />
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Admin Panel</h1>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>Sign in to manage your AI Prompt Hub</p>
          </div>

          <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-8)' }} id="admin-login-form">
            {error && (
              <div style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-5)' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label"><FiUser style={{ marginRight: '4px' }} /> Username</label>
              <input
                className="form-input"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Enter your username"
                required
                id="login-username"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><FiLock style={{ marginRight: '4px' }} /> Password</label>
              <input
                className="form-input"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter your password"
                required
                id="login-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-2)' }} disabled={loading} id="login-submit">
              {loading ? 'Signing in...' : <><FiLogIn /> Sign In</>}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLogin;
