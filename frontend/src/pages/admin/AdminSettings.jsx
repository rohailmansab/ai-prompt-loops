import { useState, useEffect } from 'react';
import { FiSave, FiMail, FiPhone, FiMapPin, FiEye, FiEyeOff, FiSettings, FiFileText, FiLock, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { settingsAPI, authAPI } from '../../services/api';
import './AdminDashboard.css';

const Toggle = ({ checked, onChange, id, label }) => (
  <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
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
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        cursor: 'pointer',
      }}
    >
      <div style={{
        position: 'absolute', top: '3px',
        left: checked ? '22px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: 'white',
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{label}</span>
  </label>
);

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    show_email: 'true',
    show_phone: 'false',
    show_address: 'false',
    about_content: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  // Credentials Modal State
  const [showCredModal, setShowCredModal] = useState(false);
  const [credForm, setCredForm] = useState({ currentPassword: '', newUsername: '', newPassword: '', confirmNewPassword: '' });
  const [credError, setCredError] = useState(null);
  const [credSuccess, setCredSuccess] = useState(null);
  const [credLoading, setCredLoading] = useState(false);

  useEffect(() => {
    settingsAPI.getAdmin()
      .then(({ data }) => setSettings((prev) => ({ ...prev, ...data.data })))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      await settingsAPI.update(settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCredSubmit = async (e) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(null);

    if (!credForm.currentPassword) {
      return setCredError('Current password is required.');
    }
    if (!credForm.newUsername && !credForm.newPassword) {
      return setCredError('At least one of New Username or New Password is required.');
    }
    if (credForm.newPassword && credForm.newPassword !== credForm.confirmNewPassword) {
      return setCredError('Passwords do not match.');
    }

    setCredLoading(true);
    try {
      const { data } = await authAPI.resetCredentials({
        currentPassword: credForm.currentPassword,
        newUsername: credForm.newUsername || undefined,
        newPassword: credForm.newPassword || undefined,
      });
      setCredSuccess(data.message);
      setCredForm({ currentPassword: '', newUsername: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => setShowCredModal(false), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || 'An unexpected error occurred.';
      setCredError(msg);
    } finally {
      setCredLoading(false);
    }
  };

  const toggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: prev[key] === 'true' ? 'false' : 'true' }));

  const set = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiSettings /> Site Settings
          </h1>
          <p>Control contact info, About page content, and visibility</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
          id="save-settings"
        >
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveStatus === 'success' && (
        <div className="alert alert-success" style={{ marginBottom: 'var(--space-6)' }}>
          ✅ Settings saved successfully.
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-6)' }}>
          ❌ Failed to save. Please try again.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

        {/* ── Contact Information ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="dashboard-section">
          <div className="dashboard-section-header">
            <h2><FiMail style={{ marginRight: '8px' }} /> Contact Information</h2>
          </div>
          <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMail style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Email Address</span>
              </div>
              <input
                className="form-input"
                type="email"
                value={settings.contact_email}
                onChange={(e) => set('contact_email', e.target.value)}
                placeholder="hello@example.com"
                id="setting-email"
              />
              <Toggle
                id="toggle-show-email"
                checked={settings.show_email === 'true'}
                onChange={() => toggle('show_email')}
                label={settings.show_email === 'true' ? 'Visible on Contact page' : 'Hidden from Contact page'}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

            {/* Phone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiPhone style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Phone Number</span>
              </div>
              <input
                className="form-input"
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => set('contact_phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                id="setting-phone"
              />
              <Toggle
                id="toggle-show-phone"
                checked={settings.show_phone === 'true'}
                onChange={() => toggle('show_phone')}
                label={settings.show_phone === 'true' ? 'Visible on Contact page' : 'Hidden from Contact page'}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

            {/* Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMapPin style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Address / Location</span>
              </div>
              <input
                className="form-input"
                type="text"
                value={settings.contact_address}
                onChange={(e) => set('contact_address', e.target.value)}
                placeholder="San Francisco, CA"
                id="setting-address"
              />
              <Toggle
                id="toggle-show-address"
                checked={settings.show_address === 'true'}
                onChange={() => toggle('show_address')}
                label={settings.show_address === 'true' ? 'Visible on Contact page' : 'Hidden from Contact page'}
              />
            </div>

          </div>
        </motion.div>

        {/* ── Security ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="dashboard-section" transition={{ delay: 0.1 }}>
          <div className="dashboard-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2><FiLock style={{ marginRight: '8px' }} /> Account Security</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowCredModal(true)} id="btn-reset-credentials">
              Reset Credentials
            </button>
          </div>
          <div style={{ padding: 'var(--space-6)' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
              Update your admin username and password securely. You will need your current password to apply any changes.
            </p>
          </div>
        </motion.div>



      </div>

      {/* Sticky save button for long forms */}
      <div style={{ position: 'sticky', bottom: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          id="save-settings-bottom"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <FiSave /> {saving ? 'Saving…' : 'Save All Settings'}
        </button>
    </div>

      {/* ── Reset Credentials Modal ── */}
      {showCredModal && (
        <div className="modal-backdrop" style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ maxWidth: '400px', width: '90%', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', position: 'relative', boxShadow: 'var(--shadow-xl)' }}
          >
            <button 
              onClick={() => setShowCredModal(false)}
              style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '20px' }}
            ><FiX /></button>
            <h2 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
              <FiLock /> Reset Credentials
            </h2>
            
            {credError && <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>❌ {credError}</div>}
            {credSuccess && <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>✅ {credSuccess}</div>}

            <form onSubmit={handleCredSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Current Password <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={credForm.currentPassword} 
                  onChange={(e) => setCredForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-2) 0' }} />
              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>New Username <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 'normal' }}>(Optional)</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={credForm.newUsername} 
                  onChange={(e) => setCredForm(prev => ({ ...prev, newUsername: e.target.value }))}
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>New Password <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 'normal' }}>(Optional)</span></label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={credForm.newPassword} 
                  onChange={(e) => setCredForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Leave blank to keep current"
                />
              </div>
              {credForm.newPassword && (
                <div>
                  <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Confirm New Password <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={credForm.confirmNewPassword} 
                    onChange={(e) => setCredForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                    required
                  />
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCredModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={credLoading}>
                  {credLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
