import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Filter, Sparkles } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import {
  FilterBar,
  applyFilters,
  DEFAULT_FILTERS,
  FilterState,
  QuickFilterChips,
} from './SearchFilterBar';

export const TrendingSection: React.FC = () => {
  const { products, categories, selectedCategory, setSelectedCategory } = useStore();
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    category: selectedCategory !== 'all' ? selectedCategory : 'all',
  });

  // Sync category from store (Header mega-menu, HeroSection pills)
  useEffect(() => {
    setFilters((f) => ({ ...f, category: selectedCategory !== 'all' ? selectedCategory : 'all' }));
  }, [selectedCategory]);

  // Simulated catalog loading — skeleton state for ~450ms on filter change
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(t);
  }, [filters]);

  // Apply all filters + sort
  const filtered = useMemo(() => applyFilters(products, filters), [products, filters]);
  const publishedCount = useMemo(() => products.filter((p) => p.status === 'published').length, [products]);

  const updateFilters = (next: FilterState) => {
    setFilters(next);
    // Keep the store's selectedCategory in sync so the Header's mega-menu
    // reflects the active category pill.
    if (next.category !== selectedCategory) {
      setSelectedCategory(next.category === 'all' ? 'all' : next.category);
    }
  };

  const getTitle = () => {
    if (filters.search.trim()) return `Search: "${filters.search.trim()}"`;
    if (filters.category !== 'all') {
      const cat = categories.find((c) => c.id === filters.category);
      return cat ? cat.name : 'Catalog';
    }
    if (filters.productType === 'digital') return 'Digital Products';
    if (filters.productType === 'physical_projector') return '4K Smart Projectors';
    return 'Trending Products & Digital Drops';
  };

  return (
    <section
      id="catalog"
      className="w-full py-12 lg:py-16 bg-[var(--pb-ink)] border-b border-[var(--pb-line)] relative"
    >
      <div className="pb-container space-y-6">
        {/* SECTION HEADER */}
        <div className="pb-section-header !mb-2">
          <span className="pb-eyebrow">
            <Sparkles className="w-3 h-3" />
            Verified Catalog
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            {getTitle()}
          </h2>
          <p className="text-[var(--pb-silver-3)] text-sm">
            Instant digital delivery on keys & licenses · Express tracked shipping on 4K Smart Projectors.
          </p>
        </div>

        {/* FILTER BAR */}
        <FilterBar
          filters={filters}
          onChange={updateFilters}
          totalProducts={publishedCount}
          filteredCount={filtered.length}
        />

        {/* ACTIVE FILTER CHIPS (only shows when filters are active) */}
        <QuickFilterChips filters={filters} onChange={(patch) => updateFilters({ ...filters, ...patch })} />

        {/* PRODUCT GRID */}
        {isLoading ? (
          <ProductGrid products={[]} loading skeletonCount={8} />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[var(--pb-charcoal)] border border-[var(--pb-line)] p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--pb-red-soft)] text-[var(--pb-red-bright)] flex items-center justify-center mx-auto border border-[var(--pb-red-line)]">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No products found</h3>
            <p className="text-xs text-[var(--pb-silver-3)] max-w-sm mx-auto">
              Try adjusting your search, category, or filters to explore our complete verified inventory.
            </p>
            <button
              onClick={() => updateFilters({ ...DEFAULT_FILTERS })}
              className="pb-btn pb-btn-secondary pb-btn-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <ProductGrid products={filtered} loading={false} />
        )}
      </div>
    </section>
  );
};
