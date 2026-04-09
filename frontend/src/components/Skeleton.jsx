import './Skeleton.css';

// Reusable skeleton building blocks
export const SkeletonLine = ({ width = '100%', height = '1rem', style }) => (
  <div className="skeleton-line" style={{ width, height, ...style }} />
);

export const SkeletonCircle = ({ size = '3rem', style }) => (
  <div className="skeleton-circle" style={{ width: size, height: size, ...style }} />
);

// ── Page-specific skeleton presets ──

export const PromptCardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-badges">
      <SkeletonLine width="5rem" height="1.25rem" />
      <SkeletonLine width="4rem" height="1.25rem" />
    </div>
    <SkeletonLine width="90%" height="1.25rem" style={{ marginBottom: '0.75rem' }} />
    <SkeletonLine width="100%" height="0.85rem" />
    <SkeletonLine width="75%" height="0.85rem" />
    <div className="skeleton-footer">
      <SkeletonLine width="4rem" height="0.75rem" />
      <SkeletonLine width="3rem" height="0.75rem" />
    </div>
  </div>
);

export const PromptGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-3">
    {Array.from({ length: count }).map((_, i) => (
      <PromptCardSkeleton key={i} />
    ))}
  </div>
);

export const BlogCardSkeleton = () => (
  <div className="skeleton-card">
    <SkeletonLine width="100%" height="10rem" style={{ borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
    <SkeletonLine width="4rem" height="1rem" style={{ marginBottom: '0.75rem' }} />
    <SkeletonLine width="85%" height="1.25rem" style={{ marginBottom: '0.5rem' }} />
    <SkeletonLine width="100%" height="0.85rem" />
    <SkeletonLine width="60%" height="0.85rem" />
    <div className="skeleton-footer">
      <SkeletonLine width="5rem" height="0.75rem" />
      <SkeletonLine width="4rem" height="0.75rem" />
    </div>
  </div>
);

export const BlogGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-3">
    {Array.from({ length: count }).map((_, i) => (
      <BlogCardSkeleton key={i} />
    ))}
  </div>
);

export const DetailHeroSkeleton = () => (
  <div className="skeleton-hero">
    <SkeletonLine width="6rem" height="1rem" style={{ marginBottom: '1.5rem' }} />
    <div className="skeleton-badges" style={{ marginBottom: '1rem' }}>
      <SkeletonLine width="5rem" height="1.5rem" />
      <SkeletonLine width="4.5rem" height="1.5rem" />
      <SkeletonLine width="4rem" height="1.5rem" />
    </div>
    <SkeletonLine width="70%" height="2rem" style={{ marginBottom: '0.75rem' }} />
    <SkeletonLine width="50%" height="2rem" style={{ marginBottom: '1.5rem' }} />
    <SkeletonLine width="90%" height="1rem" />
    <SkeletonLine width="65%" height="1rem" style={{ marginBottom: '1.5rem' }} />
    <div className="skeleton-badges">
      <SkeletonLine width="4rem" height="0.85rem" />
      <SkeletonLine width="3.5rem" height="0.85rem" />
      <SkeletonLine width="5rem" height="0.85rem" />
    </div>
  </div>
);

export const DetailContentSkeleton = () => (
  <div className="skeleton-content-block">
    <SkeletonLine width="10rem" height="1.5rem" style={{ marginBottom: '1.5rem' }} />
    <SkeletonLine width="100%" height="0.9rem" />
    <SkeletonLine width="100%" height="0.9rem" />
    <SkeletonLine width="95%" height="0.9rem" />
    <SkeletonLine width="80%" height="0.9rem" />
    <SkeletonLine width="100%" height="0.9rem" />
    <SkeletonLine width="70%" height="0.9rem" />
    <SkeletonLine width="100%" height="0.9rem" />
    <SkeletonLine width="90%" height="0.9rem" />
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="skeleton-card" style={{ textAlign: 'center', padding: '2rem' }}>
    <SkeletonCircle size="3rem" style={{ margin: '0 auto 1rem' }} />
    <SkeletonLine width="60%" height="1.25rem" style={{ margin: '0 auto 0.75rem' }} />
    <SkeletonLine width="80%" height="0.85rem" style={{ margin: '0 auto' }} />
    <SkeletonLine width="50%" height="0.85rem" style={{ margin: '0.25rem auto 0' }} />
  </div>
);
