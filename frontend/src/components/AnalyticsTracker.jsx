import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsAPI } from '../services/api';

export const AnalyticsTracker = () => {
  const location = useLocation();
  const startTime = useRef(Date.now());
  const lastPath = useRef(location.pathname);

  // Send engagement time for the previous path
  const flushEngagement = () => {
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    if (duration > 0 && !lastPath.current.startsWith('/admin')) {
      analyticsAPI.track({
        event_type: 'engagement_time',
        path: lastPath.current,
        duration,
      }).catch(() => {});
    }
  };

  useEffect(() => {
    // We navigated to a new path
    if (lastPath.current !== location.pathname) {
      // Flush previous path's engagement
      flushEngagement();

      // Set new path and restart timer
      lastPath.current = location.pathname;
      startTime.current = Date.now();
      
      // Track new page view
      if (!location.pathname.startsWith('/admin')) {
        analyticsAPI.track({ event_type: 'page_view', path: location.pathname }).catch(() => {});
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    // Initial page load track
    if (!location.pathname.startsWith('/admin')) {
       analyticsAPI.track({ event_type: 'page_view', path: location.pathname }).catch(() => {});
    }

    // Flush on unmount (tab close / unmount)
    return () => {
      flushEngagement();
    };
  }, []); // eslint-disable-line

  return null;
};
