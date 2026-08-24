import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { ArrowUpRight, Grid2x2 } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, setProductTypeFilter } = useStore();

  const featuredCategories = categories.filter(c => c.isFeatured);

  return (
    <section className="w-full py-12 px-4 sm:px-6 bg-[var(--pb-charcoal)] border-b border-[var(--pb-line)]">
      <div className="pb-container space-y-6">
        <div className="pb-section-header !mb-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-3 border-b border-[var(--pb-line)]">
          <div>
            <span className="pb-eyebrow">
              <Grid2x2 className="w-3 h-3" />
              Curated Collections
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display mt-1">Featured Categories</h2>
          </div>
          <p className="text-xs text-[var(--pb-silver-3)] max-w-md font-mono">
            Instant digital fulfillment on licenses & worldwide express delivery on 4K Laser Cinema.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {featuredCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const isProjector = cat.id === 'smart-projectors';

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setProductTypeFilter(isProjector ? 'physical_projector' : 'all');
                  const el = document.getElementById(isProjector ? 'projectors-section' : 'catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                aria-pressed={isSelected}
                className={`relative p-5 rounded-2xl text-left transition-all duration-300 group overflow-hidden border ${
                  isSelected
                    ? 'bg-[var(--pb-charcoal-2)] border-[var(--pb-red)] shadow-[0_10px_30px_-5px_rgba(225,29,46,0.25)]'
                    : 'bg-[var(--pb-charcoal)] border-[var(--pb-line)] hover:border-[var(--pb-red-line)] hover:bg-[var(--pb-charcoal-2)]'
                }`}
              >
                {/* Subtle Red Accent Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--pb-red-soft)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    isProjector
                      ? 'bg-[var(--pb-red-soft)] text-[var(--pb-red-bright)] border border-[var(--pb-red-line)] shadow-[0_0_15px_rgba(225,29,46,0.3)]'
                      : 'bg-[var(--pb-ink)] text-[var(--pb-silver-2)] border border-[var(--pb-line)] group-hover:bg-[var(--pb-red-soft)] group-hover:text-[var(--pb-red-bright)] group-hover:border-[var(--pb-red-line)]'
                  }`}>
                    <CategoryIcon name={cat.iconName} className="w-5 h-5" />
                  </div>

                  <div className="w-8 h-8 rounded-full bg-[var(--pb-ink)] border border-[var(--pb-line)] flex items-center justify-center text-[var(--pb-silver-3)] group-hover:text-white group-hover:bg-[var(--pb-red)] group-hover:border-transparent transition-all shadow-sm">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4 space-y-1 relative z-10">
                  <h3 className="font-bold text-white text-sm group-hover:text-[var(--pb-red-bright)] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[var(--pb-silver-3)] line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
