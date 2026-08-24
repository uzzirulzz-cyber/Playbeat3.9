import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Zap,
  Truck,
  Tag,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    formatPrice,
    setIsCheckoutOpen,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      setCouponError('Please enter a promo code.');
      return;
    }
    setCouponError('');
    const res = applyCoupon(couponInput.trim());
    if (res.success) {
      setCouponInput('');
    } else {
      setCouponError(res.message || 'Invalid promo code.');
    }
  };

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? (cartSubtotal * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;

  const estimatedTax = Number((cartSubtotal * 0.05).toFixed(2));
  const finalTotal = Math.max(0, Number((cartSubtotal - discountAmount + estimatedTax).toFixed(2)));

  const hasPhysicalProjector = cart.some(i => i.product.productType === 'physical_projector');
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalSavings = cart.reduce((sum, i) => {
    const compareAt = i.product.compareAtPrice || 0;
    const unitPrice = i.variation ? i.variation.price : i.product.price;
    if (compareAt > unitPrice) return sum + (compareAt - unitPrice) * i.quantity;
    return sum;
  }, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Slide-over Panel — full-width on mobile, max-w-md on desktop */}
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-[#0F111A] border-l border-white/10 shadow-2xl flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Shopping cart"
            >
              {/* Top Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#12141D]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white font-display">Your Cart</h2>
                    <p className="text-xs text-neutral-400 font-mono">
                      {cart.length} {cart.length === 1 ? 'unique item' : 'unique items'} · {totalItems} {totalItems === 1 ? 'unit' : 'units'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-thin">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                      <ShoppingBag className="w-9 h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-base font-bold text-white font-display">Your cart is empty</div>
                      <p className="text-xs text-neutral-400 max-w-xs">
                        Explore our 4K Smart Projectors, game CD keys, IPTV, and lifetime software licenses.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold font-display transition-colors flex items-center gap-2 shadow-md shadow-red-600/30"
                    >
                      <span>Start Shopping</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  cart.map((item) => {
                    const unitPrice = item.variation ? item.variation.price : item.product.price;
                    const itemTotal = unitPrice * item.quantity;
                    const isPhysical = item.product.productType === 'physical_projector';
                    const stock = item.variation ? item.variation.stock : item.product.stock;
                    const isLowStock = stock > 0 && item.quantity >= stock;
                    const isOutOfStock = stock <= 0;

                    return (
                      <div
                        key={`${item.productId}-${item.variation?.id || 'default'}`}
                        className="flex gap-3 p-3 rounded-xl bg-[#141622] border border-white/5 hover:border-red-500/20 transition-all"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          loading="lazy"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover bg-neutral-900 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white leading-tight line-clamp-2">
                            {item.product.title}
                          </div>

                          {item.variation && (
                            <div className="text-[11px] text-neutral-400 font-mono mt-1">
                              {item.variation.type}: <span className="text-neutral-200">{item.variation.value}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {isPhysical ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                <Truck className="w-2.5 h-2.5" /> Tracked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                <Zap className="w-2.5 h-2.5" /> Instant
                              </span>
                            )}
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {formatPrice(unitPrice)} each
                            </span>
                          </div>

                          {/* Stock warning if cart qty is at or above stock */}
                          {isLowStock && !isOutOfStock && (
                            <div className="mt-1.5 text-[10px] text-amber-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Only {stock} in stock — you've reserved them all.
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2.5 gap-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-black/40 rounded-lg border border-white/10">
                              <button
                                onClick={() => updateCartQuantity(item.productId, item.variation?.id, item.quantity - 1)}
                                className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-mono text-white font-medium min-w-[2ch] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  if (stock > 0 && item.quantity >= stock) {
                                    return;
                                  }
                                  updateCartQuantity(item.productId, item.variation?.id, item.quantity + 1);
                                }}
                                disabled={stock > 0 && item.quantity >= stock}
                                className="p-1.5 text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="text-xs font-bold text-white font-mono">{formatPrice(itemTotal)}</div>
                              {item.quantity > 1 && (
                                <div className="text-[10px] text-neutral-400 font-mono">{formatPrice(unitPrice)} ea</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId, item.variation?.id)}
                          className="text-neutral-400 hover:text-red-400 p-1 self-start transition-colors"
                          aria-label={`Remove ${item.product.title} from cart`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Checkout Controls */}
              {cart.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-white/10 bg-[#12141D] space-y-3.5">
                  {/* Coupon Bar */}
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-600/10 border border-red-500/30 text-xs">
                      <div className="flex items-center gap-1.5 text-red-400">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="font-mono font-bold">{appliedCoupon.code}</span>
                        <span className="text-neutral-400">
                          (-{appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : formatPrice(appliedCoupon.discountValue)})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          removeCoupon();
                          setCouponError('');
                        }}
                        className="text-neutral-400 hover:text-white text-xs underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-1">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Promo code (e.g. PLAYBEAT15)"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            if (couponError) setCouponError('');
                          }}
                          className="input-sharp flex-1 px-3 py-2 text-xs text-white placeholder-neutral-500 uppercase font-mono"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold font-display transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[10px] text-red-400 flex items-center gap-1 pl-1">
                          <AlertCircle className="w-3 h-3" /> {couponError}
                        </p>
                      )}
                    </form>
                  )}

                  {/* Savings highlight */}
                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> You're saving
                      </span>
                      <span className="font-bold">{formatPrice(totalSavings)}</span>
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>Subtotal</span>
                      <span className="font-mono text-neutral-200">{formatPrice(cartSubtotal)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>Discount</span>
                        <span className="font-mono">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-neutral-400">
                      <span>Estimated Tax (5%)</span>
                      <span className="font-mono text-neutral-200">{formatPrice(estimatedTax)}</span>
                    </div>

                    <div className="flex justify-between text-neutral-400">
                      <span>Delivery / Shipping</span>
                      <span className="text-emerald-400 font-medium">FREE GLOBAL</span>
                    </div>

                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                      <span className="font-display">Total</span>
                      <span className="font-mono text-base text-red-400">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="btn-glossy btn-glossy-yellow w-full flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 text-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>256-Bit Encrypted · Instant Key / Tracked Delivery</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
