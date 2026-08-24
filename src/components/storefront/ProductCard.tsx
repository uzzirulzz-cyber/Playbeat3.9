import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariation } from '../../types';
import {
  Star,
  ShoppingCart,
  Heart,
  Zap,
  Truck,
  Eye,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Check,
  Tag,
} from 'lucide-react';
import { ProductImage } from '../common/ProductImage';

interface ProductCardProps {
  product: Product;
  /**
   * Compact mode — used by related-products rails. Hides the variant chips
   * row and shortens the description. The image, badges, price, and CTAs
   * remain unchanged so the card stays visually consistent everywhere.
   */
  compact?: boolean;
}

/**
 * ============================================================================
 *  PlayBeat Premium Product Card (v2)
 * ============================================================================
 *  Designed per the August 2026 brief:
 *    Black / charcoal / white / silver / subtle red accent.
 *
 *  Each card includes:
 *    • High-quality image with consistent 4:3 aspect + lazy loading + fallback.
 *    • Category badge (top-left).
 *    • Promo tag (NEW / SALE / POPULAR / BEST SELLER / LIMITED) or product-type
 *      badge (Instant Key / Tracked 4K) when no promo tag is set.
 *    • Discount % badge (red) when on sale.
 *    • Wishlist icon (top-right).
 *    • Quick View button (reveal-on-hover, always-on-touch).
 *    • In-cart indicator.
 *    • Rating + review count.
 *    • Product title (2-line clamp, min-height for alignment).
 *    • Short description (1-line clamp).
 *    • Variant selector (chips, max 3 visible + "+N").
 *    • Stock status (In stock / Low / Out).
 *    • Total sold indicator.
 *    • Current price (large mono) + original strike-through + savings amount.
 *    • Trust indicator (Instant key / Free shipping / Verified).
 *    • Prominent Add to Cart + secondary Quick View icon button.
 *    • Optional "Buy Now" badge overlay when `product.offerBadgeText === 'BEST SELLER'`
 *      or `product.isBestSeller` is true.
 *
 *  Visual hierarchy:
 *    - Price is the largest, brightest element on the card.
 *    - Discount badge is red (high contrast).
 *    - CTA buttons are always visible — never hover-only.
 *    - Card has consistent height via flex column + min-heights on title/desc.
 *
 *  Accessibility:
 *    - Whole card is keyboard-focusable (`tabIndex={0}`).
 *    - Focus ring is a 3px red ring (CSS `*:focus-visible` rule).
 *    - All icon buttons have `aria-label`s.
 *    - Image has descriptive `alt` text.
 *    - Variant chips are real buttons (not divs).
 *    - Disabled state for out-of-stock has `aria-disabled`.
 *
 *  Single source of truth — same card is used by:
 *    - Storefront catalog grid (TrendingSection)
 *    - Search results
 *    - Related-products rail inside ProductDetailModal
 *    - Admin live-preview pane (planned)
 * ============================================================================
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const {
    addToCart,
    toggleWishlist,
    wishlist,
    setSelectedProduct,
    formatPrice,
    isInCart,
    currentUser,
    setIsAuthModalOpen,
    addToast,
    setIsCheckoutOpen,
  } = useStore();

  const isGuest = currentUser.id === 'guest';

  // Local variation selection — defaults to the first available variation.
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(
    product.variations && product.variations.length > 0 ? product.variations[0] : undefined
  );

  // Derived price fields
  const currentPrice = selectedVariation ? selectedVariation.price : product.price;
  const hasDiscount = product.compareAtPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)
    : 0;
  const savingsAmount = hasDiscount ? product.compareAtPrice - currentPrice : 0;

  const isWishlisted = wishlist.includes(product.id);
  const isPhysical = product.productType === 'physical_projector';
  const inCart = isInCart(product.id, selectedVariation?.id);
  const isBestSeller = Boolean(product.isBestSeller || product.offerBadgeText === 'BEST SELLER');

  // Variants — only show when there are 2+ distinct variants.
  const visibleVariations =
    product.variations && product.variations.length > 1 ? product.variations.slice(0, 3) : [];

  // Stock state — three modes: out / low / healthy.
  const effectiveStock = selectedVariation ? selectedVariation.stock : product.stock;
  const stockState: 'out' | 'low' | 'healthy' =
    effectiveStock <= 0 ? 'out' : effectiveStock <= product.lowStockThreshold ? 'low' : 'healthy';

  // Promo tag selection — explicit offerBadgeText wins, else derive from flags.
  const promoTag: { text: string; color: 'red' | 'yellow' | 'green' | 'blue' | 'silver' | 'dark' } | null = (() => {
    if (product.offerBadgeText) {
      return { text: product.offerBadgeText, color: product.offerBadgeColor || 'red' };
    }
    if (product.isFlashDeal)   return { text: 'FLASH DEAL', color: 'red' };
    if (product.isLimitedTime) return { text: 'LIMITED', color: 'yellow' };
    if (isBestSeller)         return { text: 'BEST SELLER', color: 'yellow' };
    if (product.isTrendingWeek) return { text: 'TRENDING', color: 'blue' };
    if (product.isFeatured)   return { text: 'FEATURED', color: 'silver' };
    return null;
  })();

  // ---- Handlers (all respect guest gating) ----
  const handleCardClick = () => {
    if (isGuest) {
      setIsAuthModalOpen(true);
      addToast('info', 'Sign In Required', 'Please sign in to view product details.');
      return;
    }
    setSelectedProduct(product);
  };

  const handleCardKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
      setIsAuthModalOpen(true);
      addToast('info', 'Sign In Required', 'Please sign in to view products.');
      return;
    }
    setSelectedProduct(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
      setIsAuthModalOpen(true);
      addToast('info', 'Sign In Required', 'Please sign in to add items to cart.');
      return;
    }
    if (stockState === 'out') return;
    addToCart(product, selectedVariation, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
      setIsAuthModalOpen(true);
      addToast('info', 'Sign In Required', 'Please sign in to checkout.');
      return;
    }
    if (stockState === 'out') return;
    addToCart(product, selectedVariation, 1);
    setIsCheckoutOpen(true);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
      setIsAuthModalOpen(true);
      addToast('info', 'Sign In Required', 'Please sign in to use wishlist.');
      return;
    }
    toggleWishlist(product.id);
  };

  const handleVariationSelect = (e: React.MouseEvent, v: ProductVariation) => {
    e.stopPropagation();
    setSelectedVariation(v);
  };

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={handleCardKey}
      tabIndex={0}
      role="button"
      aria-label={`View ${product.title}. ${stockState === 'out' ? 'Currently out of stock.' : 'In stock.'}`}
      className="pb-product-card group flex flex-col h-full cursor-pointer relative outline-none"
    >
      {/* =================================================================
          IMAGE / BADGES / WISHLIST / QUICK VIEW
          ================================================================= */}
      <div className="relative aspect-[4/3] bg-[var(--pb-charcoal-2)] overflow-hidden rounded-t-[var(--pb-radius-lg)] border-b border-[var(--pb-line)]">
        <ProductImage
          src={product.images?.[0]}
          alt={product.title}
          className="pb-pc-image w-full h-full object-cover"
          loading="lazy"
        />

        {/* Subtle gradient for badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--pb-ink)] via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Top-left: single most important badge only (no stacking) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          {/* Priority: discount > promo tag > product-type badge */}
          {hasDiscount ? (
            <span className="pb-badge pb-badge-red">-{discountPercent}%</span>
          ) : promoTag ? (
            <span className={`pb-badge pb-badge-${promoTag.color}`}>{promoTag.text}</span>
          ) : isPhysical ? (
            <span className="pb-badge pb-badge-blue">
              <Truck className="w-2.5 h-2.5" /> Tracked 4K
            </span>
          ) : (
            <span className="pb-badge pb-badge-green">
              <Zap className="w-2.5 h-2.5" /> Instant Key
            </span>
          )}
        </div>

        {/* Top-right: wishlist icon */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
          aria-pressed={isWishlisted}
          className={`absolute top-2.5 right-2.5 p-2 rounded-lg backdrop-blur-md border transition-all z-10 ${
            isWishlisted
              ? 'bg-[var(--pb-red)] text-white border-[var(--pb-red-bright)] shadow-md shadow-[rgba(225,29,46,0.4)]'
              : 'bg-black/60 text-silver-200 hover:text-white hover:bg-black/80 border-white/10'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom-left: secondary promo tag (when both discount and promo exist) */}
        {hasDiscount && promoTag && (
          <div className="absolute bottom-14 left-2.5 z-10">
            <span className={`pb-badge pb-badge-${promoTag.color}`}>{promoTag.text}</span>
          </div>
        )}

        {/* In-cart indicator */}
        {inCart && (
          <div
            className="absolute top-12 right-2.5 px-1.5 py-0.5 rounded bg-[var(--pb-emerald)] text-white font-mono text-[9px] font-bold tracking-wider uppercase flex items-center gap-0.5 shadow z-10"
            aria-label="This item is in your cart"
          >
            <Check className="w-2.5 h-2.5" /> In Cart
          </div>
        )}

        {/* Out-of-stock overlay */}
        {stockState === 'out' && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-10">
            <span className="pb-badge pb-badge-red text-[10px] px-3 py-1.5">Out of Stock</span>
          </div>
        )}

        {/* Quick View button (revealed on hover, always on touch) */}
        <button
          onClick={handleQuickView}
          className="pb-pc-quickview absolute bottom-2.5 left-2.5 right-2.5 py-2 rounded-lg bg-black/75 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider font-mono border border-white/10 hover:bg-black/90 hover:border-[var(--pb-red-line)] flex items-center justify-center gap-1.5 z-10"
          aria-label={`Quick view ${product.title}`}
        >
          <Eye className="w-3 h-3" />
          <span>Quick View</span>
        </button>
      </div>

      {/* =================================================================
          CONTENT
          ================================================================= */}
      <div className="flex flex-col flex-1 p-3.5 gap-2">
        {/* Rating + sold count row */}
        <div className="flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1 text-[var(--pb-gold)] shrink-0">
            <Star className="w-3 h-3 fill-current" />
            <span className="font-bold text-[var(--pb-white)]">{product.rating}</span>
            <span className="text-[var(--pb-silver-3)]">({product.reviewCount})</span>
          </div>
          <span className="text-[var(--pb-silver-4)] uppercase tracking-wider truncate ml-2">
            {product.totalSold || 48}+ sold
          </span>
        </div>

        {/* Title — controlled wrapping (max 2 lines) */}
        <h3
          className="pb-pc-title font-semibold text-[var(--pb-white)] text-[13px] leading-snug line-clamp-2 min-h-[2.4em]"
          title={product.title}
        >
          {product.title}
        </h3>

        {/* One-line description (hidden in compact mode) */}
        {!compact && product.shortDescription && (
          <p className="text-[11px] text-[var(--pb-silver-3)] line-clamp-1 min-h-[1.1em]">
            {product.shortDescription}
          </p>
        )}

        {/* Variant chips (when 2+ variants exist) */}
        {visibleVariations.length > 0 && (
          <div className="space-y-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
            <div className="text-[9px] font-mono uppercase text-[var(--pb-silver-4)] tracking-wider">
              {product.variations![0].type}:
            </div>
            <div className="flex flex-wrap gap-1">
              {visibleVariations.map((v) => {
                const selected = selectedVariation?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={(e) => handleVariationSelect(e, v)}
                    className={`pb-variant-chip ${selected ? 'is-selected' : ''}`}
                    title={`${v.value} — ${formatPrice(v.price)}`}
                    aria-pressed={selected}
                  >
                    {v.value}
                  </button>
                );
              })}
              {product.variations!.length > 3 && (
                <span
                  className="px-2 py-1 text-[10px] font-mono text-[var(--pb-silver-3)] self-center cursor-pointer hover:text-[var(--pb-white)]"
                  onClick={handleQuickView}
                  title="View all variants"
                >
                  +{product.variations!.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Spacer to push price/button block to the bottom — keeps pricing aligned across cards */}
        <div className="flex-1" />

        {/* Stock / availability indicator */}
        <div className="flex items-center gap-2">
          {stockState === 'out' ? (
            <span className="pb-status pb-status-out-stock">
              <AlertCircle className="w-2.5 h-2.5" /> Out of stock
            </span>
          ) : stockState === 'low' ? (
            <span className="pb-status pb-status-low-stock">
              <AlertCircle className="w-2.5 h-2.5" /> Only {effectiveStock} left
            </span>
          ) : (
            <span className="pb-status pb-status-in-stock">
              <CheckCircle2 className="w-2.5 h-2.5" /> In stock
            </span>
          )}
        </div>

        {/* Price + savings block */}
        <div className="flex flex-col gap-0.5 pt-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="pb-price-current">{formatPrice(currentPrice)}</span>
            {hasDiscount && (
              <>
                <span className="pb-price-original">{formatPrice(product.compareAtPrice)}</span>
                <span className="pb-badge pb-badge-red">-{discountPercent}%</span>
              </>
            )}
          </div>
          {hasDiscount && savingsAmount > 0 && (
            <div className="pb-price-savings flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              <span>Save {formatPrice(savingsAmount)}</span>
            </div>
          )}
        </div>

        {/* Trust indicator row */}
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--pb-silver-3)]">
          {isPhysical ? (
            <>
              <Truck className="w-3 h-3 text-[var(--pb-silver-2)]" />
              <span>Free insured shipping</span>
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-[var(--pb-emerald)]" />
              <span>Instant key delivery</span>
            </>
          )}
          <span className="text-[var(--pb-silver-4)]">·</span>
          <ShieldCheck className="w-3 h-3 text-[var(--pb-emerald)]" />
          <span>Verified</span>
        </div>

        {/* Action buttons — always visible */}
        <div
          className="grid grid-cols-[1fr_auto] gap-2 pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleAddToCart}
            disabled={stockState === 'out'}
            aria-label={`Add ${product.title} to cart`}
            className="pb-btn pb-btn-primary pb-btn-sm pb-btn-block"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{inCart ? 'Add More' : 'Add to Cart'}</span>
          </button>
          <button
            onClick={handleQuickView}
            aria-label={`Quick view ${product.title}`}
            className="pb-btn pb-btn-secondary pb-btn-sm flex items-center justify-center"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Buy Now — only on best sellers / flash deals for premium emphasis */}
        {(isBestSeller || product.isFlashDeal) && stockState !== 'out' && (
          <button
            onClick={handleBuyNow}
            aria-label={`Buy ${product.title} now`}
            className="pb-btn pb-btn-dark pb-btn-sm pb-btn-block mt-1.5 border-[var(--pb-red-line)]"
            style={{ color: 'var(--pb-red-bright)' }}
          >
            <Zap className="w-3 h-3" />
            <span>Buy Now</span>
          </button>
        )}
      </div>
    </article>
  );
};

/**
 * Skeleton placeholder used while products are loading.
 * Keeps the grid layout stable — no jumpy reflows.
 * Uses the new `.pb-skeleton` shimmer.
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="pb-skeleton-card flex flex-col h-full">
      <div className="aspect-[4/3] pb-skeleton" />
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <div className="flex justify-between">
          <div className="h-3 w-16 pb-skeleton" />
          <div className="h-3 w-12 pb-skeleton" />
        </div>
        <div className="h-4 w-full pb-skeleton" />
        <div className="h-3 w-2/3 pb-skeleton" />
        <div className="flex-1" />
        <div className="h-3 w-20 pb-skeleton" />
        <div className="h-5 w-24 pb-skeleton" />
        <div className="h-8 w-full pb-skeleton" />
      </div>
    </div>
  );
};
