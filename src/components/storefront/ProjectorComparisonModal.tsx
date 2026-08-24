import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Scale,
  Check,
  Zap,
  Truck,
  ShoppingCart,
  Plus,
  Trash2,
  Maximize2,
  Tv,
  Volume2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProjectorComparisonModal: React.FC = () => {
  const {
    isCompareModalOpen,
    setIsCompareModalOpen,
    compareList,
    toggleCompare,
    products,
    formatPrice,
    addToCart,
    setIsCheckoutOpen
  } = useStore();

  const allProjectors = products.filter(p => p.productType === 'physical_projector');

  return (
    <AnimatePresence>
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCompareModalOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-6xl rounded-3xl bg-[#0F111A] border border-white/10 shadow-2xl p-6 sm:p-8 z-10 my-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-display">
                    Smart Projector Side-by-Side Comparison
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Compare technical optics, ANSI lumen brightness, throw ratios, and audio architectures.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Projector Selector Bar */}
            <div className="py-4 border-b border-white/5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-neutral-400">Add to comparison:</span>
              {allProjectors.map((p) => {
                const isSelected = compareList.some(item => item.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleCompare(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{p.title.split(' ')[0]} {p.title.split(' ')[1]}</span>
                  </button>
                );
              })}
            </div>

            {/* Comparison Matrix Table */}
            {compareList.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-neutral-400 text-sm">Select at least one projector model to compare specifications.</p>
                <button
                  onClick={() => toggleCompare(allProjectors[0])}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold font-display"
                >
                  Add Flagship 4K Model
                </button>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-3 text-xs font-mono text-neutral-400 uppercase w-48">Spec Feature</th>
                      {compareList.map((p) => (
                        <th key={p.id} className="p-3 text-center w-72">
                          <div className="relative group">
                            <button
                              onClick={() => toggleCompare(p)}
                              className="absolute top-0 right-0 p-1 rounded-full bg-black/60 text-neutral-400 hover:text-red-400"
                              title="Remove from comparison"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <img src={p.images[0]} alt={p.title} className="w-24 h-24 rounded-xl object-cover mx-auto bg-neutral-900 mb-2 border border-white/10" />
                            <div className="text-xs font-bold text-white font-display line-clamp-1">{p.title}</div>
                            <div className="text-sm font-black text-red-400 font-mono mt-1">{formatPrice(p.price)}</div>
                            <button
                              onClick={() => {
                                addToCart(p, p.variations[0], 1);
                                setIsCompareModalOpen(false);
                                setIsCheckoutOpen(true);
                              }}
                              className="mt-2 w-full py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              Order Now
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-white/5">
                    {/* Resolution */}
                    <tr>
                      <td className="p-3 text-neutral-400 font-mono flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-red-400" /> Resolution
                      </td>
                      {compareList.map(p => (
                        <td key={p.id} className="p-3 text-center text-white font-semibold">
                          {p.projectorSpecs?.nativeResolution || '4K UHD (3840x2160)'}
                        </td>
                      ))}
                    </tr>

                    {/* Brightness */}
                    <tr className="bg-white/[0.01]">
                      <td className="p-3 text-neutral-400 font-mono flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" /> Brightness (ANSI)
                      </td>
                      {compareList.map(p => (
                        <td key={p.id} className="p-3 text-center text-amber-400 font-bold font-mono">
                          {p.projectorSpecs?.brightness || '2800 ANSI Lumens'}
                        </td>
                      ))}
                    </tr>

                    {/* Throw Ratio & Max Screen */}
                    <tr>
                      <td className="p-3 text-neutral-400 font-mono">Throw Ratio & Screen</td>
                      {compareList.map(p => (
                        <td key={p.id} className="p-3 text-center text-neutral-200">
                          {p.projectorSpecs?.throwRatio || '0.23:1 UST'} (Up to {p.projectorSpecs?.screenSize || '150"'})
                        </td>
                      ))}
                    </tr>

                    {/* OS & Smart Platform */}
                    <tr className="bg-white/[0.01]">
                      <td className="p-3 text-neutral-400 font-mono flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-blue-400" /> OS & Interface
                      </td>
                      {compareList.map(p => (
                        <td key={p.id} className="p-3 text-center text-neutral-200">
                          {p.projectorSpecs?.operatingSystem || 'Google TV 11.0'}
                        </td>
                      ))}
                    </tr>

                    {/* RAM / Storage */}
                    <tr>
                      <td className="p-3 text-neutral-400 font-mono flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-400" /> RAM / Storage
                      </td>
                      {compareList.map(p => (
                        <td key={p.id} className="p-3 text-center text-neutral-200 font-mono">
                          {p.projectorSpecs?.ram || '4GB'} RAM / {p.projectorSpecs?.storage || '64GB'} eMMC
                        </td>
                      ))}
                    </tr>

                    {/* Audio Specs */}
                    <tr className="bg-white/[0.01]">
                      <td className="p-3 text-neutral-400 font-mono flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Sound System
                      </td>
                      {compareList.map(p => (
                        <td key={p.id} className="p-3 text-center text-neutral-200">
                          {p.projectorSpecs?.speakerSpecs || '30W Harman Kardon Dolby'}
                        </td>
                      ))}
                    </tr>

                    {/* Keystone & Focus */}
                    <tr>
                      <td className="p-3 text-neutral-400 font-mono">Auto-Calibration</td>
                      {compareList.map(p => (
                        <td key={p.id} className="p-3 text-center text-emerald-400 font-medium">
                          {p.projectorSpecs?.keystoneCorrection || 'Omnidirectional ToF Laser'}
                        </td>
                      ))}
                    </tr>

                    {/* Warranty & Logistics */}
                    <tr className="bg-white/[0.01]">
                      <td className="p-3 text-neutral-400 font-mono flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-red-400" /> Shipping & Warranty
                      </td>
                      {compareList.map(p => (
                        <td key={p.id} className="p-3 text-center text-neutral-300">
                          {p.projectorSpecs?.shippingInfo || 'Free DHL Tracked Express'} ({p.projectorSpecs?.warranty || '3-Year Warranty'})
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
