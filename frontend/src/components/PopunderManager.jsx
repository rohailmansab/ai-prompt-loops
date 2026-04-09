import { useEffect, useRef, useState } from 'react';
import { adsAPI } from '../services/api';

const SCRIPT_REGISTRY = new Set();
const injectScripts = (htmlString) => {
  if (!htmlString) return;
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
          // Allow multiple instances per mount or session? 
          // For popunders, usually we only want it once.
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
  } catch (err) {
    console.warn('[PopunderManager] Script injection failed:', err.message);
  }
};

const PopunderManager = () => {
  const [ad, setAd] = useState(null);
  const initialized = useRef(false);

  useEffect(() => {
    // 1. Check if already shown in this session
    const isShown = sessionStorage.getItem('popunder_shown');
    if (isShown === 'true') return;

    // 2. Fetch popunder ad
    adsAPI.getByPlacement('popunder_global')
      .then(({ data }) => {
        const popAd = data.data;
        if (popAd && popAd.ad_code) {
          setAd(popAd);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!ad || initialized.current) return;
    initialized.current = true;

    // 3. Inject the Adsterra script into the document head
    injectScripts(ad.ad_code);

    // Track impression when injected
    adsAPI.trackEvent({ ad_id: ad.id, placement: 'popunder_global', event_type: 'impression' }).catch(() => {});

    // 4. Listen for the FIRST global user click to enforce session rules and tracking
    const handleFirstClick = () => {
      sessionStorage.setItem('popunder_shown', 'true');
      
      // Track the popunder interaction
      adsAPI.trackEvent({ ad_id: ad.id, placement: 'popunder_global', event_type: 'click' }).catch(() => {});
      
      // We don't need to listen to clicks anymore this session
      document.removeEventListener('click', handleFirstClick, true);
    };

    // Use capture phase `true` to ensure we intercept it even if other elements stop propagation
    document.addEventListener('click', handleFirstClick, true);

    return () => {
      document.removeEventListener('click', handleFirstClick, true);
    };
  }, [ad]);

  // Renders nothing visible
  return null;
};

export default PopunderManager;
