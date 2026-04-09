/**
 * PromptContentLock — Content gating with ad-view unlock (v2)
 *
 * §2 — True Ad View Validation:
 *   Unlock ONLY when BOTH conditions are true:
 *     1. Ad container is ≥50% visible (IntersectionObserver via onAdVisible prop)
 *     2. Minimum 4 second timer has elapsed
 *   Fast-scrollers who bypass the ad cannot unlock early.
 *
 * §3 — Persistent frequency uses AdBlock's hybrid cap (handled inside AdBlock).
 *
 * UX Flow:
 *  1. 40% preview visible, rest blurred + locked
 *  2. "Unlock Full Prompt" CTA shown
 *  3. Click → AdBlock rendered prominently + countdown begins
 *  4. Timer ticks only while ad is ≥50% visible; pauses if user scrolls away
 *  5. Both satisfied → smooth reveal + copy enabled
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { FiCopy, FiCheck, FiLock, FiUnlock, FiEye } from 'react-icons/fi';
import AdBlock from './AdBlock';
import './PromptContentLock.css';

const UNLOCK_SECONDS = 4;     // total seconds ad must be viewed
const VISIBLE_RATIO  = 0.40;  // first 40% always visible

const PromptContentLock = ({ content = '', onCopy, copied }) => {
  const [isUnlocked,  setIsUnlocked]  = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false); // ad phase active
  const [secondsLeft, setSecondsLeft] = useState(UNLOCK_SECONDS);

  // §2 — Two independent signals; both must be true to unlock
  const adVisibleRef    = useRef(false);  // ad ≥50% in viewport
  const elapsedRef      = useRef(0);       // seconds ad was visible and counted
  const intervalRef     = useRef(null);
  const adContainerRef  = useRef(null);

  // Compute 40% preview split
  const lines = content.split('\n');
  const visibleLineCount = Math.max(3, Math.floor(lines.length * VISIBLE_RATIO));
  const visibleText  = lines.slice(0, visibleLineCount).join('\n');
  const lockedText   = lines.slice(visibleLineCount).join('\n');

  /* Cleanup on unmount */
  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  /* §2 — Callback from AdBlock: fires when visibility ratio crosses 50% */
  const handleAdVisible = useCallback((isVisible) => {
    adVisibleRef.current = isVisible;
  }, []);

  /** Start the unlock phase */
  const startUnlock = useCallback(() => {
    if (isUnlocking || isUnlocked) return;
    setIsUnlocking(true);
    setSecondsLeft(UNLOCK_SECONDS);
    elapsedRef.current = 0;

    // Scroll the ad into view briefly after it mounts
    requestAnimationFrame(() => {
      setTimeout(() => {
        adContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    });
  }, [isUnlocking, isUnlocked]);

  /* §2 — Countdown tick: only advances when ad is actually visible */
  useEffect(() => {
    if (!isUnlocking || isUnlocked) return;

    intervalRef.current = setInterval(() => {
      // Only advance timer while ad is ≥50% visible
      if (!adVisibleRef.current) return;

      elapsedRef.current += 1;
      const remaining = Math.max(0, UNLOCK_SECONDS - elapsedRef.current);
      setSecondsLeft(remaining);

      if (remaining === 0) {
        clearInterval(intervalRef.current);
        setIsUnlocked(true);
        setIsUnlocking(false);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isUnlocking, isUnlocked]);

  const handleCopy = useCallback(() => {
    if (!isUnlocked) return;
    if (onCopy) onCopy();
  }, [isUnlocked, onCopy]);

  /* Progress bar width: decreases from 100% → 0% as timer advances */
  const progressPct = ((secondsLeft / UNLOCK_SECONDS) * 100).toFixed(1);

  /* §2 — Timer paused indicator: ad not visible */
  const timerPaused = isUnlocking && !adVisibleRef.current;

  return (
    <div className="pcl-wrapper">

      {/* ── Prompt text area ── */}
      <div className="pcl-content-area">

        {/* Always-visible portion */}
        <pre className="prompt-content-text pcl-visible-text">{visibleText}</pre>

        {/* Locked / blurred remainder */}
        {!isUnlocked && (
          <div className="pcl-blur-zone" aria-hidden="true">
            <pre className="prompt-content-text pcl-blurred-text">{lockedText}</pre>
            <div className="pcl-blur-overlay" />
            <div className="pcl-lock-badge">
              <FiLock className="pcl-lock-icon" />
              <span>Full prompt locked</span>
            </div>
          </div>
        )}

        {/* Unlocked: revealed with animation */}
        {isUnlocked && (
          <pre className="prompt-content-text pcl-full-text pcl-reveal-anim">
            {lockedText}
          </pre>
        )}
      </div>

      {/* ── CTA: shown before unlock starts ── */}
      {!isUnlocked && !isUnlocking && (
        <div className="pcl-unlock-cta">
          <div className="pcl-unlock-card">
            <div className="pcl-unlock-icon-wrap">
              <FiEye className="pcl-unlock-eye" />
            </div>
            <h3 className="pcl-unlock-title">Unlock Full Prompt</h3>
            <p className="pcl-unlock-desc">
              View a brief ad to access the complete prompt template for free.
            </p>
            <button
              className="btn btn-primary pcl-unlock-btn"
              onClick={startUnlock}
              id="unlock-prompt-btn"
            >
              <FiUnlock /> Unlock Full Prompt
            </button>
          </div>
        </div>
      )}

      {/* ── Ad phase: timer + AdBlock ── */}
      {isUnlocking && (
        <div className="pcl-ad-phase" ref={adContainerRef}>
          <div className="pcl-ad-header">
            {/* Progress bar */}
            <div className="pcl-ad-progress-track">
              <div
                className="pcl-ad-progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="pcl-ad-status-row">
              <span className={`pcl-ad-timer ${timerPaused ? 'pcl-timer-paused' : ''}`}>
                {timerPaused
                  ? '⏸ Scroll back to the ad to continue…'
                  : `Unlocking in ${secondsLeft}s…`}
              </span>
              <span className="pcl-ad-label">Your support keeps this site free 🙌</span>
            </div>
          </div>

          {/* AdBlock with onAdVisible for §2 validation */}
          <AdBlock
            placement="prompt_top"
            minHeight={180}
            showFallback={true}
            fallbackText="Thank you for supporting us! ❤️"
            className="pcl-unlock-ad"
            onAdVisible={handleAdVisible}
          />
        </div>
      )}

      {/* ── Copy actions ── */}
      <div className="pcl-actions">
        <button
          className={`btn btn-sm ${
            isUnlocked
              ? copied ? 'btn-copied' : 'btn-primary'
              : 'btn-secondary pcl-copy-locked'
          }`}
          onClick={handleCopy}
          disabled={!isUnlocked}
          id="copy-prompt-btn"
          title={isUnlocked ? 'Copy full prompt' : 'Unlock to copy full prompt'}
          aria-label={isUnlocked ? 'Copy full prompt' : 'Unlock to copy full prompt'}
        >
          {copied ? (
            <><FiCheck /> Copied!</>
          ) : isUnlocked ? (
            <><FiCopy /> Copy Prompt</>
          ) : (
            <><FiLock /> Unlock to Copy</>
          )}
        </button>

        {!isUnlocked && (
          <span className="pcl-copy-hint">Unlock the full prompt first</span>
        )}
      </div>
    </div>
  );
};

export default PromptContentLock;
