import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiFileText, FiGrid, FiBookOpen, FiSettings, FiLogOut, FiZap, FiMenu, FiX, FiRadio, FiMail, FiLayout } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { contactAPI } from '../../services/api';
import './AdminLayout.css';

const POLL_INTERVAL = 60 * 1000; // 60 seconds

const AdminLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [sidebarOpen]);

  // Poll unread message count for navbar badge
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnread = async () => {
      try {
        const { data } = await contactAPI.adminUnreadCount();
        setUnreadCount(data.unread || 0);
      } catch {
        // Silently ignore — badge is non-critical
      }
    };

    fetchUnread();
    pollRef.current = setInterval(fetchUnread, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [isAuthenticated]);

  // Re-fetch when navigating to/from messages (to update badge immediately)
  useEffect(() => {
    if (!isAuthenticated) return;
    contactAPI.adminUnreadCount()
      .then(({ data }) => setUnreadCount(data.unread || 0))
      .catch(() => {});
  }, [location.pathname, isAuthenticated]);

  if (!isAuthenticated) return null;

  const navItems = [
    { path: '/admin', icon: <FiHome />, label: 'Dashboard', exact: true },
    { path: '/admin/seo-dashboard', icon: <FiZap />, label: 'SEO Engine' },
    { path: '/admin/prompts', icon: <FiFileText />, label: 'Prompts' },
    { path: '/admin/categories', icon: <FiGrid />, label: 'Categories' },
    { path: '/admin/blog', icon: <FiBookOpen />, label: 'Blog Posts' },
    { path: '/admin/ads', icon: <FiRadio />, label: 'Ads' },
    { path: '/admin/pages', icon: <FiFileText />, label: 'CMS Pages' },
    { path: '/admin/footer', icon: <FiLayout />, label: 'Footer CMS' },
    {
      path: '/admin/messages',
      icon: <FiMail />,
      label: 'Messages',
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { path: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-logo">
            <div className="logo-icon"><FiZap /></div>
            <span>Admin Panel</span>
          </Link>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <FiX />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ path, icon, label, exact, badge }) => (
            <Link
              key={path}
              to={path}
              className={`admin-nav-link ${isActive(path, exact) ? 'active' : ''}`}
            >
              {icon}
              <span style={{ flex: 1 }}>{label}</span>
              {badge != null && (
                <span className="admin-nav-badge">{badge > 99 ? '99+' : badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{user?.username}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button className="admin-nav-link logout-btn" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <FiMenu />
          </button>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
            ← Back to Site
          </Link>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default AdminLayout;
