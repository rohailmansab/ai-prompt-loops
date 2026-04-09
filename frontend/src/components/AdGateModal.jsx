/**
 * AdGateModal — §1 / §6 Reusable fullscreen ad gate
 *
 * Props:
 *   placement  string   — ad placement key (e.g. 'tool_action')
 *   onUnlock   function — called when the user is allowed to proceed
 *   onClose    function — called when the modal is dismissed (without unlock)
 *   variant    string   — 'fullscreen' (default) | 'popup' (blog popup)
 *   countdownSeconds number — default 4 for tool_action, 3 for popup
 *
 * Flow:
 *   1. Fetch active ad for placement
 *   2. Start countdown timer (only while ad is >=50% in viewport)
 *   3. After countdown: show "Continue" / unlock button
 *   4. Track events: impression → view_complete | skip
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { adsAPI } from '../services/api';
import './AdGateModal.css';

/* ── Script injection (fire-and-forget, deduped) ─────── */
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
          el.src = src; el.async = true; el.defer = true;
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
    console.warn('[AdGateModal] Script injection error:', err.message);
    return { html: '', error: true };
  }
};

/* ── Track ad event (fire-and-forget) ─────────────────── */
const fireEvent = (adId, placement, eventType) => {
  if (!adId) return;
  adsAPI.trackEvent({ ad_id: adId, placement, event_type: eventType }).catch(() => {});
};

/* ── SVG countdown ring values ─────────────────────────── */
const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AdGateModal = ({
  placement = 'tool_action',
  onUnlock,
  onClose,
  variant = 'fullscreen',
  countdownSeconds,
}) => {
  const TOTAL = countdownSeconds ?? (variant === 'popup' ? 3 : 4);

  const [ad, setAd] = useState(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL);
  const [isVisible, setIsVisible] = useState(false); // >=50% in viewport
  const [unlocked, setUnlocked] = useState(false);
  const [impressionFired, setImpressionFired] = useState(false);

  const adRef = useRef(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  /* ── Fetch ad ─────────────────────────────────────────── */
  useEffect(() => {
    mountedRef.current = true;
    adsAPI.getByPlacement(placement)
      .then(({ data }) => {
        if (!mountedRef.current) return;
        setAd(data.data || null);
        setAdLoaded(true);
      })
      .catch(() => {
        if (mountedRef.current) setAdLoaded(true);
      });
    return () => { mountedRef.current = false; };
  }, [placement]);

  /* ── Impression tracking ─────────────────────────────── */
  useEffect(() => {
    if (ad && !impressionFired) {
      setImpressionFired(true);
      fireEvent(ad.id, placement, 'impression');
    }
  }, [ad, placement, impressionFired]);

  /* ── Inject scripts once ad fetched ─────────────────── */
  useEffect(() => {
    if (ad?.ad_code) injectScripts(ad.ad_code);
  }, [ad]);

  /* ── Visibility observer (>=50% in viewport) ─────────── */
  useEffect(() => {
    const el = adRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (mountedRef.current) setIsVisible(entry.intersectionRatio >= 0.5);
      },
      { threshold: [0, 0.5, 1.0] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [adLoaded]);

  /* ── Countdown timer — only ticks while visible ──────── */
  useEffect(() => {
    if (unlocked) return;
    if (!adLoaded) return;

    if (isVisible && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && !unlocked) {
      setUnlocked(true);
    }

    return () => clearTimeout(timerRef.current);
  }, [isVisible, timeLeft, adLoaded, unlocked]);

  /* ── Handle skip/continue ─────────────────────────────── */
  const handleContinue = useCallback(() => {
    if (!unlocked) return; // safety guard
    fireEvent(ad?.id, placement, 'view_complete');
    onUnlock?.();
  }, [unlocked, ad, placement, onUnlock]);

  const handleSkip = useCallback(() => {
    fireEvent(ad?.id, placement, 'skip');
    onClose?.();
  }, [ad, placement, onClose]);

  /* ── Escape key closes (as skip) ─────────────────────── */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') handleSkip();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleSkip]);

  /* ── Lock body scroll ────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* ── Safe HTML (scripts stripped; injected separately) ── */
  const safeHtml = ad?.ad_code ? injectScripts(ad.ad_code).html : '';

  /* ── Progress values for ring ─────────────────────────── */
  const progress = (TOTAL - timeLeft) / TOTAL; // 0 → 1
  const dash = CIRCUMFERENCE * (1 - progress);

  const isPopup = variant === 'popup';
  const titleText = isPopup ? 'Quick message from our sponsors' : 'Watch this ad to unlock the tool';
  const labelText = isPopup ? 'Blog Sponsor' : 'Ad Required';
  const iconEmoji = isPopup ? '📢' : '🔒';

  return (
    <div
      className="adgate-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={titleText}
      id="adgate-overlay"
    >
      {/* SVG gradient definition (hidden) */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="adGateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>

      <div className={`adgate-modal${isPopup ? ' adgate-popup' : ''}`} id="adgate-modal">
        {/* — Header — */}
        <div className="adgate-header">
          <div className="adgate-header-left">
            <div className="adgate-icon">{iconEmoji}</div>
            <div>
              <div className="adgate-label">{labelText}</div>
              <div className="adgate-title">{titleText}</div>
            </div>
          </div>

          {/* Countdown ring */}
          <div className="adgate-countdown" aria-label={`${timeLeft} seconds remaining`}>
            <svg viewBox="0 0 52 52">
              <circle className="adgate-countdown-circle" cx="26" cy="26" r={RADIUS} />
              <circle
                className="adgate-countdown-progress"
                cx="26"
                cy="26"
                r={RADIUS}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dash}
                stroke="url(#adGateGradient)"
              />
            </svg>
            <div className="adgate-countdown-text">
              {unlocked ? '✓' : timeLeft}
            </div>
          </div>
        </div>

        {/* — Ad content — */}
        <div className="adgate-content" ref={adRef}>
          {!adLoaded && (
            <div className="adgate-loading">
              <div className="adgate-spinner" />
              <span>Loading ad…</span>
            </div>
          )}

          {adLoaded && ad && safeHtml && (
            <div
              className="adgate-ad-inner"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          )}

          {adLoaded && (!ad || !safeHtml) && (
            <div className="adgate-no-ad">
              <div className="adgate-no-ad-icon">📡</div>
              <p>Our sponsor's ad is loading…</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                Please wait {timeLeft > 0 ? `${timeLeft}s` : 'a moment'}
              </p>
            </div>
          )}
        </div>

        {/* — Footer: progress bar + skip/continue — */}
        <div className="adgate-footer">
          <div className="adgate-visibility-bar">
            <div className="adgate-visibility-label">
              {unlocked
                ? '✅ Ad view complete — you may continue!'
                : isVisible
                  ? `Ad visible — countdown: ${timeLeft}s remaining`
                  : '⚠️ Scroll down so the ad is visible to continue'}
            </div>
            <div className="adgate-bar-track">
              <div
                className="adgate-bar-fill"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            {!isVisible && !unlocked && (
              <div className="adgate-vis-notice">
                👆 Ad must be visible to count
              </div>
            )}
          </div>

          {unlocked ? (
            <button
              className="adgate-skip-btn unlocked"
              onClick={handleContinue}
              id="adgate-continue-btn"
              autoFocus
            >
              ✓ Continue
            </button>
          ) : (
            <button
              className="adgate-skip-btn locked"
              disabled
              id="adgate-skip-btn"
              title={`Available in ${timeLeft}s`}
            >
              ⏱ {timeLeft}s
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdGateModal;
