import { useState, useEffect, useRef } from 'react';
import { adsAPI } from '../services/api';
import './SocialBar.css';

// Script injection logic reused from AdBlock
const SCRIPT_REGISTRY = new Set();
const injectScripts = (htmlString, containerEl) => {
  if (!htmlString) return { html: '' };
  try {
    const scriptTagRe = /<script[\s\S]*?(?:<\/script>|(?<=\/)>)/gi;
    const srcRe = /src\s*=\s*["']([^"']+)["']/i;
    const inlineContentRe = /<script[^>]*>([\s\S]*?)<\/script>/i;

    const matches = htmlString.match(scriptTagRe) || [];

    matches.forEach((scriptTag) => {
      const srcMatch = scriptTag.match(srcRe);
      if (srcMatch) {
        const src = srcMatch[1];
        if (!SCRIPT_REGISTRY.has(src)) {
          SCRIPT_REGISTRY.add(src);
          const el = document.createElement('script');
          el.src = src;
          el.async = true;
          document.head.appendChild(el);
        }
      } else {
        const inlineMatch = scriptTag.match(inlineContentRe);
        if (inlineMatch && inlineMatch[1].trim()) {
          const content = inlineMatch[1].trim();
          const key = `inline:${content.substring(0, 80)}`;
          if (!SCRIPT_REGISTRY.has(key)) {
            SCRIPT_REGISTRY.add(key);
            const el = document.createElement('script');
            el.textContent = content;
            document.head.appendChild(el);
          }
        }
      }
    });

    return { html: htmlString.replace(scriptTagRe, '').trim() };
  } catch (err) {
    console.warn('[SocialBar] Script injection failed:', err.message);
    return { html: '' };
  }
};

const SocialBar = () => {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(false);
  const [safeHtml, setSafeHtml] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    // 1. Check if closed within the last 24 hours
    const closedAt = localStorage.getItem('social_bar_closed_at');
    if (closedAt) {
      const hoursSinceClosed = (Date.now() - parseInt(closedAt, 10)) / (1000 * 60 * 60);
      if (hoursSinceClosed < 24) return;
    }

    // 2. Fetch social bar ad
    adsAPI.getByPlacement('social_bar_global')
      .then(({ data }) => {
        const sbAd = data.data;
        if (sbAd && sbAd.ad_code) {
          setAd(sbAd);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!ad || initialized.current) return;
    initialized.current = true;

    const { html } = injectScripts(ad.ad_code);
    setSafeHtml(html);
    setVisible(true);

    // Track impression
    adsAPI.trackEvent({ ad_id: ad.id, placement: 'social_bar_global', event_type: 'impression' }).catch(() => {});
  }, [ad]);

  const handleClose = () => {
    // Hide bar immediately
    setVisible(false);
    
    // Auto-hide for next 24 hours
    localStorage.setItem('social_bar_closed_at', Date.now().toString());

    // Track close event
    adsAPI.trackEvent({ ad_id: ad.id, placement: 'social_bar_global', event_type: 'close' }).catch(() => {});
  };

  if (!visible || !ad) return null;

  return (
    <div className="social-bar-overlay">
      <div className="social-bar-inner">
        <button 
          className="social-bar-close-btn" 
          onClick={handleClose}
          aria-label="Close sponsor message"
        >
          &times;
        </button>
        {/* Adsterra/Network script creates its own elements or relies on this container */}
        <div 
          className="social-bar-content" 
          dangerouslySetInnerHTML={{ __html: safeHtml }} 
        />
      </div>
    </div>
  );
};

export default SocialBar;
