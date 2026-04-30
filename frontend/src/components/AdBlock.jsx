/**
 * AdBlock — Dynamic, placement-driven ad component (v4)
 *
 * Changes from v3:
 *  - Adblock detection simplified to bait-div only (removed unreliable CDN fetch probe)
 *  - Ad rendered inside <iframe srcDoc> so scripts execute in context and produce visual output
 *  - Removed SCRIPT_REGISTRY / injectScripts (no longer needed with iframe approach)
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

const todayKey = () => new Date().toISOString().slice(0, 10);

const getSessionViews = (placement) =>
  parseInt(sessionStorage.getItem(`ad_${placement}_session_views`) || '0', 10);

const getDailyViews = (placement) => {
  try {
    const raw = localStorage.getItem(`ad_${placement}_total_views`);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    return date === todayKey() ? count : 0;
  } catch { return 0; }
};

const incrementViews = (placement) => {
  sessionStorage.setItem(`ad_${placement}_session_views`, getSessionViews(placement) + 1);
  const today = todayKey();
  const daily = getDailyViews(placement);
  localStorage.setItem(`ad_${placement}_total_views`, JSON.stringify({ date: today, count: daily + 1 }));
};

const isFrequencyCapped = (placement) =>
  getSessionViews(placement) >= SESSION_MAX || getDailyViews(placement) >= DAILY_MAX;

/* ─────────────────────────────────────────────────────────────
   Fire-and-forget event tracker
───────────────────────────────────────────────────────────── */
const trackEvent = (adId, placement, eventType) => {
  adsAPI.trackEvent({ ad_id: adId, placement, event_type: eventType }).catch(() => {});
};

/* ─────────────────────────────────────────────────────────────
   SECTION 4 — Adblock Detection (bait-div only)
   Only Layer 1 — bait element visibility check.
   The CDN fetch probe was removed because it false-positives on
   many legitimate networks (corporate firewalls, VPNs, etc.).
───────────────────────────────────────────────────────────── */
let adblockStatus = null;
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

  const bait = document.createElement('div');
  bait.className = 'ad-placement ad-unit adsbox ads ad-banner';
  bait.style.cssText =
    'width:1px;height:1px;position:absolute;left:-9999px;top:-9999px;' +
    'opacity:0;pointer-events:none;';
  document.body.appendChild(bait);

  setTimeout(() => {
    const cs = window.getComputedStyle(bait);
    const baitBlocked =
      bait.offsetHeight === 0 ||
      bait.offsetWidth === 0 ||
      cs.display === 'none' ||
      cs.visibility === 'hidden';

    if (bait.parentNode) document.body.removeChild(bait);
    resolveAdblock(baitBlocked);
  }, 200);
};

const checkAdblock = (cb) => {
  adblockQueue.push(cb);
  runAdblockDetection();
};

/* ─────────────────────────────────────────────────────────────
   Build iframe srcdoc from ad code
   Wraps the raw ad snippet in a minimal HTML page so scripts
   execute in the iframe context and render visual content.
───────────────────────────────────────────────────────────── */
const buildSrcDoc = (adCode) =>
  `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:transparent;overflow:hidden;}</style></head><body>${adCode}</body></html>`;

/* ─────────────────────────────────────────────────────────────
   Exported so PromptContentLock can call it directly
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
  onAdVisible,
  adRef: externalRef,
}) => {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [capped, setCapped] = useState(false);

  const containerRef = useRef(null);
  const mountedRef = useRef(true);
  const impressionFiredRef = useRef(false);

  const mouseEnteredRef = useRef(false);
  const clickTrackedRef = useRef(false);

  /* ── IntersectionObserver: lazy load + ad visibility callback ── */
  useEffect(() => {
    mountedRef.current = true;
    const el = containerRef.current;
    if (!el) return;

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
          if (!cancelled && mountedRef.current) setLoaded(true);
        }
      })();

      return () => { cancelled = true; };
    });
  }, [visible, placement]);

  /* ── Impression tracking — exactly once per mount ── */
  useEffect(() => {
    if (!ad || impressionFiredRef.current) return;
    impressionFiredRef.current = true;
    incrementViews(placement);
    trackEvent(ad.id, placement, 'impression');
  }, [ad, placement]);

  /* ── Click tracking via pointer-enter + window blur ── */
  const handleMouseEnter = useCallback(() => { mouseEnteredRef.current = true; }, []);
  const handleMouseLeave = useCallback(() => { mouseEnteredRef.current = false; }, []);

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

  /* ── Frequency cap → silent collapse ── */
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

  /* ── No ad → fallback ── */
  if (loaded && !ad) {
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

  /* ── Normal ad render via iframe ── */
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
      {loaded && ad && (
        <iframe
          srcDoc={buildSrcDoc(ad.ad_code)}
          className="ad-block-inner"
          style={{ width: '100%', minHeight: `${minHeight}px`, border: 'none', display: 'block' }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
          title="Advertisement"
        />
      )}
    </div>
  );
};

export default AdBlock;
