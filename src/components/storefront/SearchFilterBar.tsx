import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Check,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

export type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating' | 'best-selling';
export type ProductTypeFilter = 'all' | 'digital' | 'physical_projector';
export type AvailabilityFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
export type DiscountFilter = 'all' | 'on-sale' | 'no-discount';

export interface FilterState {
  search: string;
  category: string;
  productType: ProductTypeFilter;
  availability: AvailabilityFilter;
  discount: DiscountFilter;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number;
  sort: SortOption;
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: 'all',
  productType: 'all',
  availability: 'all',
  discount: 'all',
  minPrice: null,
  maxPrice: null,
  minRating: 0,
  sort: 'featured',
};

export function applyFilters(products: Product[], filters: FilterState): Product[] {
  let result = products.filter((p) => {
    if (p.status !== 'published') return false;

    // Search by title / SKU / category / short description
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const hay = `${p.title} ${p.sku} ${p.categoryName} ${p.shortDescription}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    // Category
    if (filters.category !== 'all' && p.categoryId !== filters.category) return false;

    // Product type
    if (filters.productType !== 'all' && p.productType !== filters.productType) return false;

    // Availability
    if (filters.availability !== 'all') {
      if (filters.availability === 'in-stock' && p.stock <= 0) return false;
      if (filters.availability === 'low-stock' && !(p.stock > 0 && p.stock <= p.lowStockThreshold)) return false;
      if (filters.availability === 'out-of-stock' && p.stock > 0) return false;
    }

    // Discount
    if (filters.discount !== 'all') {
      const onSale = p.compareAtPrice > p.price;
      if (filters.discount === 'on-sale' && !onSale) return false;
      if (filters.discount === 'no-discount' && onSale) return false;
    }

    // Price range
    if (filters.minPrice !== null && p.price < filters.minPrice) return false;
    if (filters.maxPrice !== null && p.price > filters.maxPrice) return false;

    // Rating
    if (p.rating < filters.minRating) return false;

    return true;
  });

  // Sort
  switch (filters.sort) {
    case 'newest':
      result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'price-low':
      result = result.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      result = result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result = result.sort((a, b) => b.rating - a.rating);
      break;
    case 'best-selling':
      result = result.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
      break;
    case 'featured':
    default:
      result = result.sort(
        (a, b) =>
          ((b.isTrendingWeek || b.isTrending ? 1 : 0) + (b.isFeatured ? 1 : 0)) -
          ((a.isTrendingWeek || a.isTrending ? 1 : 0) + (a.isFeatured ? 1 : 0))
      );
      break;
  }

  return result;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  totalProducts: number;
  filteredCount: number;
}

/**
 * Desktop filter bar — sits above the product grid.
 * Shows: search, category dropdown, type tabs, sort dropdown, "Filters" button (opens drawer).
 */
export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, totalProducts, filteredCount }) => {
  const { categories } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });
  const hasActiveFilters = useMemo(
    () =>
      JSON.stringify({ ...filters, sort: 'featured', search: '' }) !==
      JSON.stringify({ ...DEFAULT_FILTERS, sort: 'featured', search: '' }),
    [filters]
  );

  return (
    <>
      <div className="flex flex-col gap-3 mb-6">
        {/* Search row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pb-silver-4)]" />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => update({ search: e.target.value })}
              placeholder="Search products by name, SKU, or category..."
              className="pb-input pl-9"
              aria-label="Search products"
            />
            {filters.search && (
              <button
                onClick={() => update({ search: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--pb-silver-4)] hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category dropdown */}
          <select
            value={filters.category}
            onChange={(e) => update({ category: e.target.value })}
            className="pb-select min-w-[180px]"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort dropdown */}
          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value as SortOption })}
            className="pb-select min-w-[160px]"
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="best-selling">Best Selling</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* Mobile filters button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="pb-btn pb-btn-secondary pb-btn-sm pb-show-mobile"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--pb-red)] text-white text-[10px] font-bold">
                !
              </span>
            )}
          </button>
        </div>

        {/* Type tabs + count + clear (desktop) */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-hide-mobile">
          <div className="pb-tabs">
            {(['all', 'digital', 'physical_projector'] as ProductTypeFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => update({ productType: t })}
                className={`pb-tab ${filters.productType === t ? 'is-active' : ''}`}
              >
                {t === 'all' ? 'All' : t === 'digital' ? 'Digital' : '4K Projectors'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[var(--pb-silver-3)]">
              <span className="text-white font-bold">{filteredCount}</span> of {totalProducts} products
            </span>
            {hasActiveFilters && (
              <button
                onClick={() => onChange({ ...DEFAULT_FILTERS })}
                className="pb-btn pb-btn-ghost pb-btn-sm"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile count + active filter chips */}
        <div className="pb-show-mobile flex items-center justify-between gap-2 text-xs font-mono">
          <span className="text-[var(--pb-silver-3)]">
            <span className="text-white font-bold">{filteredCount}</span> products
          </span>
          {hasActiveFilters && (
            <button
              onClick={() => onChange({ ...DEFAULT_FILTERS })}
              className="pb-btn pb-btn-ghost pb-btn-sm"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop inline advanced filters panel (only shows when filters are active) */}
      {hasActiveFilters && (
        <div className="pb-hide-mobile mb-6 p-4 pb-panel rounded-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Availability */}
            <div>
              <label className="pb-label">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => update({ availability: e.target.value as AvailabilityFilter })}
                className="pb-select"
              >
                <option value="all">Any</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            {/* Discount */}
            <div>
              <label className="pb-label">Discount</label>
              <select
                value={filters.discount}
                onChange={(e) => update({ discount: e.target.value as DiscountFilter })}
                className="pb-select"
              >
                <option value="all">Any</option>
                <option value="on-sale">On Sale</option>
                <option value="no-discount">No Discount</option>
              </select>
            </div>

            {/* Min rating */}
            <div>
              <label className="pb-label">Min Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => update({ minRating: Number(e.target.value) })}
                className="pb-select"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4.0+ ★</option>
                <option value={4.5}>4.5+ ★</option>
                <option value={4.8}>4.8+ ★</option>
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="pb-label">Max Price (USD)</label>
              <input
                type="number"
                value={filters.maxPrice ?? ''}
                onChange={(e) =>
                  update({ maxPrice: e.target.value === '' ? null : Number(e.target.value) })
                }
                placeholder="Any"
                className="pb-input"
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <MobileFilterDrawer
          filters={filters}
          onChange={update}
          onClose={() => setDrawerOpen(false)}
          onReset={() => {
            onChange({ ...DEFAULT_FILTERS });
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
};

/**
 * Mobile bottom-sheet drawer with all filter options.
 */
const MobileFilterDrawer: React.FC<{
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onClose: () => void;
  onReset: () => void;
}> = ({ filters, onChange, onClose, onReset }) => {
  return (
    <>
      <div className="pb-drawer-overlay" onClick={onClose} />
      <div className="pb-drawer pb-scroll">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[var(--pb-red-bright)]" />
            Filters
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--pb-silver-3)] hover:text-white hover:bg-white/5"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Product type */}
          <FilterGroup label="Product Type">
            <div className="pb-tabs w-full">
              {(['all', 'digital', 'physical_projector'] as ProductTypeFilter[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onChange({ productType: t })}
                  className={`pb-tab flex-1 ${filters.productType === t ? 'is-active' : ''}`}
                >
                  {t === 'all' ? 'All' : t === 'digital' ? 'Digital' : '4K'}
                </button>
              ))}
            </div>
          </FilterGroup>

          {/* Availability */}
          <FilterGroup label="Availability">
            <PillGrid
              options={[
                { value: 'all', label: 'Any' },
                { value: 'in-stock', label: 'In Stock' },
                { value: 'low-stock', label: 'Low Stock' },
                { value: 'out-of-stock', label: 'Out of Stock' },
              ]}
              value={filters.availability}
              onChange={(v) => onChange({ availability: v as AvailabilityFilter })}
            />
          </FilterGroup>

          {/* Discount */}
          <FilterGroup label="Discount">
            <PillGrid
              options={[
                { value: 'all', label: 'Any' },
                { value: 'on-sale', label: 'On Sale' },
                { value: 'no-discount', label: 'No Discount' },
              ]}
              value={filters.discount}
              onChange={(v) => onChange({ discount: v as DiscountFilter })}
            />
          </FilterGroup>

          {/* Min rating */}
          <FilterGroup label="Minimum Rating">
            <PillGrid
              options={[
                { value: '0', label: 'Any' },
                { value: '4', label: '4.0+ ★' },
                { value: '4.5', label: '4.5+ ★' },
                { value: '4.8', label: '4.8+ ★' },
              ]}
              value={String(filters.minRating)}
              onChange={(v) => onChange({ minRating: Number(v) })}
            />
          </FilterGroup>

          {/* Price range */}
          <FilterGroup label="Price Range (USD)">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.minPrice ?? ''}
                onChange={(e) =>
                  onChange({ minPrice: e.target.value === '' ? null : Number(e.target.value) })
                }
                placeholder="Min"
                className="pb-input"
                min="0"
              />
              <input
                type="number"
                value={filters.maxPrice ?? ''}
                onChange={(e) =>
                  onChange({ maxPrice: e.target.value === '' ? null : Number(e.target.value) })
                }
                placeholder="Max"
                className="pb-input"
                min="0"
              />
            </div>
          </FilterGroup>
        </div>

        <div className="sticky bottom-0 mt-6 pt-4 pb-2 bg-[var(--pb-charcoal)] border-t border-[var(--pb-line)] flex gap-2">
          <button onClick={onReset} className="pb-btn pb-btn-ghost pb-btn-sm flex-1">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button onClick={onClose} className="pb-btn pb-btn-primary pb-btn-sm flex-[2]">
            <Check className="w-3.5 h-3.5" />
            <span>Show Results</span>
          </button>
        </div>
      </div>
    </>
  );
};

const FilterGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="pb-label">{label}</label>
    {children}
  </div>
);

const PillGrid: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={`pb-variant-chip ${value === o.value ? 'is-selected' : ''}`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/** Quick filter chips rendered next to the section header (eyebrow filters) */
export const QuickFilterChips: React.FC<{
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
}> = ({ filters, onChange }) => {
  const chips: { key: keyof FilterState; value: string; label: string }[] = [];
  if (filters.availability !== 'all')
    chips.push({ key: 'availability', value: filters.availability, label: `Avail: ${filters.availability.replace('-', ' ')}` });
  if (filters.discount !== 'all')
    chips.push({ key: 'discount', value: filters.discount, label: `Sale: ${filters.discount.replace('-', ' ')}` });
  if (filters.minRating > 0) chips.push({ key: 'minRating', value: String(filters.minRating), label: `${filters.minRating}+ ★` });
  if (filters.minPrice !== null) chips.push({ key: 'minPrice', value: String(filters.minPrice), label: `Min $${filters.minPrice}` });
  if (filters.maxPrice !== null) chips.push({ key: 'maxPrice', value: String(filters.maxPrice), label: `Max $${filters.maxPrice}` });
  if (filters.productType !== 'all') chips.push({ key: 'productType', value: filters.productType, label: filters.productType === 'digital' ? 'Digital' : '4K Projectors' });

  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {chips.map((c) => (
        <button
          key={`${c.key}-${c.value}`}
          onClick={() => {
            // Reset that specific filter to its default
            const patch: Partial<FilterState> = {};
            if (c.key === 'minRating') patch.minRating = 0;
            else if (c.key === 'minPrice') patch.minPrice = null;
            else if (c.key === 'maxPrice') patch.maxPrice = null;
            else if (c.key === 'productType') patch.productType = 'all';
            else if (c.key === 'availability') patch.availability = 'all';
            else if (c.key === 'discount') patch.discount = 'all';
            onChange(patch);
          }}
          className="pb-variant-chip is-selected flex items-center gap-1"
        >
          <span>{c.label}</span>
          <X className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
};
