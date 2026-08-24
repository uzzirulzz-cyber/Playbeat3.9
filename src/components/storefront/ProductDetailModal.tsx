import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductVariation, Product } from '../../types';
import {
  X,
  Star,
  Zap,
  Truck,
  ShieldCheck,
  Heart,
  ShoppingCart,
  ArrowRight,
  CheckCircle2,
  Lock,
  Copy,
  Minus,
  Plus,
  AlertCircle,
  Scale,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from './ProductCard';

const RECENTLY_VIEWED_KEY = 'playbeat_recently_viewed';
const RECENTLY_VIEWED_MAX = 8;

/**
 * Persist recently-viewed product IDs to localStorage so the rail
 * survives page refreshes. Only public, published product IDs are stored —
 * no sensitive information is written to disk.
 */
function pushRecentlyViewed(productId: string) {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [productId, ...list.filter((id) => id !== productId)].slice(0, RECENTLY_VIEWED_MAX);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  } catch {
    // Ignore localStorage errors (private mode, full storage, etc.)
  }
}

function readRecentlyViewed(): string[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const ProductDetailModal: React.FC = () => {
  const {
    products,
    selectedProduct,
    setSelectedProduct,
    addToCart,
    toggleWishlist,
    wishlist,
    formatPrice,
    setIsCheckoutOpen,
    toggleCompare,
    setIsCompareModalOpen,
    isInCart,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'delivery' | 'reviews'>('details');

  // Reset internal state whenever the selected product changes
  useEffect(() => {
    if (!selectedProduct) return;
    setActiveImageIndex(0);
    setQuantity(1);
    setActiveTab('details');
    setSelectedVariation(
      selectedProduct.variations && selectedProduct.variations.length > 0
        ? selectedProduct.variations[0]
        : undefined
    );
    pushRecentlyViewed(selectedProduct.id);
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const currentPrice = selectedVariation ? selectedVariation.price : selectedProduct.price;
  const isSaved = wishlist.includes(selectedProduct.id);
  const isPhysical = selectedProduct.productType === 'physical_projector';
  const inCart = isInCart(selectedProduct.id, selectedVariation?.id);

  // Stock state
  const effectiveStock = selectedVariation ? selectedVariation.stock : selectedProduct.stock;
  const stockState: 'out' | 'low' | 'healthy' =
    effectiveStock <= 0 ? 'out' : effectiveStock <= selectedProduct.lowStockThreshold ? 'low' : 'healthy';

  // Has discount
  const hasDiscount = selectedProduct.compareAtPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((selectedProduct.compareAtPrice - currentPrice) / selectedProduct.compareAtPrice) * 100)
    : 0;

  // Related: same category, exclude current, take 4
  const relatedProducts = products
    .filter((p) => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id && p.status === 'published')
    .slice(0, 4);

  // Recently viewed: from localStorage, exclude current, take 4
  const recentlyViewedIds = readRecentlyViewed().filter((id) => id !== selectedProduct.id);
  const recentlyViewed = recentlyViewedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p) && p.status === 'published')
    .slice(0, 4);

  const handleBuyNow = () => {
    addToCart(selectedProduct, selectedVariation, quantity);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, selectedVariation, quantity);
  };

  const handleQtyIncrement = () => {
    if (effectiveStock > 0 && quantity >= effectiveStock) return;
    setQuantity((q) => q + 1);
  };

  const handleQtyDecrement = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          aria-hidden="true"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-5xl rounded-3xl bg-[#0D0D12] border border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] p-4 sm:p-6 lg:p-8 z-10 my-6 max-h-[94vh] overflow-y-auto scrollbar-thin"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdp-title"
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedProduct(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors z-20 border border-white/5"
            aria-label="Close product modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* LEFT: GALLERY */}
            <div className="lg:col-span-6 space-y-4">
              <div className="gallery-main relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-inner">
                <img
                  src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="gallery-main-image w-full h-full object-cover"
                />

                {/* Type / discount badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {isPhysical ? (
                    <span className="px-3 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold font-mono uppercase tracking-wider shadow-md">
                      4K HARDWARE
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold font-mono uppercase tracking-wider shadow-md">
                      INSTANT DIGITAL
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="px-3 py-1 rounded-lg bg-[#FF304F] text-white text-[10px] font-bold font-mono uppercase tracking-wider shadow-md">
                      -{discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {selectedProduct.images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {selectedProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-zinc-950 shrink-0 transition-all ${
                        activeImageIndex === idx ? 'border-red-500 ring-2 ring-red-500/30' : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Assurance Box */}
              <div className="p-4 rounded-2xl bg-[#131318] border border-white/10 space-y-2 text-xs text-zinc-300">
                <div className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>PlayBeat Verified Guarantee</span>
                </div>
                <div className="space-y-1 text-xs text-zinc-400">
                  <p>• 100% Genuine, tested, and unactivated product license key or original factory-sealed unit.</p>
                  <p>• {isPhysical ? 'DHL Express 2-4 days worldwide tracked delivery with 3-year warranty.' : 'Instant delivery directly onto your screen and emailed PDF invoice in under 5 seconds.'}</p>
                </div>
              </div>
            </div>

            {/* RIGHT: DETAILS & ACTIONS */}
            <div className="lg:col-span-6 space-y-5 flex flex-col">
              <div>
                {/* Meta Bar */}
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-white/10">
                  <span>SKU: <span className="text-zinc-200">{selectedProduct.sku}</span></span>
                  <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold text-amber-300">{selectedProduct.rating}</span>
                    <span className="text-zinc-400">({selectedProduct.reviewCount})</span>
                  </div>
                </div>

                {/* Title */}
                <h1 id="pdp-title" className="text-xl sm:text-2xl font-bold text-white font-display mt-3 leading-snug">
                  {selectedProduct.title}
                </h1>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                  {selectedProduct.shortDescription}
                </p>

                {/* Variation Selector (Duplicate Protected) */}
                {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold text-zinc-400 uppercase">
                        Choose {selectedProduct.variations[0].type}:
                      </label>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {selectedProduct.variations.length} options
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.variations.map((v) => {
                        const isSelected = selectedVariation?.id === v.id;
                        const isOutOfStock = v.stock <= 0;
                        return (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariation(v)}
                            disabled={isOutOfStock}
                            className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all border ${
                              isSelected
                                ? 'bg-red-600/20 text-red-400 font-bold border-red-500/50 shadow-sm'
                                : isOutOfStock
                                ? 'bg-[#0a0a0e] text-zinc-600 border-white/5 cursor-not-allowed line-through'
                                : 'bg-[#141418] hover:bg-white/10 text-zinc-300 border-white/10'
                            }`}
                          >
                            <span>{v.value}</span>
                            <span className="ml-1.5 opacity-80 text-[11px]">({formatPrice(v.price)})</span>
                            {isOutOfStock && <span className="ml-1 text-[10px]">· Out</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Display */}
                <div className="mt-5 p-4 rounded-2xl bg-[#141418] border border-white/10 flex items-center justify-between shadow-inner">
                  <div>
                    {hasDiscount && (
                      <div className="text-xs text-zinc-400 line-through font-mono">
                        {formatPrice(selectedProduct.compareAtPrice)}
                      </div>
                    )}
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {formatPrice(currentPrice)}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      stockState === 'out'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : stockState === 'low'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {stockState === 'out'
                        ? 'SOLD OUT'
                        : stockState === 'low'
                        ? `LOW STOCK (${effectiveStock})`
                        : `IN STOCK (${effectiveStock})`}
                    </span>
                    <div className="text-xs text-zinc-400 mt-1">
                      {isPhysical ? 'Free Insured Shipping' : 'Instant Key Delivery'}
                    </div>
                  </div>
                </div>

                {/* Quantity + Add to Cart */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Quantity selector */}
                    <div className="flex items-center bg-[#141418] rounded-xl border border-white/10 p-1">
                      <button
                        onClick={handleQtyDecrement}
                        disabled={quantity <= 1}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 text-sm font-mono text-white font-medium min-w-[3ch] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={handleQtyIncrement}
                        disabled={effectiveStock > 0 && quantity >= effectiveStock}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 text-xs text-zinc-400">
                      {stockState !== 'out' && (
                        <span>
                          Subtotal: <span className="text-white font-mono font-bold">{formatPrice(currentPrice * quantity)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleBuyNow}
                      disabled={stockState === 'out'}
                      className="btn-glossy btn-glossy-yellow flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Buy Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleAddToCart}
                      disabled={stockState === 'out'}
                      className="btn-glossy btn-glossy-emerald flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="hidden sm:inline">{inCart ? 'Add More' : 'Add to Cart'}</span>
                    </button>
                  </div>

                  {/* Secondary actions */}
                  <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => toggleWishlist(selectedProduct.id)}
                      className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-red-500' : ''}`} />
                      <span>{isSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                    </button>

                    {isPhysical && (
                      <button
                        onClick={() => {
                          toggleCompare(selectedProduct);
                          setIsCompareModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-mono"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Compare Specs</span>
                      </button>
                    )}
                  </div>

                  {stockState === 'low' && (
                    <div className="flex items-center gap-2 text-[11px] text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Hurry — only {effectiveStock} units left in stock.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Tabs */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex gap-4 border-b border-white/10 pb-2 text-xs font-semibold overflow-x-auto scrollbar-thin">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-1 transition-colors whitespace-nowrap ${activeTab === 'details' ? 'text-red-400 border-b-2 border-red-500 font-bold' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Overview
                  </button>
                  {isPhysical && (
                    <button
                      onClick={() => setActiveTab('specs')}
                      className={`pb-1 transition-colors whitespace-nowrap ${activeTab === 'specs' ? 'text-red-400 border-b-2 border-red-500 font-bold' : 'text-zinc-400 hover:text-white'}`}
                    >
                      Technical Specs
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('delivery')}
                    className={`pb-1 transition-colors whitespace-nowrap ${activeTab === 'delivery' ? 'text-red-400 border-b-2 border-red-500 font-bold' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {isPhysical ? 'Logistics & Shipping' : 'Key Vault Delivery'}
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-1 transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'text-red-400 border-b-2 border-red-500 font-bold' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Reviews ({selectedProduct.reviewCount})
                  </button>
                </div>

                <div className="mt-3 text-xs sm:text-sm text-zinc-300">
                  {activeTab === 'details' && (
                    <p className="leading-relaxed text-zinc-300">{selectedProduct.description}</p>
                  )}

                  {activeTab === 'specs' && isPhysical && selectedProduct.projectorSpecs && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#141418] border border-white/5">
                        <span className="text-zinc-400 font-mono">Resolution:</span> {selectedProduct.projectorSpecs.nativeResolution}
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#141418] border border-white/5">
                        <span className="text-zinc-400 font-mono">Brightness:</span> {selectedProduct.projectorSpecs.brightness}
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#141418] border border-white/5">
                        <span className="text-zinc-400 font-mono">Throw Ratio:</span> {selectedProduct.projectorSpecs.throwRatio}
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#141418] border border-white/5">
                        <span className="text-zinc-400 font-mono">Audio:</span> {selectedProduct.projectorSpecs.speakerSpecs}
                      </div>
                    </div>
                  )}

                  {activeTab === 'delivery' && (
                    <div className="space-y-2 text-zinc-300 leading-relaxed">
                      {isPhysical ? (
                        <p>Orders are dispatched within 24 hours from verified warehouse hubs via DHL / FedEx. Full tracking code sent via email and available in your Customer Portal.</p>
                      ) : (
                        <p>License keys and redemption guides are generated immediately upon completed checkout. You can access your keys in the instant reveal screen or anytime in your Customer Portal locker.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-3">
                      {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                        selectedProduct.reviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="p-3 rounded-lg bg-[#141418] border border-white/5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center font-bold text-[10px] border border-red-500/30">
                                  {review.author[0]}
                                </div>
                                <span className="font-bold text-white">{review.author}</span>
                                {review.verifiedPurchase && (
                                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-0.5 text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'opacity-30'}`} />
                                ))}
                              </div>
                            </div>
                            <div className="text-xs font-bold text-white mt-2">{review.title}</div>
                            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-400 text-xs">No reviews yet. Be the first to review this product.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ===========================================================
              RELATED PRODUCTS RAIL
              =========================================================== */}
          {relatedProducts.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
                  <span className="w-1 h-5 bg-red-500 rounded-full" />
                  Related Products
                </h2>
                <span className="text-xs text-zinc-500 font-mono">{relatedProducts.length} items</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} compact />
                ))}
              </div>
            </div>
          )}

          {/* ===========================================================
              RECENTLY VIEWED RAIL (only if we have history)
              =========================================================== */}
          {recentlyViewed.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded-full" />
                  Recently Viewed
                </h2>
                <span className="text-xs text-zinc-500 font-mono">{recentlyViewed.length} items</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentlyViewed.map((p) => (
                  <ProductCard key={p.id} product={p} compact />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
