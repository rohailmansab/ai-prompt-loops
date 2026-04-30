/**
 * AdGateModal — §1 / §6 Reusable fullscreen ad gate (v2)
 *
 * Changes from v1:
 *  - Ad rendered inside <iframe srcDoc> so scripts execute in context
 *    and produce actual visual content (banners, video, etc.)
 *  - Removed SCRIPT_REGISTRY / injectScripts / safeHtml (no longer needed)
 *
 * Props:
 *   placement        string   — ad placement key (e.g. 'tool_action')
 *   onUnlock         function — called when the user is allowed to proceed
 *   onClose          function — called when the modal is dismissed (without unlock)
 *   variant          string   — 'fullscreen' (default) | 'popup' (blog popup)
 *   countdownSeconds number   — default 4 for tool_action, 3 for popup
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { adsAPI } from '../services/api';
import './AdGateModal.css';

/* ── Track ad event (fire-and-forget) ─────────────────── */
const fireEvent = (adId, placement, eventType) => {
  if (!adId) return;
  adsAPI.trackEvent({ ad_id: adId, placement, event_type: eventType }).catch(() => {});
};

/* ── Build iframe srcdoc from raw ad code ─────────────── */
const buildSrcDoc = (adCode) =>
  `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#1a1a28;display:flex;align-items:center;justify-content:center;min-height:100vh;overflow:hidden;}</style></head><body>${adCode}</body></html>`;

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
  const [isVisible, setIsVisible] = useState(false);
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
    if (!unlocked) return;
    fireEvent(ad?.id, placement, 'view_complete');
    onUnlock?.();
  }, [unlocked, ad, placement, onUnlock]);

  const handleSkip = useCallback(() => {
    fireEvent(ad?.id, placement, 'skip');
    onClose?.();
  }, [ad, placement, onClose]);

  /* ── Escape key closes (as skip) ─────────────────────── */
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') handleSkip(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleSkip]);

  /* ── Lock body scroll ────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* ── Progress values for ring ─────────────────────────── */
  const progress = (TOTAL - timeLeft) / TOTAL;
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

          {adLoaded && ad && (
            <iframe
              srcDoc={buildSrcDoc(ad.ad_code)}
              className="adgate-ad-inner"
              style={{ width: '100%', height: '250px', border: 'none', display: 'block', borderRadius: '8px' }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
              title="Sponsored advertisement"
            />
          )}

          {adLoaded && !ad && (
            <div className="adgate-no-ad">
              <div className="adgate-no-ad-icon">📡</div>
              <p>Our sponsor&apos;s ad is loading…</p>
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
