import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { AnalyticsTracker } from './components/AnalyticsTracker';

// Layout — loaded eagerly (always visible)
import Header from './components/Header';
import Footer from './components/Footer';

// Ad managers
import PopunderManager from './components/PopunderManager';
import SocialBar from './components/SocialBar';


// ── Lazy loaded pages (code-split into separate chunks) ──

// Public
const Home = lazy(() => import('./pages/Home'));
const Prompts = lazy(() => import('./pages/Prompts'));
const PromptDetail = lazy(() => import('./pages/PromptDetail'));
const Categories = lazy(() => import('./pages/Categories'));
const Tools = lazy(() => import('./pages/Tools'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const CmsPage = lazy(() => import('./pages/CmsPage'));

// Admin
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPrompts = lazy(() => import('./pages/admin/AdminPrompts'));
const AdminPromptForm = lazy(() => import('./pages/admin/AdminPromptForm'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminBlogForm = lazy(() => import('./pages/admin/AdminBlogForm'));
const AdminAds = lazy(() => import('./pages/admin/AdminAds'));
const AdminAdsForm = lazy(() => import('./pages/admin/AdminAdsForm'));
const AdminSeoDashboard = lazy(() => import('./pages/admin/AdminSeoDashboard'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminPages = lazy(() => import('./pages/admin/AdminPages'));
const AdminPageForm = lazy(() => import('./pages/admin/AdminPageForm'));
const AdminFooter = lazy(() => import('./pages/admin/AdminFooter'));

// ── Minimal suspense fallback (no heavy spinner, just shimmer bar) ──
const PageFallback = () => (
  <div style={{ paddingTop: 'var(--header-height)' }}>
    <div className="page-loading-bar" />
  </div>
);

// Scroll to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// ── Animated page wrapper ──
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const AnimatedPage = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

// Public layout wrapper
const PublicLayout = ({ children }) => (
  <>
    <Header />
    <main style={{ flex: 1 }}>
      <AnimatedPage>{children}</AnimatedPage>
    </main>
    <Footer />
  </>
);

// ── Animated routes ──
const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageFallback />} key={location.pathname}>
        <Routes location={location}>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/prompts" element={<PublicLayout><Prompts /></PublicLayout>} />
          <Route path="/prompts/:slug" element={<PublicLayout><PromptDetail /></PublicLayout>} />
          <Route path="/categories" element={<PublicLayout><Categories /></PublicLayout>} />
          <Route path="/tools" element={<PublicLayout><Tools /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><CmsPage slug="about" /></PublicLayout>} />
          <Route path="/company" element={<PublicLayout><CmsPage slug="company" /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/privacy-policy" element={<PublicLayout><CmsPage slug="privacy-policy" /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><CmsPage slug="terms" /></PublicLayout>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="seo-dashboard" element={<AdminSeoDashboard />} />
            <Route path="prompts" element={<AdminPrompts />} />
            <Route path="prompts/new" element={<AdminPromptForm />} />
            <Route path="prompts/:id" element={<AdminPromptForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="blog/new" element={<AdminBlogForm />} />
            <Route path="blog/:id" element={<AdminBlogForm />} />
            <Route path="ads" element={<AdminAds />} />
            <Route path="ads/new" element={<AdminAdsForm />} />
            <Route path="ads/:id" element={<AdminAdsForm />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="pages/:id" element={<AdminPageForm />} />
            <Route path="footer" element={<AdminFooter />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <PublicLayout>
              <div style={{ paddingTop: 'var(--header-height)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div>
                  <h1 style={{ fontSize: 'var(--font-size-6xl)', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-6)' }}>Page not found</p>
                  <a href="/" className="btn btn-primary">Go Home</a>
                </div>
              </div>
            </PublicLayout>
          } />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AnalyticsTracker />

          {/* Background gradient orbs */}
          <div className="bg-gradient-orb bg-gradient-orb-1"></div>
          <div className="bg-gradient-orb bg-gradient-orb-2"></div>

          {/* Global Monetization Hooks */}
          <PopunderManager />
          <SocialBar />

          <AppRoutes />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
