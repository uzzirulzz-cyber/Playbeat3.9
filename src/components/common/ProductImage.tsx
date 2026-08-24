import React, { useState, useEffect } from 'react';

interface ProductImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  /** Loading strategy — defaults to 'lazy' for product grids. */
  loading?: 'lazy' | 'eager';
  /** Decoding hint — defaults to 'async' for non-blocking. */
  decoding?: 'async' | 'sync' | 'auto';
  /** Optional fallback label shown when image is missing (defaults to "No Image"). */
  fallbackLabel?: string;
}

/**
 * Premium product image with:
 *   - Lazy loading by default (eager only when explicitly set, e.g. hero/LCP).
 *   - Async decoding so large images don't block the main thread.
 *   - Graceful fallback to a neutral charcoal panel when the URL is missing OR fails.
 *   - Fade-in on load for a polished feel.
 *   - Preserves aspect ratio via the parent's `object-cover` rule.
 *
 * Accessibility:
 *   - Always renders an `alt` attribute (required for screen readers).
 *   - When showing the fallback, the alt text is moved to `aria-label` on the
 *     fallback container so it's still announced.
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  fallbackLabel = 'No Image',
}) => {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset state when src changes (e.g. variant change in the same component)
  useEffect(() => {
    setErrored(false);
    setLoaded(false);
  }, [src]);

  // No src OR errored → show fallback panel
  if (!src || errored) {
    return (
      <div
        className={`pb-image-fallback ${className}`}
        role="img"
        aria-label={alt}
      >
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={() => setErrored(true)}
      onLoad={() => setLoaded(true)}
      className={`${className} ${loaded ? 'pb-img-loaded' : 'pb-img-loading'}`}
      style={{
        transition: 'opacity 0.35s ease',
        opacity: loaded ? 1 : 0.4,
      }}
    />
  );
};

/**
 * Inline style tag for the fade-in transition (kept here so the component is
 * self-contained and doesn't depend on additional CSS file changes).
 */
export const ProductImageStyles: React.FC = () => (
  <style>{`
    .pb-img-loading { filter: blur(8px); }
    .pb-img-loaded { filter: none; }
  `}</style>
);
