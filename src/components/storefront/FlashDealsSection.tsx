import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Flame, Clock, Zap, Star } from 'lucide-react';
import { ProductImage } from '../common/ProductImage';

export const FlashDealsSection: React.FC = () => {
  const { products, setSelectedProduct, formatPrice, addToCart, setIsCheckoutOpen } = useStore();

  // 24-hour flash sale countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = products
    .filter((p) => (p.compareAtPrice && p.compareAtPrice > p.price) || p.isLimitedTime)
    .slice(0, 4);

  return (
    <section id="deals" className="w-full py-12 px-4 sm:px-6 bg-[var(--pb-ink)] border-b border-[var(--pb-line)]">
      <div className="pb-container space-y-6">
        {/* Deal Header with Live Countdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl pb-panel shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[var(--pb-red-soft)] text-[var(--pb-red-bright)] border border-[var(--pb-red-line)] flex items-center justify-center shadow-[0_0_15px_rgba(225,29,46,0.25)] pb-pulse-red">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="pb-eyebrow !text-[var(--pb-red-bright)]">
                  Flash Deals & Special Offers
                </span>
                <span className="pb-badge pb-badge-red pb-pulse-red">LIMITED TIME</span>
              </div>
              <h3 className="text-lg font-bold text-white font-display mt-1">
                Special Promotional Pricing Ending Soon
              </h3>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[var(--pb-gold)]" />
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
              <div className="px-3 py-1.5 rounded-lg bg-[var(--pb-ink)] border border-[var(--pb-line)] text-white shadow-inner">
                {String(timeLeft.hours).padStart(2, '0')}h
              </div>
              <span className="text-[var(--pb-silver-4)] font-bold">:</span>
              <div className="px-3 py-1.5 rounded-lg bg-[var(--pb-ink)] border border-[var(--pb-line)] text-white shadow-inner">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </div>
              <span className="text-[var(--pb-silver-4)] font-bold">:</span>
              <div className="px-3 py-1.5 rounded-lg bg-[var(--pb-red-soft)] border border-[var(--pb-red-line)] text-[var(--pb-red-bright)] shadow-inner">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </div>
            </div>
          </div>
        </div>

        {/* 4-Item Deal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dealProducts.map((product) => {
            const discountPct = product.compareAtPrice
              ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
              : 0;
            return (
              <article
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedProduct(product);
                  }
                }}
                role="button"
                aria-label={`View ${product.title}. ${discountPct}% off.`}
                className="p-4 rounded-2xl pb-card cursor-pointer group flex flex-col justify-between outline-none focus-visible:shadow-[var(--pb-ring-focus)]"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--pb-ink)] border border-[var(--pb-line)]">
                    <ProductImage
                      src={product.images?.[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 pb-badge pb-badge-red">
                      {discountPct > 0 ? `${discountPct}% OFF` : 'SPECIAL DEAL'}
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] text-[var(--pb-silver-3)] font-mono uppercase tracking-wider">
                      {product.categoryName}
                    </div>
                    <h4
                      className="font-bold text-white text-xs truncate mt-0.5 group-hover:text-[var(--pb-red-bright)] transition-colors"
                      title={product.title}
                    >
                      {product.title}
                    </h4>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] font-mono">
                        <Star className="w-2.5 h-2.5 fill-current text-[var(--pb-gold)]" />
                        <span className="text-white font-bold">{product.rating}</span>
                        <span className="text-[var(--pb-silver-4)]">({product.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--pb-line)] mt-3 flex items-center justify-between">
                  <div>
                    {product.compareAtPrice > product.price && (
                      <div className="text-[10px] text-[var(--pb-silver-3)] line-through font-mono">
                        {formatPrice(product.compareAtPrice)}
                      </div>
                    )}
                    <div className="pb-price-current !text-sm">{formatPrice(product.price)}</div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, product.variations?.[0], 1);
                      setIsCheckoutOpen(true);
                    }}
                    className="pb-btn pb-btn-primary pb-btn-sm"
                    aria-label={`Instant buy ${product.title}`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Buy</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
