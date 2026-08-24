import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Heart, ShoppingCart, Trash2, Zap, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    products,
    toggleWishlist,
    addToCart,
    formatPrice,
    setSelectedProduct
  } = useStore();

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsWishlistOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-[#0F111A] border-l border-white/10 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#12141D]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white font-display">Saved Wishlist</h2>
                    <p className="text-xs text-neutral-400 font-mono">{wishlistProducts.length} saved products</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {wishlistProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
                      <Heart className="w-8 h-8" />
                    </div>
                    <div className="text-base font-bold text-white font-display">No saved products yet</div>
                    <p className="text-xs text-neutral-400 max-w-xs">
                      Click the heart icon on any digital product or smart projector to save it for later.
                    </p>
                  </div>
                ) : (
                  wishlistProducts.map((p) => {
                    const isPhysical = p.productType === 'physical_projector';
                    return (
                      <div
                        key={p.id}
                        className="flex gap-3.5 p-3 rounded-xl bg-[#141622] border border-white/5 group hover:border-red-500/20 transition-all"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-16 h-16 rounded-lg object-cover bg-neutral-900 shrink-0 cursor-pointer"
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsWishlistOpen(false);
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <div
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsWishlistOpen(false);
                            }}
                            className="text-xs font-semibold text-white leading-tight truncate hover:text-red-400 cursor-pointer transition-colors"
                          >
                            {p.title}
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            {isPhysical ? (
                              <span className="text-[10px] text-red-400 flex items-center gap-1 font-mono">
                                <Truck className="w-2.5 h-2.5" /> Physical Projector
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                                <Zap className="w-2.5 h-2.5" /> Instant Delivery
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs font-bold text-white font-mono">{formatPrice(p.price)}</div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => addToCart(p)}
                                className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                Add
                              </button>

                              <button
                                onClick={() => toggleWishlist(p.id)}
                                className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
                                aria-label="Remove from wishlist"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
