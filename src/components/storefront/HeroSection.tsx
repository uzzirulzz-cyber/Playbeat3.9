import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  Zap,
  ShieldCheck,
  Truck,
  Flame,
  ArrowRight,
  Sparkles,
  Projector,
  Gamepad2,
  Tv,
  Cpu,
  Clock,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import LiveStickers from './LiveStickers';

export const HeroSection: React.FC = () => {
  const {
    content,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    setProductTypeFilter,
    setSelectedProduct,
    products,
    setIsCompareModalOpen,
    formatPrice,
    setActivePromoFilter,
  } = useStore();

  const featuredProjector = products.find(p => p.productType === 'physical_projector') || products[0];

  return (
    <section className="relative w-full overflow-hidden bg-[var(--pb-ink)] border-b border-[var(--pb-line)] pt-8 pb-16 lg:py-20 px-4 sm:px-6">
      {/* Navy and gold ambient glow for the premium storefront hero */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#071d58]/30 via-white/[0.02] to-[#facc15]/[0.10] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
        {/* LEFT COLUMN: HERO TEXT & SEARCH */}
        <div className="lg:col-span-7 space-y-6">
          {/* Highlight Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--pb-charcoal)] border border-[var(--pb-line)] text-xs font-mono uppercase tracking-[0.2em] shadow-lg">
            <span className="flex h-2 w-2 rounded-full bg-[#facc15] shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse" />
            <span className="text-[#facc15] font-bold">{content.heroBanner.highlightBadge}</span>
            <span className="text-[var(--pb-silver-4)]">/</span>
            <span className="text-[var(--pb-silver)]">Instant Key Dispatch & 4K Laser</span>
          </div>

          {/* Main Headline */}
          <h1 className="pb-hero-title text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-[-0.055em] leading-[0.98]">
            Premium access,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#fff7b2] via-[#facc15] to-[#60a5fa]">beautifully delivered.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[var(--pb-silver-2)] max-w-xl leading-relaxed font-normal">
            {content.heroBanner.subheadline} Shop instant software keys, IPTV access, creator tools, and flagship 4K laser projectors with fast delivery and trusted support.
          </p>

          {/* Instant Search Bar */}
          <div className="max-w-lg relative">
            <div className="relative flex items-center rounded-full bg-[var(--pb-charcoal)] border border-[var(--pb-line)] p-1.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] focus-within:border-[var(--pb-red-line)] focus-within:shadow-[0_0_25px_rgba(225,29,46,0.2)] transition-all">
              <Search className="w-4 h-4 text-[var(--pb-silver-4)] ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Search Steam $100, 4K Projectors, Canva Pro, Netflix, IPTV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-[var(--pb-silver-4)] focus:outline-none"
              />
              <button
                onClick={() => {
                  const el = document.getElementById('catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="pb-btn pb-btn-primary pb-btn-sm shrink-0"
              >
                Search
              </button>
            </div>

            {/* Quick Pill Filter Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs text-[var(--pb-silver-3)]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--pb-silver-3)]">Trending:</span>
              {[
                { label: 'Limited-Time Offers', action: () => { setActivePromoFilter('limited-time'); const el = document.getElementById('catalog'); if (el) el.scrollIntoView({ behavior: 'smooth' }); } },
                { label: 'Flash Deals', action: () => { setActivePromoFilter('flash-deals'); const el = document.getElementById('deals'); if (el) el.scrollIntoView({ behavior: 'smooth' }); } },
                { label: '4K Projectors', action: () => { setSelectedCategory('smart-projectors'); setProductTypeFilter('physical_projector'); const el = document.getElementById('projectors-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); } },
                { label: 'Best Sellers', action: () => { setActivePromoFilter('best-sellers'); const el = document.getElementById('catalog'); if (el) el.scrollIntoView({ behavior: 'smooth' }); } }
              ].map((pill) => (
                <button
                  key={pill.label}
                  onClick={pill.action}
                  className="px-2.5 py-1 rounded-md bg-[var(--pb-charcoal)] hover:bg-[var(--pb-red-soft)] hover:text-[var(--pb-red-bright)] hover:border-[var(--pb-red-line)] border border-[var(--pb-line)] text-[11px] text-[var(--pb-silver)] font-medium transition-all"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Value Badges (3 Pillars) */}
          <div className="pt-4 grid grid-cols-3 gap-3 border-t border-[var(--pb-line)] max-w-lg">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--pb-emerald)]/15 text-[var(--pb-emerald)] flex items-center justify-center shrink-0 border border-[var(--pb-emerald)]/30">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] leading-tight font-mono text-[var(--pb-silver-2)]">
                <strong className="block text-white font-sans text-xs">Instant</strong>
                Key Release
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--pb-red)]/15 text-[var(--pb-red-bright)] flex items-center justify-center shrink-0 border border-[var(--pb-red-line)]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] leading-tight font-mono text-[var(--pb-silver-2)]">
                <strong className="block text-white font-sans text-xs">100%</strong>
                Authentic
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/20">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] leading-tight font-mono text-[var(--pb-silver-2)]">
                <strong className="block text-white font-sans text-xs">Express</strong>
                Air Freight
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HERO 4K PROJECTOR HARDWARE SPOTLIGHT */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-[var(--pb-red)]/40 via-[var(--pb-line)] to-transparent shadow-2xl">
            <div className="rounded-[22px] bg-[var(--pb-charcoal)] p-6 space-y-6 overflow-hidden relative">
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-[var(--pb-red-soft)] text-[var(--pb-red-bright)] font-mono text-[10px] font-bold tracking-wider uppercase border border-[var(--pb-red-line)]">
                  FLAGSHIP HARDWARE SPOTLIGHT
                </span>
                <span className="text-[11px] font-mono text-[var(--pb-emerald)] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--pb-emerald)] animate-ping" />
                  In Stock (Express Delivery)
                </span>
              </div>

              {/* Product Visual */}
              <div className="relative h-56 rounded-2xl overflow-hidden bg-[var(--pb-ink)] border border-[var(--pb-line)] group">
                <img
                  src={featuredProjector?.images[0]}
                  alt={featuredProjector?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--pb-charcoal)] via-transparent to-black/20" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono text-[11px] border border-white/10">
                    {featuredProjector?.projectorSpecs?.nativeResolution || '4K Smart Entertainment'}
                  </span>
                  <span className="pb-badge pb-badge-red">SAVE $200</span>
                </div>
              </div>

              {/* Product Info & Specs */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white leading-tight hover:text-[var(--pb-red-bright)] transition-colors cursor-pointer"
                  onClick={() => setSelectedProduct(featuredProjector)}
                >
                  {featuredProjector?.title}
                </h2>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[var(--pb-silver-2)]">
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[var(--pb-ink)] border border-[var(--pb-line)]">
                    <Tv className="w-3.5 h-3.5 text-[var(--pb-red-bright)]" />
                    <span>{featuredProjector?.projectorSpecs?.operatingSystem || 'Smart TV Ready'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[var(--pb-ink)] border border-[var(--pb-line)]">
                    <Cpu className="w-3.5 h-3.5 text-[var(--pb-gold)]" />
                    <span>{featuredProjector?.projectorSpecs?.brightness || 'High Brightness'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--pb-line)]">
                  <div>
                    <span className="text-xs text-[var(--pb-silver-3)] line-through mr-2 font-mono">
                      {formatPrice(featuredProjector?.compareAtPrice || 699.99)}
                    </span>
                    <span className="pb-price-current !text-2xl">
                      {formatPrice(featuredProjector?.price || 499.99)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCompareModalOpen(true)}
                      className="pb-btn pb-btn-secondary pb-btn-sm"
                    >
                      Compare
                    </button>
                    <button
                      onClick={() => setSelectedProduct(featuredProjector)}
                      className="pb-btn pb-btn-primary pb-btn-sm"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
