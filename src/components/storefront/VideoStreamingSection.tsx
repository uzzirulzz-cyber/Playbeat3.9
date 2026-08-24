import React from 'react';
import { BadgeCheck, Film, ShieldCheck } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import { VIDEO_STREAMING_INVENTORY } from '../../data/videoStreamingInventory';

export const VideoStreamingSection: React.FC = () => (
  <section id="video-streaming-section" className="w-full py-12 lg:py-16 bg-[var(--pb-charcoal)] border-b border-[var(--pb-line)]">
    <div className="pb-container space-y-6">
      <div className="pb-section-header !mb-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-3 border-b border-[var(--pb-line)]">
        <div>
          <span className="pb-eyebrow"><Film className="w-3 h-3" /> PlayBeat Inventory</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Verified Video Streaming</h2>
          <p className="text-[var(--pb-silver-3)] text-sm mt-1">Verified streaming products with transparent PlayBeat pricing.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-emerald-400">
          <ShieldCheck className="w-4 h-4" /> Verified inventory only
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-300">
        <BadgeCheck className="w-4 h-4 shrink-0" />
        <span>Every displayed price includes the PlayBeat 35% inventory markup. No offers or sale pricing are shown.</span>
      </div>

      <ProductGrid products={VIDEO_STREAMING_INVENTORY} />
    </div>
  </section>
);
