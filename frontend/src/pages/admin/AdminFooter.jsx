import { useState, useEffect, useCallback } from 'react';
import {
  FiSave, FiPlus, FiTrash2, FiEye, FiEyeOff, FiSettings,
  FiLink2, FiGlobe, FiTwitter, FiGithub, FiLinkedin,
  FiMail, FiYoutube, FiFacebook, FiInstagram, FiEdit2, FiX,
  FiCheck, FiAlertCircle, FiLayout, FiRefreshCw,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { footerAPI } from '../../services/api';
import './AdminFooter.css';

// ── Social icon map ───────────────────────────────────────
const SOCIAL_ICONS = {
  twitter: <FiTwitter />, x: <FiTwitter />,
  github: <FiGithub />, linkedin: <FiLinkedin />,
  email: <FiMail />, mail: <FiMail />,
  youtube: <FiYoutube />, facebook: <FiFacebook />,
  instagram: <FiInstagram />,
};
const getIcon = (p) => SOCIAL_ICONS[p?.toLowerCase()] ?? <FiGlobe />;

const PLATFORMS = [
  'facebook', 'instagram', 'twitter', 'x', 'youtube',
  'github', 'linkedin', 'email', 'discord', 'tiktok',
  'pinterest', 'snapchat', 'other',
];

const COLUMN_OPTIONS = ['Product', 'Company', 'Resources', 'Legal', 'More'];

// ── Sub-components ────────────────────────────────────────

const Toggle = ({ checked, onChange, id, label }) => (
  <label htmlFor={id} className="af-toggle-label">
    <div
      id={id}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={onChange}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange()}
      className={`af-toggle-track ${checked ? 'af-toggle-on' : ''}`}
    >
      <div className="af-toggle-thumb" />
    </div>
    <span className="af-toggle-text">{label}</span>
  </label>
);

const VisiBadge = ({ visible }) => (
  <span className={`af-badge ${visible ? 'af-badge-green' : 'af-badge-red'}`}>
    {visible ? <FiEye size={10} /> : <FiEyeOff size={10} />}
    {visible ? 'Visible' : 'Hidden'}
  </span>
);

const Toast = ({ type, message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.97 }}
    className={`af-toast af-toast-${type}`}
  >
    {type === 'success' ? <FiCheck /> : <FiAlertCircle />}
    <span>{message}</span>
    <button className="af-toast-close" onClick={onClose} aria-label="Close"><FiX size={14} /></button>
  </motion.div>
);

// ── Main Component ────────────────────────────────────────
const AdminFooter = () => {
  const [settings, setSettings] = useState({
    site_name: '', footer_text: '', copyright_text: '',
    show_footer: true, show_social: true,
  });
  const [links, setLinks] = useState([]);
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'links' | 'socials'

  // New link form
  const [newLink, setNewLink] = useState({ label: '', url: '', column_group: 'Product' });
  const [addingLink, setAddingLink] = useState(false);

  // New social form
  const [newSocial, setNewSocial] = useState({ platform: '', url: '' });
  const [addingSocial, setAddingSocial] = useState(false);

  // Inline edit states
  const [editLink, setEditLink] = useState(null);
  const [editSocial, setEditSocial] = useState(null);
  const [linkSaving, setLinkSaving] = useState(null);
  const [socialSaving, setSocialSaving] = useState(null);

  // Inline delete confirmation (replaces window.confirm which can be blocked)
  const [confirmDeleteLinkId, setConfirmDeleteLinkId] = useState(null);
  const [confirmDeleteSocialId, setConfirmDeleteSocialId] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Load data (FIX: was .getAdmin(), correct is .adminGetFooter()) ─
  useEffect(() => {
    footerAPI.adminGetFooter()
      .then(({ data }) => {
        const { links: l, socials: s, ...rest } = data.data ?? {};
        setSettings({
          site_name: rest.site_name ?? '',
          footer_text: rest.footer_text ?? '',
          copyright_text: rest.copyright_text ?? '',
          show_footer: rest.show_footer === undefined ? true : !!rest.show_footer,
          show_social: rest.show_social === undefined ? true : !!rest.show_social,
        });
        setLinks(l ?? []);
        setSocials(s ?? []);
      })
      .catch((err) => {
        console.error('[AdminFooter] load error:', err);
        showToast('error', 'Failed to load footer data. Is the backend running?');
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  // ── Settings ──────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await footerAPI.updateSettings({
        ...settings,
        show_footer: settings.show_footer ? 1 : 0,
        show_social: settings.show_social ? 1 : 0,
      });
      showToast('success', 'Footer settings saved successfully!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Links CRUD ────────────────────────────────────────
  const handleAddLink = async () => {
    if (!newLink.label.trim() || !newLink.url.trim()) {
      showToast('error', 'Label and URL are required.');
      return;
    }
    setAddingLink(true);
    try {
      const { data } = await footerAPI.createLink({ ...newLink, position: links.length });
      setLinks((prev) => [...prev, data.data]);
      setNewLink({ label: '', url: '', column_group: 'Product' });
      showToast('success', 'Link added!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to add link.');
    } finally {
      setAddingLink(false);
    }
  };

  const handleSaveLink = async () => {
    if (!editLink) return;
    setLinkSaving(editLink.id);
    try {
      const res = await footerAPI.updateLink(editLink.id, {
        label: editLink.label,
        url: editLink.url,
        column_group: editLink.column_group,
        is_visible: editLink.is_visible ?? 1,
        position: editLink.position ?? 0,
      });
      // Backend returns { message, data: updatedLink } — handle both shapes
      const updated = res?.data?.data ?? res?.data ?? editLink;
      setLinks((prev) => prev.map((l) => l.id === editLink.id ? { ...l, ...updated } : l));
      setEditLink(null);
      showToast('success', 'Link updated!');
    } catch (err) {
      console.error('[updateLink]', err?.response?.data ?? err.message);
      showToast('error', `Update failed: ${err?.response?.data?.error ?? err.message ?? 'Unknown error'}`);
    } finally {
      setLinkSaving(null);
    }
  };

  const handleToggleLink = async (id) => {
    try {
      const { data } = await footerAPI.toggleLink(id);
      setLinks((prev) => prev.map((l) => l.id === id ? { ...l, is_visible: data.is_visible } : l));
    } catch {
      showToast('error', 'Failed to toggle link visibility.');
    }
  };

  const handleDeleteLink = async (id) => {
    // Two-step: first click sets confirm state, second click executes
    if (confirmDeleteLinkId !== id) {
      setConfirmDeleteLinkId(id);
      // Auto-reset after 4 seconds if user doesn't confirm
      setTimeout(() => setConfirmDeleteLinkId(null), 4000);
      return;
    }
    setConfirmDeleteLinkId(null);
    try {
      await footerAPI.deleteLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      showToast('success', 'Link deleted.');
    } catch (err) {
      console.error('[deleteLink]', err?.response?.data ?? err.message);
      showToast('error', `Delete failed: ${err?.response?.data?.error ?? err.message ?? 'Unknown error'}`);
    }
  };

  // ── Socials CRUD ──────────────────────────────────────
  const handleAddSocial = async () => {
    if (!newSocial.platform.trim() || !newSocial.url.trim()) {
      showToast('error', 'Platform and URL are required.');
      return;
    }
    setAddingSocial(true);
    try {
      const { data } = await footerAPI.createSocial({ ...newSocial, position: socials.length });
      setSocials((prev) => [...prev, data.data]);
      setNewSocial({ platform: '', url: '' });
      showToast('success', 'Social link added!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to add social link.');
    } finally {
      setAddingSocial(false);
    }
  };

  const handleSaveSocial = async () => {
    if (!editSocial) return;
    setSocialSaving(editSocial.id);
    try {
      const res = await footerAPI.updateSocial(editSocial.id, {
        platform: editSocial.platform,
        url: editSocial.url,
        is_visible: editSocial.is_visible ?? 1,
        position: editSocial.position ?? 0,
      });
      const updated = res?.data?.data ?? res?.data ?? editSocial;
      setSocials((prev) => prev.map((s) => s.id === editSocial.id ? { ...s, ...updated } : s));
      setEditSocial(null);
      showToast('success', 'Social link updated!');
    } catch (err) {
      console.error('[updateSocial]', err?.response?.data ?? err.message);
      showToast('error', `Update failed: ${err?.response?.data?.error ?? err.message ?? 'Unknown error'}`);
    } finally {
      setSocialSaving(null);
    }
  };

  const handleToggleSocial = async (id) => {
    try {
      const { data } = await footerAPI.toggleSocial(id);
      setSocials((prev) => prev.map((s) => s.id === id ? { ...s, is_visible: data.is_visible } : s));
    } catch {
      showToast('error', 'Failed to toggle social visibility.');
    }
  };

  const handleDeleteSocial = async (id) => {
    if (confirmDeleteSocialId !== id) {
      setConfirmDeleteSocialId(id);
      setTimeout(() => setConfirmDeleteSocialId(null), 4000);
      return;
    }
    setConfirmDeleteSocialId(null);
    try {
      await footerAPI.deleteSocial(id);
      setSocials((prev) => prev.filter((s) => s.id !== id));
      showToast('success', 'Social link deleted.');
    } catch (err) {
      console.error('[deleteSocial]', err?.response?.data ?? err.message);
      showToast('error', `Delete failed: ${err?.response?.data?.error ?? err.message ?? 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="af-loading">
        <div className="spinner" />
        <p>Loading footer data…</p>
      </div>
    );
  }

  const TABS = [
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
    { id: 'links', label: `Links (${links.length})`, icon: <FiLink2 /> },
    { id: 'socials', label: `Socials (${socials.length})`, icon: <FiGlobe /> },
  ];

  return (
    <div className="af-root">

      {/* ── Toast ── */}
      <div className="af-toast-container">
        <AnimatePresence>
          {toast && (
            <Toast
              key="toast"
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Page Header ── */}
      <div className="af-header">
        <div className="af-header-left">
          <div className="af-header-icon"><FiLayout /></div>
          <div>
            <h1 className="af-title">Footer CMS</h1>
            <p className="af-subtitle">Manage footer content, navigation links, and social profiles</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSaveSettings}
          disabled={saving || activeTab !== 'settings'}
          id="save-footer-settings"
        >
          {saving ? <FiRefreshCw className="spin-icon" /> : <FiSave />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="af-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`af-tab ${activeTab === tab.id ? 'af-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            id={`tab-${tab.id}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >

          {/* ════════ SETTINGS TAB ════════ */}
          {activeTab === 'settings' && (
            <div className="af-card">
              <div className="af-card-header">
                <h2><FiSettings /> Global Footer Settings</h2>
                <span className="af-card-hint">Changes apply after clicking "Save Settings" above</span>
              </div>
              <div className="af-card-body">
                <div className="af-field">
                  <label className="form-label" htmlFor="footer-site-name">Brand / Site Name</label>
                  <input
                    id="footer-site-name"
                    className="form-input"
                    value={settings.site_name}
                    onChange={(e) => setSettings((p) => ({ ...p, site_name: e.target.value }))}
                    placeholder="AI Prompt Loops"
                    maxLength={255}
                  />
                  <p className="af-hint">Shown next to the logo in the footer.</p>
                </div>

                <div className="af-field">
                  <label className="form-label" htmlFor="footer-text">Footer Description</label>
                  <textarea
                    id="footer-text"
                    className="form-textarea"
                    rows={3}
                    value={settings.footer_text}
                    onChange={(e) => setSettings((p) => ({ ...p, footer_text: e.target.value }))}
                    placeholder="Short tagline displayed below the logo…"
                  />
                  <p className="af-hint">Keep under 180 characters for best display.</p>
                </div>

                <div className="af-field">
                  <label className="form-label" htmlFor="footer-copyright">Copyright Text</label>
                  <input
                    id="footer-copyright"
                    className="form-input"
                    value={settings.copyright_text}
                    onChange={(e) => setSettings((p) => ({ ...p, copyright_text: e.target.value }))}
                    placeholder={`© ${new Date().getFullYear()} AI Prompt Loops. All rights reserved.`}
                    maxLength={500}
                  />
                </div>

                <div className="af-divider" />

                <div className="af-toggles">
                  <Toggle
                    id="toggle-show-footer"
                    checked={settings.show_footer}
                    onChange={() => setSettings((p) => ({ ...p, show_footer: !p.show_footer }))}
                    label={settings.show_footer ? 'Footer is visible to visitors' : 'Footer is hidden from visitors'}
                  />
                  <Toggle
                    id="toggle-show-social"
                    checked={settings.show_social}
                    onChange={() => setSettings((p) => ({ ...p, show_social: !p.show_social }))}
                    label={settings.show_social ? 'Social icons section is visible' : 'Social icons section is hidden'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ════════ LINKS TAB ════════ */}
          {activeTab === 'links' && (
            <div className="af-card">
              <div className="af-card-header">
                <h2><FiLink2 /> Footer Navigation Links</h2>
                <span className="af-card-count">{links.length} link{links.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="af-card-body">

                {/* Add new link form */}
                <div className="af-add-form">
                  <h3 className="af-add-title">Add New Link</h3>
                  <div className="af-add-grid">
                    <div className="form-group">
                      <label className="form-label">Label</label>
                      <input
                        className="form-input"
                        value={newLink.label}
                        onChange={(e) => setNewLink((p) => ({ ...p, label: e.target.value }))}
                        placeholder="e.g. Blog"
                        id="new-link-label"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">URL / Path</label>
                      <input
                        className="form-input"
                        value={newLink.url}
                        onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))}
                        placeholder="/blog or https://…"
                        id="new-link-url"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Column Group</label>
                      <select
                        className="form-select"
                        value={newLink.column_group}
                        onChange={(e) => setNewLink((p) => ({ ...p, column_group: e.target.value }))}
                        id="new-link-column"
                      >
                        {COLUMN_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                        <option value={newLink.column_group}>{newLink.column_group}</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-primary af-add-btn"
                      onClick={handleAddLink}
                      disabled={addingLink}
                      id="add-link-btn"
                    >
                      {addingLink ? <FiRefreshCw className="spin-icon" /> : <FiPlus />}
                      {addingLink ? 'Adding…' : 'Add Link'}
                    </button>
                  </div>
                </div>

                <div className="af-divider" />

                {/* Links list */}
                {links.length === 0 ? (
                  <div className="af-empty">
                    <FiLink2 size={32} />
                    <p>No links added yet. Use the form above to add footer navigation links.</p>
                  </div>
                ) : (
                  <div className="af-links-list">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className={`af-link-row ${editLink?.id === link.id ? 'af-link-row-editing' : ''}`}
                      >
                        {editLink?.id === link.id ? (
                          /* ── Edit mode ── */
                          <div className="af-link-edit">
                            <div className="af-link-edit-fields">
                              <input
                                className="form-input"
                                value={editLink.label}
                                onChange={(e) => setEditLink((p) => ({ ...p, label: e.target.value }))}
                                placeholder="Label"
                              />
                              <input
                                className="form-input"
                                value={editLink.url}
                                onChange={(e) => setEditLink((p) => ({ ...p, url: e.target.value }))}
                                placeholder="URL or /path"
                              />
                              <select
                                className="form-select"
                                value={editLink.column_group}
                                onChange={(e) => setEditLink((p) => ({ ...p, column_group: e.target.value }))}
                              >
                                {COLUMN_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div className="af-link-edit-actions">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={handleSaveLink}
                                disabled={linkSaving === link.id}
                                id={`save-link-${link.id}`}
                              >
                                {linkSaving === link.id ? <FiRefreshCw className="spin-icon" /> : <FiCheck />}
                                Save
                              </button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setEditLink(null)}>
                                <FiX /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── View mode ── */
                          <>
                            <div className="af-link-info">
                              <span className="af-link-group">{link.column_group || 'None'}</span>
                              <span className="af-link-label">{link.label}</span>
                              <code className="af-link-url">{link.url}</code>
                              <VisiBadge visible={link.is_visible} />
                            </div>
                            <div className="af-link-actions">
                              <button
                                className="af-icon-btn"
                                onClick={() => setEditLink({ ...link })}
                                title="Edit"
                                id={`edit-link-${link.id}`}
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                className={`af-icon-btn ${link.is_visible ? 'af-icon-btn-warn' : 'af-icon-btn-success'}`}
                                onClick={() => handleToggleLink(link.id)}
                                title={link.is_visible ? 'Hide' : 'Show'}
                                id={`toggle-link-${link.id}`}
                              >
                                {link.is_visible ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                              </button>
                              <button
                                className={`af-icon-btn ${confirmDeleteLinkId === link.id ? 'af-icon-btn-danger-confirm' : 'af-icon-btn-danger'}`}
                                onClick={() => handleDeleteLink(link.id)}
                                title={confirmDeleteLinkId === link.id ? 'Click again to confirm delete' : 'Delete'}
                                id={`delete-link-${link.id}`}
                              >
                                {confirmDeleteLinkId === link.id
                                  ? <span style={{ fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', padding: '0 2px' }}>Sure?</span>
                                  : <FiTrash2 size={14} />}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════ SOCIALS TAB ════════ */}
          {activeTab === 'socials' && (
            <div className="af-card">
              <div className="af-card-header">
                <h2><FiGlobe /> Social Media Profiles</h2>
                <span className="af-card-count">{socials.length} platform{socials.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="af-card-body">

                {/* Add new social */}
                <div className="af-add-form">
                  <h3 className="af-add-title">Add Social Profile</h3>
                  <div className="af-add-grid af-add-grid-social">
                    <div className="form-group">
                      <label className="form-label">Platform</label>
                      <select
                        className="form-select"
                        value={newSocial.platform}
                        onChange={(e) => setNewSocial((p) => ({ ...p, platform: e.target.value }))}
                        id="new-social-platform"
                      >
                        <option value="">Select platform…</option>
                        {PLATFORMS.map((p) => (
                          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Profile URL</label>
                      <input
                        className="form-input"
                        value={newSocial.url}
                        onChange={(e) => setNewSocial((p) => ({ ...p, url: e.target.value }))}
                        placeholder="https://twitter.com/yourhandle"
                        id="new-social-url"
                      />
                    </div>
                    <button
                      className="btn btn-primary af-add-btn"
                      onClick={handleAddSocial}
                      disabled={addingSocial}
                      id="add-social-btn"
                    >
                      {addingSocial ? <FiRefreshCw className="spin-icon" /> : <FiPlus />}
                      {addingSocial ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                </div>

                <div className="af-divider" />

                {/* Socials grid */}
                {socials.length === 0 ? (
                  <div className="af-empty">
                    <FiGlobe size={32} />
                    <p>No social profiles added yet.</p>
                  </div>
                ) : (
                  <div className="af-socials-grid">
                    {socials.map((social) => (
                      <div
                        key={social.id}
                        className="af-social-card"
                      >
                        {editSocial?.id === social.id ? (
                          /* ── Social edit mode ── */
                          <div className="af-social-edit">
                            <select
                              className="form-select"
                              value={editSocial.platform}
                              onChange={(e) => setEditSocial((p) => ({ ...p, platform: e.target.value }))}
                            >
                              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <input
                              className="form-input"
                              value={editSocial.url}
                              onChange={(e) => setEditSocial((p) => ({ ...p, url: e.target.value }))}
                              placeholder="Profile URL"
                            />
                            <div className="af-social-edit-actions">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={handleSaveSocial}
                                disabled={socialSaving === social.id}
                                id={`save-social-${social.id}`}
                              >
                                {socialSaving === social.id ? <FiRefreshCw className="spin-icon" /> : <FiCheck />}
                                Save
                              </button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setEditSocial(null)}>
                                <FiX /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ── Social view mode ── */
                          <>
                            <div className="af-social-card-top">
                              <div className="af-social-icon-wrap">
                                {getIcon(social.platform)}
                              </div>
                              <div className="af-social-info">
                                <span className="af-social-platform">{social.platform}</span>
                                <VisiBadge visible={social.is_visible} />
                              </div>
                              <div className="af-social-actions">
                                <button
                                  className="af-icon-btn"
                                  onClick={() => setEditSocial({ ...social })}
                                  title="Edit"
                                  id={`edit-social-${social.id}`}
                                >
                                  <FiEdit2 size={13} />
                                </button>
                                <button
                                  className={`af-icon-btn ${social.is_visible ? 'af-icon-btn-warn' : 'af-icon-btn-success'}`}
                                  onClick={() => handleToggleSocial(social.id)}
                                  title={social.is_visible ? 'Hide' : 'Show'}
                                  id={`toggle-social-${social.id}`}
                                >
                                  {social.is_visible ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                                </button>
                                <button
                                  className={`af-icon-btn ${confirmDeleteSocialId === social.id ? 'af-icon-btn-danger-confirm' : 'af-icon-btn-danger'}`}
                                  onClick={() => handleDeleteSocial(social.id)}
                                  title={confirmDeleteSocialId === social.id ? 'Click again to confirm' : 'Delete'}
                                  id={`delete-social-${social.id}`}
                                >
                                  {confirmDeleteSocialId === social.id
                                    ? <span style={{ fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', padding: '0 2px' }}>Sure?</span>
                                    : <FiTrash2 size={13} />}
                                </button>
                              </div>
                            </div>
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noreferrer"
                              className="af-social-url"
                              title={social.url}
                            >
                              {social.url}
                            </a>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminFooter;
