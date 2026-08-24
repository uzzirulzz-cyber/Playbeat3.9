import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  Projector,
  Plus,
  Tv,
  Cpu,
  Truck,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Package,
  Layers,
  Edit,
  Trash2,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SmartProjectorsManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, formatPrice, addToast } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterBrand, setFilterBrand] = useState('all');

  const projectorProducts = products.filter(p => p.productType === 'physical_projector');

  const [form, setForm] = useState({
    title: '',
    brand: 'PlayBeat Vision',
    sku: 'PB-PROJ-4K-',
    price: 499.99,
    compareAtPrice: 699.99,
    stock: 25,
    resolution: '4K UHD (3840 x 2160)',
    lumens: 2800,
    androidTv: 'Android TV 11.0 Certified with Netflix',
    throwRatio: '0.23:1 Ultra Short Throw Laser',
    wifi: 'Wi-Fi 6 (802.11ax) + Bluetooth 5.2',
    warranty: '2-Year Official Manufacturer Warranty + 30-Day Zero Dead-Pixel Guarantee',
    shippingCarrier: 'DHL Express Tracked (Air Courier 2-4 Days)',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900&auto=format&fit=crop&q=80',
    description: 'Ultra-bright Cinema Grade 4K Laser Projector with built-in Harmon Kardon sound system, HDR10+, and motorized auto-keystone correction.'
  });

  const handleCreateProjector = (e: React.FormEvent) => {
    e.preventDefault();
    const newProjector: Product = {
      id: `proj-${Date.now()}`,
      title: form.title,
      slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: form.sku + Math.floor(Math.random() * 1000),
      categoryId: 'smart-projectors',
      categoryName: 'Smart Projectors 4K',
      productType: 'physical_projector',
      price: Number(form.price),
      compareAtPrice: Number(form.compareAtPrice),
      shortDescription: form.description,
      description: `${form.description}\n\nKey Specs:\n- Resolution: ${form.resolution}\n- Brightness: ${form.lumens} ANSI Lumens\n- Throw Ratio: ${form.throwRatio}\n- Shipping: ${form.shippingCarrier}`,
      discountPercent: Math.round(((Number(form.compareAtPrice) - Number(form.price)) / Number(form.compareAtPrice)) * 100),
      stock: Number(form.stock),
      lowStockThreshold: 3,
      images: [form.image],
      isFeatured: true,
      isTrending: true,
      isLimitedTime: true,
      isTrendingWeek: true,
      offerBadgeText: '4K LASER',
      offerBadgeColor: 'blue',
      totalSold: 18,
      rating: 4.95,
      reviewCount: 42,
      tags: ['Projector', '4K', 'Home Theater', 'Laser Cinema', 'Android TV', 'Smart Tech'],
      status: 'published',
      variations: [
        {
          id: `var-${Date.now()}-1`,
          type: 'Bundle',
          value: 'Standard Package (Projector + Voice Remote)',
          sku: `${form.sku}-STD`,
          price: Number(form.price),
          stock: Number(form.stock),
          costPrice: Number(form.price) * 0.65
        },
        {
          id: `var-${Date.now()}-2`,
          type: 'Bundle',
          value: 'Theater Bundle (+ 100" Anti-Light Ambient ALR Screen + Ceiling Bracket)',
          sku: `${form.sku}-BDL`,
          price: Number(form.price) + 249.99,
          stock: 12,
          costPrice: (Number(form.price) + 249.99) * 0.62
        }
      ],
      projectorSpecs: {
        nativeResolution: form.resolution,
        brightness: `${form.lumens} ANSI Lumens`,
        throwRatio: '1.2:1',
        screenSize: '40" - 200"',
        androidTvVersion: 'Android TV 11.0',
        warranty: '2 Years Official Warranty',
        shippingCarrier: form.shippingCarrier
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addProduct(newProjector);
    setIsAddModalOpen(false);
    addToast('success', 'Projector Unit Added', `${form.title} added to hardware catalog.`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#10182A] border border-[#26334A] shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#1769FF] text-xs font-mono font-bold uppercase tracking-widest mb-1">
            <Projector className="w-4 h-4" />
            <span>Hardware & Optics Inventory</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">4K Smart Projector Hardware Management</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Manage physical smart projectors, ultra-short throw laser optics, lumens specifications, courier shipping, and replacement warranties.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-xs font-bold uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add 4K Projector</span>
        </button>
      </div>

      {/* HARDWARE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectorProducts.map((proj) => {
          const totalStock = proj.variations.reduce((sum, v) => sum + v.stock, 0);
          return (
            <div
              key={proj.id}
              className="rounded-2xl bg-[#10182A] border border-[#26334A] overflow-hidden hover:border-[#1769FF]/50 transition-all flex flex-col shadow-xl"
            >
              <div className="relative h-48 bg-slate-950 overflow-hidden">
                <img
                  src={proj.images[0]}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10182A] via-transparent to-black/30" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#1769FF]/90 text-white font-mono text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-md">
                    4K LASER OPTICS
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#00D99A]/90 text-slate-950 font-mono text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-md">
                    TRACKED AIR FREIGHT
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 text-lg font-bold font-mono text-white bg-black/70 px-3 py-1 rounded-lg border border-white/10 backdrop-blur-md">
                  {formatPrice(proj.price)}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                    <span>SKU: {proj.sku}</span>
                    <span className="text-[#00D99A] font-bold">{totalStock} Units in Stock</span>
                  </div>
                  <h3 className="font-bold text-white text-base leading-snug">{proj.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">{proj.shortDescription}</p>
                </div>

                {/* Specs chips */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-[#08152F] border border-[#26334A] flex items-center gap-1.5 text-slate-300">
                    <Tv className="w-3.5 h-3.5 text-[#1769FF]" />
                    <span>Android TV 11.0 4K</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#08152F] border border-[#26334A] flex items-center gap-1.5 text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFC928]" />
                    <span>2,800 ANSI Lumens</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#08152F] border border-[#26334A] flex items-center gap-1.5 text-slate-300">
                    <Truck className="w-3.5 h-3.5 text-[#00D99A]" />
                    <span>DHL 2-4 Days Express</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#08152F] border border-[#26334A] flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1769FF]" />
                    <span>24 Months Warranty</span>
                  </div>
                </div>

                {/* Variations list */}
                <div className="space-y-1.5 pt-2 border-t border-[#26334A]">
                  <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Bundles & Packaging</div>
                  {proj.variations.map((v) => (
                    <div key={v.id} className="flex items-center justify-between text-xs p-1.5 rounded-md bg-[#08152F] text-slate-200">
                      <span className="truncate pr-2">{v.value || v.type}</span>
                      <span className="font-mono text-[#1769FF] font-bold shrink-0">{formatPrice(v.price)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-500 font-mono">Carrier: {proj.projectorSpecs?.shippingCarrier || 'DHL Express'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        updateProduct(proj.id, {
                          variations: proj.variations.map(v => ({ ...v, stock: v.stock + 5 }))
                        });
                        addToast('success', 'Stock Adjusted', 'Added +10 units to warehouse inventory.');
                      }}
                      className="px-3 py-1.5 rounded-lg btn-secondary text-xs text-slate-300 hover:text-white"
                    >
                      +10 Restock
                    </button>
                    <button
                      onClick={() => deleteProduct(proj.id)}
                      className="p-1.5 rounded-lg bg-red-950/20 text-[#FF304F] hover:bg-[#FF304F]/20 border border-[#FF304F]/30"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD PROJECTOR MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl bg-[#10182A] border border-[#26334A] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#26334A] pb-3">
                <div className="flex items-center gap-2">
                  <Projector className="w-5 h-5 text-[#1769FF]" />
                  <h3 className="font-bold text-white text-base">Add New 4K Smart Projector Hardware</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProjector} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Model / Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. PlayBeat Aurora Ultra 4K Laser Cinema Projector"
                    className="w-full bg-[#08152F] border border-[#26334A] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#1769FF]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Price (PKR / Rs)</label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className="w-full bg-[#08152F] border border-[#26334A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">MSRP / Compare (Rs)</label>
                    <input
                      type="number"
                      step="1"
                      value={form.compareAtPrice}
                      onChange={(e) => setForm({ ...form, compareAtPrice: Number(e.target.value) })}
                      className="w-full bg-[#08152F] border border-[#26334A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Initial Stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                      className="w-full bg-[#08152F] border border-[#26334A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">ANSI Lumens</label>
                    <input
                      type="number"
                      value={form.lumens}
                      onChange={(e) => setForm({ ...form, lumens: Number(e.target.value) })}
                      className="w-full bg-[#08152F] border border-[#26334A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">OS / Smart Platform</label>
                    <input
                      type="text"
                      value={form.androidTv}
                      onChange={(e) => setForm({ ...form, androidTv: e.target.value })}
                      className="w-full bg-[#08152F] border border-[#26334A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Image URL</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full bg-[#08152F] border border-[#26334A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#26334A]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl btn-secondary text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl btn-primary text-xs font-bold uppercase tracking-wider"
                  >
                    Save Projector to Inventory
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
