/**
 * BlogPopupAd — §3 Blog Popup Ad System
 *
 * - Triggers after 1.5s when a blog page is opened
 * - Shows ONCE per session (sessionStorage guard)
 * - Close (×) immediately available
 * - Skip button appears after 3 seconds
 * - Does NOT block content (SEO-safe)
 * - Uses placement: 'popup_blog'
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { adsAPI } from '../services/api';
import AdGateModal from './AdGateModal';

const SESSION_KEY = 'blog_popup_shown';

const BlogPopupAd = () => {
  const [show, setShow] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Check session guard — only show once per session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Delay 1.5s before showing
    const timer = setTimeout(async () => {
      if (!mountedRef.current) return;

      try {
        // Verify an active ad exists for this placement
        const { data } = await adsAPI.getByPlacement('popup_blog');
        if (data.data && mountedRef.current) {
          sessionStorage.setItem(SESSION_KEY, '1');
          setShow(true);
        }
      } catch {
        // No ad available — do nothing
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
    };
  }, []);

  const handleClose = useCallback(() => {
    setShow(false);
  }, []);

  if (!show) return null;

  return (
    <AdGateModal
      placement="popup_blog"
      variant="popup"
      countdownSeconds={3}
      onUnlock={handleClose}  // "Continue" = close (doesn't block anything)
      onClose={handleClose}   // X or skip = close
    />
  );
};

export default BlogPopupAd;
