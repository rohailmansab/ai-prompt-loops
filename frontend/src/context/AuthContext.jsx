import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// Token expiry check (15-minute access tokens)
const TOKEN_REFRESH_INTERVAL = 12 * 60 * 1000; // Refresh 3 minutes before expiry
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 min inactivity = auto logout

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const refreshTimer = useRef(null);
  const inactivityTimer = useRef(null);

  // ── Refresh Token Flow ───────────────────────────────
  const refreshAccessToken = useCallback(async () => {
    try {
      const { data } = await authAPI.refresh();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch {
      // Refresh failed — session expired
      logout();
      return false;
    }
  }, []);

  // ── Schedule Periodic Token Refresh ──────────────────
  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(() => {
      refreshAccessToken();
    }, TOKEN_REFRESH_INTERVAL);
  }, [refreshAccessToken]);

  // ── Inactivity-Based Auto Logout ─────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (!user) return;

    inactivityTimer.current = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set up activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();
    scheduleRefresh();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [user, resetInactivityTimer, scheduleRefresh]);

  // ── Login ────────────────────────────────────────────
  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // Silent fail — still clear local state
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated, isAdmin, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
