import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiZap, FiChevronDown } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Lock body scroll when mobile menu is open without jumping scroll position.
  // Using position:fixed + saved scrollY instead of overflow:hidden which causes
  // iOS/Android browsers to reset scroll to top.
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.dataset.menuScrollY = String(scrollY);
    } else {
      const scrollY = parseInt(document.body.dataset.menuScrollY || '0', 10);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      delete document.body.dataset.menuScrollY;
      window.scrollTo(0, scrollY);
    }
    return () => {
      const scrollY = parseInt(document.body.dataset.menuScrollY || '0', 10);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      delete document.body.dataset.menuScrollY;
      if (scrollY) window.scrollTo(0, scrollY);
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/prompts', label: 'Prompts' },
    { path: '/categories', label: 'Categories' },
    { path: '/tools', label: 'Tools' },
    { path: '/blog', label: 'Blog' },
    { path: '/about', label: 'About' },
  ];

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container container">
        <Link to="/" className="header-logo" id="header-logo">
          <div className="logo-icon">
            <FiZap />
          </div>
          <span className="logo-text">
            AI<span className="logo-accent">Prompt</span>Loops
          </span>
        </Link>

        <nav className={`header-nav ${isMobileMenuOpen ? 'nav-open' : ''}`} id="main-nav">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${location.pathname === path ? 'nav-link-active' : ''}`}
              id={`nav-${label.toLowerCase()}`}
            >
              {label}
            </Link>
          ))}
          <Link to="/contact" className="btn btn-primary btn-sm nav-cta" id="nav-contact-btn">
            Contact
          </Link>
        </nav>

        <button
          className="mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
};

export default Header;
