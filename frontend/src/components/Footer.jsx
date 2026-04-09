import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiZap, FiHeart, FiArrowRight, FiChevronRight,
  FiTwitter, FiGithub, FiLinkedin, FiMail, FiYoutube,
  FiFacebook, FiInstagram, FiGlobe,
} from 'react-icons/fi';
import { footerAPI, clearCache } from '../services/api';
import './Footer.css';

// ── Platform → icon mapping ───────────────────────────────
const SOCIAL_ICONS = {
  twitter:   <FiTwitter />,
  x:         <FiTwitter />,
  github:    <FiGithub />,
  linkedin:  <FiLinkedin />,
  email:     <FiMail />,
  mail:      <FiMail />,
  youtube:   <FiYoutube />,
  facebook:  <FiFacebook />,
  instagram: <FiInstagram />,
};

const getSocialIcon = (platform) =>
  SOCIAL_ICONS[platform?.toLowerCase()] ?? <FiGlobe />;

// ── Footer component ──────────────────────────────────────
const Footer = () => {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const fetchFooter = () => {
    footerAPI.getFooter()
      .then(({ data: res }) => {
        const payload = res?.data ?? null;
        setData(payload);
      })
      .catch(() => setData(null))
      .finally(() => setLoaded(true));
  };

  useEffect(() => {
    fetchFooter();

    // Re-fetch when user switches back to this tab from Admin
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        clearCache('/footer');
        fetchFooter();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loaded && data && data.show_footer === 0) return null;

  const currentYear = new Date().getFullYear();

  const siteName   = data?.site_name    ?? 'AI Prompt Loops';
  const footerTxt  = data?.footer_text  ?? 'The ultimate AI prompt engineering resource. Discover, create, and master prompts for ChatGPT, Midjourney, Claude, and more.';
  const copyright  = data?.copyright_text ?? `© ${currentYear} AI Prompt Loops. All rights reserved.`;
  const showSocial = data ? !!data.show_social : true;

  const dbLinks  = data?.links ?? [];
  const socials  = data?.socials ?? [];

  // Helper mappings to elegantly split massive unorganized CMS lists
  const overrideGrouping = {
    'Prompt Library': 'Explore',
    'Categories': 'Explore',
    'AI Tools': 'Explore',
    'Blog': 'Explore',
    'About Us': 'Company',
    'Contact': 'Company',
    'Privacy Policy': 'Company',
    'Terms of Service': 'Company'
  };

  const dynamicGroups = dbLinks.reduce((acc, link) => {
    // If backend dumped into "Links", split it automatically based on mapping
    const groupName = link.column_group === 'Links' && overrideGrouping[link.label] 
      ? overrideGrouping[link.label] 
      : link.column_group || 'Explore';
      
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(link);
    return acc;
  }, {});

  // Fallback defaults
  const footerLinks = {
    Explore: [
      { label: 'Prompt Library', path: '/prompts' },
      { label: 'Categories', path: '/categories' },
      { label: 'AI Tools', path: '/tools' },
      { label: 'Blog', path: '/blog' },
    ],
    Company: [
      { label: 'About Us', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Privacy Policy', path: '/privacy-policy' },
      { label: 'Terms of Service', path: '/terms' },
    ]
  };

  const activeGroups = dbLinks.length > 0 ? dynamicGroups : footerLinks;

  const isExternal = (url) => /^https?:\/\//.test(url ?? '');

  const renderLink = (link, key) =>
    isExternal(link.url ?? link.path) ? (
      <a key={key} href={link.url ?? link.path} className="footer-link" target="_blank" rel="noopener noreferrer">
        {link.label}
        <FiChevronRight className="footer-link-arrow" />
      </a>
    ) : (
      <Link key={key} to={link.url ?? link.path} className="footer-link">
        {link.label}
        <FiChevronRight className="footer-link-arrow" />
      </Link>
    );

  const defaultSocials = ['github', 'twitter', 'linkedin', 'email'];

  return (
    <footer className="footer" id="footer">
      {/* Top glow line */}
      <div className="footer-glow-line" />

      <div className="container">

        {/* ── Newsletter / CTA Banner ── */}
        <div className="footer-cta-banner">
          <div className="footer-cta-content">
            <div className="footer-cta-icon">
              <FiZap />
            </div>
            <div>
              <h3 className="footer-cta-title">Master AI Prompting</h3>
              <p className="footer-cta-subtitle">
                Explore 350+ handcrafted prompts for ChatGPT, Midjourney, Claude &amp; more.
              </p>
            </div>
          </div>
          <Link to="/prompts" className="footer-cta-btn">
            Browse Prompts <FiArrowRight />
          </Link>
        </div>

        {/* ── Main Grid ── */}
        <div className="footer-grid">

          {/* Left: Brand Column */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo" id="footer-logo">
              <div className="logo-icon">
                <FiZap />
              </div>
              <span>{siteName}</span>
            </Link>
            <p className="footer-desc">{footerTxt}</p>
            <div className="footer-brand-badges">
              <span className="brand-badge"><span className="badge-dot"></span> AI Powered</span>
            </div>
          </div>

          {/* Middle: Link Columns */}
          {Object.entries(activeGroups).map(([title, links]) => (
            <div key={title} className="footer-column">
              <h4 className="footer-column-title">{title}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link.label || link.id}>
                    {renderLink(link, link.label || link.id)}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Right: Social & Contact */}
          <div className="footer-column footer-contact">
            <h4 className="footer-column-title">CONNECT</h4>

            {showSocial && (
              <div className="footer-socials">
                {socials.length > 0
                  ? socials.map((s) => (
                      <a
                        key={s.id}
                        href={s.url}
                        className="social-link"
                        aria-label={s.platform}
                        target={isExternal(s.url) ? '_blank' : undefined}
                        rel={isExternal(s.url) ? 'noopener noreferrer' : undefined}
                      >
                        {getSocialIcon(s.platform)}
                      </a>
                    ))
                  : defaultSocials.map((p) => (
                      <a key={p} href="#" className="social-link" aria-label={p}>
                        {getSocialIcon(p)}
                      </a>
                    ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="footer-bottom">
          <p className="footer-copyright">{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
