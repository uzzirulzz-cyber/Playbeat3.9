import React from 'react';
import { Product } from '../../types';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  skeletonCount?: number;
  /** Use compact variant for related-products rails (smaller cards). */
  compact?: boolean;
  /** Override grid columns. Defaults to responsive 2/3/4/5. */
  className?: string;
  /** Optional empty-state element shown when products is empty AND not loading. */
  emptyState?: React.ReactNode;
}

/**
 * Reusable responsive product grid.
 *
 * Defaults:
 *   - Mobile (default):       2 columns
 *   - Tablet  (≥640px):       3 columns
 *   - Desktop (≥1024px):      4 columns
 *   - Wide    (≥1536px):      5 columns
 *
 * For compact rails (related products, recommendations), pass `compact`
 * which uses 2/3/4 columns at the same breakpoints with smaller gaps.
 *
 * Skeleton loading state mirrors the grid columns so there's no reflow
 * when real products arrive.
 */
export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  skeletonCount = 8,
  compact = false,
  className = '',
  emptyState,
}) => {
  if (loading) {
    return (
      <div className={compact ? 'pb-grid-products-compact' : 'pb-grid-products'}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className={`${compact ? 'pb-grid-products-compact' : 'pb-grid-products'} ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} compact={compact} />
      ))}
    </div>
  );
};
