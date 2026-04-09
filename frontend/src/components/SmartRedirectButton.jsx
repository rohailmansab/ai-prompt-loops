/**
 * SmartRedirectButton — §4 2-Step Smart Redirect
 *
 * FIRST CLICK:
 *   - Opens an ad (placement: 'redirect_click') in a new tab
 *   - Stores state in sessionStorage: redirect_<id> = 'clicked'
 *
 * SECOND CLICK:
 *   - Navigates to the actual target_url
 *
 * Props:
 *   id         — unique identifier (used for sessionStorage key)
 *   label      — button text
 *   targetUrl  — the real destination URL
 *   style      — 'primary' | 'outline'  (default: 'primary')
 */

import { useState, useEffect, useCallback } from 'react';
import { adsAPI } from '../services/api';
import './SmartRedirectButton.css';

const SmartRedirectButton = ({ id, label = 'Visit Link', targetUrl, style: btnStyle = 'primary' }) => {
  const storageKey = `redirect_${id}`;
  const [clickedOnce, setClickedOnce] = useState(false);
  const [adUrl, setAdUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    if (sessionStorage.getItem(storageKey) === 'clicked') {
      setClickedOnce(true);
    }
  }, [storageKey]);

  // Pre-fetch the ad URL so first click is instant
  useEffect(() => {
    adsAPI.getByPlacement('redirect_click')
      .then(({ data }) => {
        if (data.data?.ad_code) {
          // Extract the first href from the ad code, or use a fallback
          const match = data.data.ad_code.match(/href=["']([^"']+)["']/i);
          setAdUrl(match ? match[1] : null);
          // Track impression
          adsAPI.trackEvent({ ad_id: data.data.id, placement: 'redirect_click', event_type: 'impression' }).catch(() => {});
        }
      })
      .catch(() => {}); // silent — no ad available
  }, []);

  const handleClick = useCallback((e) => {
    e.preventDefault();
    if (loading) return;

    if (!clickedOnce) {
      // FIRST CLICK — open ad in new tab
      if (adUrl) {
        window.open(adUrl, '_blank', 'noopener,noreferrer');
        // Track click
        adsAPI.getByPlacement('redirect_click')
          .then(({ data }) => {
            if (data.data?.id) {
              adsAPI.trackEvent({ ad_id: data.data.id, placement: 'redirect_click', event_type: 'click' }).catch(() => {});
            }
          })
          .catch(() => {});
      }

      // Mark as clicked
      sessionStorage.setItem(storageKey, 'clicked');
      setClickedOnce(true);
    } else {
      // SECOND CLICK — navigate to actual target
      if (!targetUrl) return;

      // Validate URL (security: only allow http/https/relative)
      try {
        if (targetUrl.startsWith('/') || targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
          window.open(targetUrl, targetUrl.startsWith('/') ? '_self' : '_blank', 'noopener,noreferrer');
          // Reset so it can be used again (optional)
          sessionStorage.removeItem(storageKey);
          setClickedOnce(false);
        }
      } catch {
        // Invalid URL — do nothing
      }
    }
  }, [clickedOnce, adUrl, targetUrl, storageKey, loading]);

  const className = `smart-redirect-btn smart-redirect-btn--${btnStyle}${clickedOnce ? ' clicked-once' : ''}`;

  return (
    <button
      className={className}
      onClick={handleClick}
      title={clickedOnce ? `Click again to visit: ${targetUrl}` : 'Click to continue'}
      id={`redirect-btn-${id}`}
      aria-label={clickedOnce ? `Click again to visit ${label}` : label}
    >
      {clickedOnce ? (
        <>
          <span className="srb-icon">→</span>
          <span>{label}</span>
          <span className="srb-hint">Click again to visit</span>
        </>
      ) : (
        <>
          <span className="srb-icon">🔗</span>
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

export default SmartRedirectButton;
