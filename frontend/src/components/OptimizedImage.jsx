import React, { useRef, useEffect, useState } from 'react';

const OptimizedImage = ({ src, alt, className = '', ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // If browser supports native lazy loading, we render the sources immediately
    // and let the browser's native lazy loading handle it.
    if ('loading' in HTMLImageElement.prototype) {
      setIsVisible(true);
      return;
    }

    // Intersection Observer Fallback for older browsers without native lazy loading
    let currentObserver = null;
    
    if (typeof IntersectionObserver !== 'undefined') {
      currentObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '200px 0px' }
      );

      if (imgRef.current) {
        currentObserver.observe(imgRef.current);
      }
    } else {
      // Extremely old browser, just render it eagerly
      setIsVisible(true);
    }

    return () => {
      if (currentObserver && imgRef.current) {
        currentObserver.unobserve(imgRef.current);
      }
    };
  }, []);

  // Determine WebP source by replacing extension and folder structure
  const getWebpSrc = (originalSrc) => {
    if (!originalSrc || typeof originalSrc !== 'string') return '';
    try {
      const parts = originalSrc.split('/');
      const fileName = parts.pop();
      const dotIndex = fileName.lastIndexOf('.');
      
      if (dotIndex === -1) return originalSrc; // No extension found
      
      const baseName = fileName.substring(0, dotIndex);
      const ext = fileName.substring(dotIndex).toLowerCase();
      
      // We only convert common formats to WebP
      if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
        return originalSrc;
      }
      
      // Determine directory part (e.g. /images)
      const dir = parts.join('/');
      return `${dir}/webp/${baseName}.webp`;
    } catch (e) {
      return originalSrc;
    }
  };

  const webpSrc = getWebpSrc(src);

  return (
    <picture>
      {isVisible && webpSrc !== src && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      <img
        ref={imgRef}
        src={isVisible ? src : undefined}
        alt={alt || 'Optimized Image'}
        className={className}
        loading="lazy" // Native lazy loading
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
