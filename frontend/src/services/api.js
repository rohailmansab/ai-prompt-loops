import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send HTTP-only cookies with every request
});

// ── Request interceptor — attach auth token ──────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — auto-refresh on TOKEN_EXPIRED ─
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiry with automatic refresh
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.token;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other 401 errors (invalid token, not expired)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

// ── Simple in-memory API cache ───────────────────────────
const cache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

const cachedGet = async (url, params, ttl = CACHE_TTL) => {
  const key = url + JSON.stringify(params || {});
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < ttl) {
    return cached.data;
  }
  const response = await api.get(url, { params });
  cache.set(key, { data: response, ts: Date.now() });
  return response;
};

export const clearCache = (prefix) => {
  if (!prefix) { cache.clear(); return; }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
};

// ── Auth ─────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  resetCredentials: (data) => api.put('/auth/admin/reset-credentials', data),
  getDashboard: () => api.get('/auth/dashboard'),
};

// ── Prompts ──────────────────────────────────────────────
export const promptsAPI = {
  getAll: (params) => cachedGet('/prompts', params),
  getBySlug: (slug) => cachedGet(`/prompts/${slug}`),
  create: (data) => { clearCache('/prompts'); return api.post('/prompts', data); },
  update: (id, data) => { clearCache('/prompts'); return api.put(`/prompts/${id}`, data); },
  delete: (id) => { clearCache('/prompts'); return api.delete(`/prompts/${id}`); },
  like: (id) => api.post(`/prompts/${id}/like`),
  adminGetAll: (params) => api.get('/prompts/admin/all', { params }),
};

// ── Categories ───────────────────────────────────────────
export const categoriesAPI = {
  getAll: () => cachedGet('/categories'),
  getBySlug: (slug) => cachedGet(`/categories/${slug}`),
  create: (data) => { clearCache('/categories'); return api.post('/categories', data); },
  update: (id, data) => { clearCache('/categories'); return api.put(`/categories/${id}`, data); },
  delete: (id) => { clearCache('/categories'); return api.delete(`/categories/${id}`); },
  adminGetAll: () => api.get('/categories/admin/all'),
};

// ── Blog ─────────────────────────────────────────────────
export const blogAPI = {
  getAll: (params) => cachedGet('/blog', params),
  getBySlug: (slug) => cachedGet(`/blog/${slug}`),
  create: (data) => { clearCache('/blog'); return api.post('/blog', data); },
  update: (id, data) => { clearCache('/blog'); return api.put(`/blog/${id}`, data); },
  delete: (id) => { clearCache('/blog'); return api.delete(`/blog/${id}`); },
  adminGetAll: (params) => api.get('/blog/admin/all', { params }),
};

// ── Analytics ────────────────────────────────────────────
export const analyticsAPI = {
  track: (data) => api.post('/analytics/track', data),
  getDashboard: () => api.get('/analytics/dashboard'),
};

// ── Contact ──────────────────────────────────────────────
export const contactAPI = {
  send: (data) => api.post('/contact', data),
  // Admin
  adminGetAll: (params) => api.get('/contact/admin', { params }),
  adminUnreadCount: () => api.get('/contact/admin/unread-count'),
  toggleRead: (id) => api.patch(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`),
};

// ── Ads ──────────────────────────────────────────────────
export const adsAPI = {
  // Public: fetch active ad by placement (used by AdBlock component)
  getByPlacement: (placement) => api.get(`/ads/placement/${placement}`),
  // Public: fetch all active ads (optional ?placement= filter)
  getAll: (params) => api.get('/ads', { params }),
  // Public: track an impression or click event
  trackEvent: (data) => api.post('/ads/event', data),
  // Admin: all ads including inactive
  adminGetAll: () => api.get('/ads/admin/all'),
  // Admin: simple impression/click stats pivot
  adminStats: () => api.get('/ads/admin/stats'),
  // Admin: full analytics (per-ad, top placements, 7-day trend)
  adminAnalytics: () => api.get('/ads/admin/analytics'),
  // Admin: CRUD
  create: (data) => api.post('/ads', data),
  update: (id, data) => api.put(`/ads/${id}`, data),
  delete: (id) => api.delete(`/ads/${id}`),
  toggle: (id) => api.patch(`/ads/${id}/toggle`),
};

// ── SEO / IndexNow ───────────────────────────────────────
export const seoAPI = {
  getDashboard: () => api.get('/seo/dashboard'),
  getLowScorePages: () => api.get('/seo/low-score'),
  getAuditReport: () => api.get('/seo/audit'),
  triggerIndexNow: (urls) => api.post('/seo/indexnow', { urls }),
  getIndexNowLog: () => api.get('/seo/indexnow-log'),
};

// ── Site Settings ─────────────────────────────────────────
export const settingsAPI = {
  getPublic: () => cachedGet('/settings/public', null, 60 * 1000), // 1-min cache
  getAdmin: () => api.get('/settings/admin'),
  update: (data) => { clearCache('/settings/public'); return api.put('/settings', data); },
};

// ── Footer CMS ────────────────────────────────────────────
export const footerAPI = {
  // Public: get the full footer config (settings + links + socials)
  getFooter: () => cachedGet('/footer', null, 30 * 1000), // 30s cache — short so CMS changes appear quickly
  // Admin: get full footer data (includes hidden items)
  adminGetFooter: () => api.get('/footer/admin'),
  // Admin: update settings (site_name, footer_text, copyright, show_social, show_footer)
  updateSettings: (data) => { clearCache('/footer'); return api.put('/footer/settings', data); },
  // Admin: links
  createLink: (data) => { clearCache('/footer'); return api.post('/footer/link', data); },
  updateLink: (id, data) => { clearCache('/footer'); return api.put(`/footer/link/${id}`, data); },
  deleteLink: (id) => { clearCache('/footer'); return api.delete(`/footer/link/${id}`); },
  toggleLink: (id) => { clearCache('/footer'); return api.patch(`/footer/link/${id}/toggle`); },
  // Admin: socials
  createSocial: (data) => { clearCache('/footer'); return api.post('/footer/social', data); },
  updateSocial: (id, data) => { clearCache('/footer'); return api.put(`/footer/social/${id}`, data); },
  deleteSocial: (id) => { clearCache('/footer'); return api.delete(`/footer/social/${id}`); },
  toggleSocial: (id) => { clearCache('/footer'); return api.patch(`/footer/social/${id}/toggle`); },
};

// ── CMS Pages ─────────────────────────────────────────────
export const pagesAPI = {
  // Public: get published page by slug (short cache so edits reflect quickly)
  getBySlug: (slug) => cachedGet(`/pages/${slug}`, null, 30 * 1000),
  // Admin: all pages
  adminGetAll: () => api.get('/pages/admin/all'),
  // Admin: single page by id
  adminGet: (id) => api.get(`/pages/admin/${id}`),
  // Admin: update page
  update: (id, data) => { clearCache('/pages/'); return api.put(`/pages/${id}`, data); },
  // Admin: toggle publish/unpublish
  toggle: (id) => { clearCache('/pages/'); return api.patch(`/pages/${id}/toggle`); },
};

export default api;
