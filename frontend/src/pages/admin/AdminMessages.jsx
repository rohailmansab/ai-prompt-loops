import { useState, useEffect, useCallback } from 'react';
import { FiMail, FiTrash2, FiEye, FiEyeOff, FiX, FiRefreshCw, FiInbox } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { contactAPI } from '../../services/api';
import './AdminDashboard.css';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [meta, setMeta] = useState({ total: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // Full message in modal
  const [deleting, setDeleting] = useState(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await contactAPI.adminGetAll();
      setMessages(data.data);
      setMeta(data.meta);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleToggleRead = async (msg) => {
    try {
      const { data } = await contactAPI.toggleRead(msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: data.is_read } : m))
      );
      setMeta((prev) => ({
        ...prev,
        unread: data.is_read ? prev.unread - 1 : prev.unread + 1,
      }));
      if (selected?.id === msg.id) setSelected({ ...selected, is_read: data.is_read });
    } catch (err) {
      console.error('Failed to toggle read status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    setDeleting(id);
    try {
      await contactAPI.delete(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setMeta((prev) => ({ ...prev, total: prev.total - 1 }));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
    } finally {
      setDeleting(null);
    }
  };

  const openMessage = async (msg) => {
    setSelected(msg);
    // Auto-mark as read when opened
    if (!msg.is_read) {
      await handleToggleRead(msg);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiInbox />
            Messages
            {meta.unread > 0 && (
              <span style={{
                background: 'var(--color-error)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: '999px',
                lineHeight: '1.6',
              }}>
                {meta.unread} unread
              </span>
            )}
          </h1>
          <p>{meta.total} total message{meta.total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchMessages} disabled={loading} id="refresh-messages">
          <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Messages Table */}
      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
          <FiInbox style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="dashboard-section">
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '12px' }}></th>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    style={{
                      cursor: 'pointer',
                      background: !msg.is_read ? 'rgba(99,102,241,0.06)' : 'transparent',
                    }}
                  >
                    <td>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: msg.is_read ? 'transparent' : 'var(--color-primary)',
                        border: msg.is_read ? '1px solid var(--color-border)' : 'none',
                      }} />
                    </td>
                    <td>
                      <div style={{ fontWeight: msg.is_read ? 400 : 700, color: 'var(--color-text-primary)' }}>{msg.name}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{msg.email}</div>
                    </td>
                    <td style={{ color: 'var(--color-text-primary)', fontWeight: msg.is_read ? 400 : 600, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.subject}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-xs)' }}>
                      {formatDate(msg.created_at)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggleRead(msg)}
                          title={msg.is_read ? 'Mark unread' : 'Mark read'}
                          style={{ padding: '6px' }}
                        >
                          {msg.is_read ? <FiEyeOff /> : <FiEye />}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDelete(msg.id)}
                          disabled={deleting === msg.id}
                          title="Delete"
                          style={{ padding: '6px', color: 'var(--color-error)' }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 'var(--space-6)',
            }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-8)',
                maxWidth: '640px',
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '4px' }}>{selected.subject}</h2>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    {formatDate(selected.created_at)}
                  </p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)} style={{ padding: '6px' }}>
                  <FiX />
                </button>
              </div>

              {/* Sender info */}
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{selected.name}</div>
                  <a href={`mailto:${selected.email}`} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-light)' }}>
                    {selected.email}
                  </a>
                </div>
              </div>

              {/* Message body */}
              <div style={{ lineHeight: 1.8, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', marginBottom: 'var(--space-6)' }}>
                {selected.message}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-5)' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleToggleRead(selected)}>
                  {selected.is_read ? <><FiEyeOff /> Mark Unread</> : <><FiEye /> Mark Read</>}
                </button>
                <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`} className="btn btn-primary btn-sm">
                  <FiMail /> Reply
                </a>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(selected.id)} style={{ color: 'var(--color-error)' }}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMessages;
