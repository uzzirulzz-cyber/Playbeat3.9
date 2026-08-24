import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Projector,
  Sparkles,
  Zap,
  Truck,
  Shield,
  Layers,
  CheckCircle2,
  Maximize2,
  Tv,
  Wifi,
  Volume2,
  Scale,
  ArrowRight
} from 'lucide-react';

export const SmartProjectorShowcase: React.FC = () => {
  const {
    products,
    setSelectedProduct,
    setIsCompareModalOpen,
    toggleCompare,
    compareList,
    formatPrice,
    addToCart,
    setIsCheckoutOpen
  } = useStore();

  const projectorProducts = products.filter(p => p.productType === 'physical_projector');
  const flagship = projectorProducts[0];

  if (!flagship) return null;

  return (
    <section id="projectors-section" className="w-full py-16 px-4 sm:px-6 bg-[var(--pb-charcoal)] border-b border-[var(--pb-line)] relative overflow-hidden">
      {/* Ambient Red/White Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[var(--pb-red)]/[0.06] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-white/[0.015] rounded-full blur-[160px] pointer-events-none" />

      <div className="pb-container space-y-10 relative z-10">
        {/* Section Header */}
        <div className="pb-section-header !mb-2 flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-4 border-b border-[var(--pb-line)]">
          <div>
            <span className="pb-eyebrow">
              <Projector className="w-3 h-3" />
              Flagship Hardware Collection
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
              Smart 4K Laser Cinema
            </h2>
            <p className="text-sm text-[var(--pb-silver-3)] max-w-2xl mt-1 leading-relaxed">
              Ultra short throw laser projection. Verified ALPD 4.0 optics, Google TV certification, and Harman Kardon acoustics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="pb-btn pb-btn-secondary pb-btn-sm"
            >
              <Scale className="w-4 h-4" />
              <span>Compare Specs ({compareList.length})</span>
            </button>
          </div>
        </div>

        {/* Flagship Hero Card */}
        <div className="rounded-3xl pb-card p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl">
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="pb-badge pb-badge-red">RECOMMENDED FLAGSHIP</span>
              <span className="text-xs font-mono text-[var(--pb-emerald)] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 3-Year Official Warranty
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {flagship.title}
            </h3>

            <p className="text-sm text-[var(--pb-silver-2)] leading-relaxed">
              {flagship.description}
            </p>

            {/* Spec Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[var(--pb-ink)] border border-[var(--pb-line)] space-y-1">
                <div className="text-[10px] text-[var(--pb-silver-3)] font-mono uppercase">Resolution</div>
                <div className="text-xs font-bold text-white font-mono">{flagship.projectorSpecs?.nativeResolution || 'True 4K UHD'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--pb-ink)] border border-[var(--pb-line)] space-y-1">
                <div className="text-[10px] text-[var(--pb-silver-3)] font-mono uppercase">Brightness</div>
                <div className="text-xs font-bold text-white font-mono">{flagship.projectorSpecs?.brightness || '2,800 Lumens'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--pb-ink)] border border-[var(--pb-line)] space-y-1">
                <div className="text-[10px] text-[var(--pb-silver-3)] font-mono uppercase">Max Screen</div>
                <div className="text-xs font-bold text-white font-mono">{flagship.projectorSpecs?.screenSize || '200 Inches'}</div>
              </div>
            </div>

            {/* Pricing & Actions */}
            <div className="pt-4 border-t border-[var(--pb-line)] flex flex-wrap items-center justify-between gap-4">
              <div>
                {flagship.compareAtPrice > flagship.price && (
                  <div className="text-xs text-[var(--pb-silver-3)] line-through font-mono">{formatPrice(flagship.compareAtPrice)}</div>
                )}
                <div className="pb-price-current !text-3xl">{formatPrice(flagship.price)}</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleCompare(flagship)}
                  className={`pb-variant-chip ${compareList.some(p => p.id === flagship.id) ? 'is-selected' : ''}`}
                >
                  {compareList.some(p => p.id === flagship.id) ? '✓ In Compare' : '+ Compare'}
                </button>
                <button
                  onClick={() => setSelectedProduct(flagship)}
                  className="pb-btn pb-btn-primary pb-btn-sm"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-[var(--pb-ink)] border border-[var(--pb-line)] group shadow-xl">
              <img
                src={flagship.images[0]}
                alt={flagship.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--pb-charcoal)] via-transparent to-black/20" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono text-xs border border-white/10">
                  Built-in Harman Kardon 30W
                </span>
                <span className="pb-badge pb-badge-red">Free Express Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
