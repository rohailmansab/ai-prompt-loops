/**
 * AdBlock — Dynamic, placement-driven ad component (v3 — Final Refinements)
 *
 * Sections addressed:
 *  §1  Real click tracking   — pointer-enter intent + iframe focus method
 *  §3  Hybrid frequency cap  — sessionStorage (3/session) + localStorage (10/day)
 *  §4  Advanced adblock detection — bait div + script load probe + 2.5s timeout
 *  §6  Duplicate impression guard — impressionFiredRef (one per mount)
 *  §7  Script injection failsafe  — try/catch, error triggers fallback
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { adsAPI } from '../services/api';
import './AdBlock.css';

/* ─────────────────────────────────────────────────────────────
   SECTION 3 — Hybrid Frequency Control
   sessionStorage: max 3 per session
   localStorage:   max 10 per day (resets each calendar day)
───────────────────────────────────────────────────────────── */
const SESSION_MAX = 3;
const DAILY_MAX = 10;

/** Returns today's YYYY-MM-DD date string (local) */
const todayKey = () => new Date().toISOString().slice(0, 10);

const getSessionViews = (placement) =>
  parseInt(sessionStorage.getItem(`ad_${placement}_session_views`) || '0', 10);

const getDailyViews = (placement) => {
  try {
    const raw = localStorage.getItem(`ad_${placement}_total_views`);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    return date === todayKey() ? count : 0; // resets if different day
  } catch { return 0; }
};

const incrementViews = (placement) => {
  // session
  sessionStorage.setItem(`ad_${placement}_session_views`, getSessionViews(placement) + 1);
  // daily
  const today = todayKey();
  const daily = getDailyViews(placement);
  localStorage.setItem(`ad_${placement}_total_views`, JSON.stringify({ date: today, count: daily + 1 }));
};

const isFrequencyCapped = (placement) =>
  getSessionViews(placement) >= SESSION_MAX || getDailyViews(placement) >= DAILY_MAX;

/* ─────────────────────────────────────────────────────────────
   Script injection (§7 — failsafe try/catch)
───────────────────────────────────────────────────────────── */
const SCRIPT_REGISTRY = new Set();

const injectScripts = (htmlString) => {
  if (!htmlString) return { html: '', error: false };

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
          el.defer = true;
          const dataAttrs = scriptTag.match(/data-[a-z-]+=["'][^"']*["']/gi) || [];
          dataAttrs.forEach((attr) => {
            const eqIdx = attr.indexOf('=');
            el.setAttribute(attr.slice(0, eqIdx), attr.slice(eqIdx + 1).replace(/["']/g, ''));
          });
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

    return { html: htmlString.replace(scriptTagRe, '').trim(), error: false };
  } catch (err) {
    console.warn('[AdBlock] Script injection failed:', err.message);
    return { html: '', error: true }; // §7: triggers fallback
  }
};

/* ─────────────────────────────────────────────────────────────
   Fire-and-forget event tracker
───────────────────────────────────────────────────────────── */
const trackEvent = (adId, placement, eventType) => {
  adsAPI.trackEvent({ ad_id: adId, placement, event_type: eventType }).catch(() => {});
};

/* ─────────────────────────────────────────────────────────────
   SECTION 4 — Advanced Adblock Detection
   Three-layer approach:
     Layer 1: Bait DIV visibility check
     Layer 2: Ad script probe (load an 1x1 pixel from known ad domain)
     Layer 3: 2.5s timeout — if probe hasn't returned, assume blocked
───────────────────────────────────────────────────────────── */
let adblockStatus = null; // null | 'clean' | 'blocked'
const adblockQueue = [];

const resolveAdblock = (blocked) => {
  adblockStatus = blocked ? 'blocked' : 'clean';
  adblockQueue.forEach((cb) => cb(blocked));
  adblockQueue.length = 0;
};

const runAdblockDetection = () => {
  if (adblockStatus !== null) {
    adblockQueue.forEach((cb) => cb(adblockStatus === 'blocked'));
    adblockQueue.length = 0;
    return;
  }

  // Layer 1: Bait element
  const bait = document.createElement('div');
  bait.className = 'ad-placement ad-unit adsbox ads ad-banner';
  bait.style.cssText =
    'width:1px;height:1px;position:absolute;left:-9999px;top:-9999px;' +
    'opacity:0;pointer-events:none;';
  document.body.appendChild(bait);

  // Small delay to let adblocker apply DOM changes
  const baitTimeout = setTimeout(() => {
    const cs = window.getComputedStyle(bait);
    const baitBlocked =
      !bait.offsetParent ||
      bait.offsetHeight === 0 ||
      bait.offsetWidth === 0 ||
      cs.display === 'none' ||
      cs.visibility === 'hidden';

    if (bait.parentNode) document.body.removeChild(bait);

    if (baitBlocked) {
      resolveAdblock(true);
      return;
    }

    // Layer 2: Script probe — try to load a 1×1 bait image from an ad CDN path
    // If blocked, onerror fires quickly; if not blocked, onload fires
    const probe = new Image();
    const probeUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000';

    // Layer 3: Timeout if no response in 2500ms → assume blocked
    const fallbackTimer = setTimeout(() => {
      probe.onload = probe.onerror = null;
      // bait was fine but probe timed out — be conservative, mark as blocked
      resolveAdblock(true);
    }, 2500);

    probe.onload = () => {
      clearTimeout(fallbackTimer);
      resolveAdblock(false); // both checks pass → no adblock
    };
    probe.onerror = () => {
      clearTimeout(fallbackTimer);
      resolveAdblock(true); // probe blocked → adblock active
    };

    // Use fetch-based probe (more reliable than img for scripts)
    fetch(probeUrl, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' })
      .then(() => {
        clearTimeout(fallbackTimer);
        probe.onload = probe.onerror = null;
        resolveAdblock(false);
      })
      .catch(() => {
        clearTimeout(fallbackTimer);
        probe.onload = probe.onerror = null;
        resolveAdblock(true);
      });
  }, 150);

  return () => clearTimeout(baitTimeout);
};

const checkAdblock = (cb) => {
  adblockQueue.push(cb);
  runAdblockDetection();
};

/* ─────────────────────────────────────────────────────────────
   SECTION 1 — Real Click Tracking helper
   Exported so PromptContentLock can call it on the ad container ref
───────────────────────────────────────────────────────────── */
export { trackEvent };

/* ─────────────────────────────────────────────────────────────
   AdBlock Component
───────────────────────────────────────────────────────────── */
const AdBlock = ({
  placement,
  className = '',
  minHeight = 90,
  showFallback = true,
  fallbackText = 'Support us by enabling ads 🙌',
  onAdVisible,      // callback(true/false) for parent unlock logic
  adRef: externalRef, // allow parent to pass a ref for scroll control
}) => {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [capped, setCapped] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const containerRef = useRef(null);
  const mountedRef = useRef(true);
  const impressionFiredRef = useRef(false); // §6 — single impression guard

  /* §1 — Click intent tracking (pointer method) */
  const mouseEnteredRef = useRef(false);
  const clickTrackedRef = useRef(false);

  /* ── IntersectionObserver: lazy load + ad visibility callback ── */
  useEffect(() => {
    mountedRef.current = true;
    const el = containerRef.current;
    if (!el) return;

    // Observer 1: trigger fetch 200px before viewport
    const fetchObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          fetchObserver.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    fetchObserver.observe(el);

    // Observer 2: notify parent when ad is ≥50% visible (for unlock gate §2)
    let visibilityObserver;
    if (typeof onAdVisible === 'function') {
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          if (mountedRef.current) {
            onAdVisible(entry.intersectionRatio >= 0.5);
          }
        },
        { threshold: [0, 0.5, 1.0] }
      );
      visibilityObserver.observe(el);
    }

    return () => {
      fetchObserver.disconnect();
      visibilityObserver?.disconnect();
      mountedRef.current = false;
    };
  }, [onAdVisible]);

  /* ── Frequency check + adblock detection + fetch ── */
  useEffect(() => {
    if (!visible || !placement) return;

    if (isFrequencyCapped(placement)) {
      setCapped(true);
      setLoaded(true);
      return;
    }

    checkAdblock((isBlocked) => {
      if (!mountedRef.current) return;
      if (isBlocked) {
        setBlocked(true);
        setLoaded(true);
        return;
      }

      let cancelled = false;
      (async () => {
        try {
          const { data } = await adsAPI.getByPlacement(placement);
          if (!cancelled && mountedRef.current) {
            setAd(data.data || null);
            setLoaded(true);
          }
        } catch {
          if (!cancelled && mountedRef.current) {
            setLoaded(true);
          }
        }
      })();

      return () => { cancelled = true; };
    });
  }, [visible, placement]);

  /* ── Script injection with §7 failsafe ── */
  useEffect(() => {
    if (!ad?.ad_code) return;
    const { error } = injectScripts(ad.ad_code);
    if (error) setScriptError(true); // §7: triggers fallback
  }, [ad]);

  /* ── §6 Impression tracking — exactly once per mount ── */
  useEffect(() => {
    if (!ad || impressionFiredRef.current) return;
    impressionFiredRef.current = true;
    incrementViews(placement);
    trackEvent(ad.id, placement, 'impression');
  }, [ad, placement]);

  /* ── §1 Real click tracking via pointer-enter + iframe focus ── */
  const handleMouseEnter = useCallback(() => {
    mouseEnteredRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseEnteredRef.current = false;
  }, []);

  /**
   * iFrame-based click detection:
   * When a user actually clicks into the ad iframe, the document loses focus.
   * We listen for window blur → if mouse intent was true → real click.
   */
  useEffect(() => {
    if (!ad) return;

    const handleWindowBlur = () => {
      if (mouseEnteredRef.current && !clickTrackedRef.current && ad) {
        clickTrackedRef.current = true;
        trackEvent(ad.id, placement, 'click');
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, [ad, placement]);

  /* Strip scripts from ad HTML */
  const safeHtml = ad?.ad_code
    ? injectScripts(ad.ad_code).html  // returns stripped html
    : '';

  /* ── Render guard: frequency cap → silent collapse ── */
  if (capped) return null;

  /* ── Adblock notice ── */
  if (blocked) {
    return (
      <div
        className={`ad-block-container ad-block-adblock-notice ${className}`}
        data-placement={placement}
        role="complementary"
        aria-label="Ad block notice"
        ref={externalRef || containerRef}
      >
        <div className="ad-block-adblock-inner">
          <span className="ad-block-adblock-icon">🛡️</span>
          <span className="ad-block-adblock-text">
            You&#39;re using an ad blocker. Ads help us keep this site free.
          </span>
        </div>
      </div>
    );
  }

  /* ── Error / no ad → fallback ── */
  if (loaded && (scriptError || !ad)) {
    if (!showFallback) return null;
    return (
      <div
        className={`ad-block-container ad-block-fallback ${className}`}
        data-placement={placement}
        role="complementary"
        aria-label="Support message"
        ref={externalRef || containerRef}
      >
        <p className="ad-block-fallback-text">{fallbackText}</p>
      </div>
    );
  }

  /* ── Normal ad render ── */
  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (externalRef) {
          if (typeof externalRef === 'function') externalRef(node);
          else externalRef.current = node;
        }
      }}
      className={`ad-block-container ${className} ${
        loaded && ad ? 'ad-block-loaded' : 'ad-block-placeholder'
      }`}
      style={{ minHeight: loaded && !ad ? 0 : `${minHeight}px` }}
      aria-label="Advertisement"
      data-placement={placement}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loaded && ad && safeHtml && (
        <div
          className="ad-block-inner"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      )}
    </div>
  );
};

export default AdBlock;
