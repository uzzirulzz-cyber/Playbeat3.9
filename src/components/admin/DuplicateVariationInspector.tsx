import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, AlertTriangle, Trash2, CheckCircle2, Sparkles, Layers, Eye } from 'lucide-react';

export const DuplicateVariationInspector: React.FC = () => {
  const { products, cleanAllProductVariations, addToast } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Find products that have duplicate variations — using the same key derivation
  // as the smartImportEngine and variantProtection utility (type+value, normalized).
  const productsWithDuplicates = products.filter((p) => {
    if (!p.variations || p.variations.length <= 1) return false;
    const seen = new Set<string>();
    for (const v of p.variations) {
      const key = `${v.type?.toLowerCase().trim()}_${v.value?.toLowerCase().trim()}`;
      if (seen.has(key)) return true;
      seen.add(key);
    }
    return false;
  });

  const handleCleanAll = () => {
    if (productsWithDuplicates.length === 0) {
      addToast('info', 'Nothing to Clean', 'No duplicate variations were found.');
      return;
    }
    if (!window.confirm(`This will run deduplication on ${productsWithDuplicates.length} product(s). Continue?`)) return;
    cleanAllProductVariations();
    addToast('success', 'Deduplication Complete', 'All duplicate product variations have been cleanly unified.');
  };

  return (
    <div className="space-y-6 pb-fade-up">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl pb-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--pb-red-soft)] text-[var(--pb-red-bright)] border border-[var(--pb-red-line)] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="pb-eyebrow">
                <Layers className="w-3 h-3" />
                Duplicate Variation Protection Engine
              </span>
              <span className="pb-status pb-status-published">Active Monitor</span>
            </div>
            <p className="text-xs text-[var(--pb-silver-3)] max-w-xl mt-2 leading-relaxed">
              Prevents duplicate SKU entries, identical package tiers, and messy option dropdowns resulting from bulk G2G, CSV, or supplier API feeds. Detects variations that share the same <code className="text-[var(--pb-red-bright)] font-mono">type + value</code> pair.
            </p>
          </div>
        </div>

        <button
          onClick={handleCleanAll}
          disabled={productsWithDuplicates.length === 0}
          className="pb-btn pb-btn-primary pb-btn-sm shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Execute Auto-Deduplication ({productsWithDuplicates.length})</span>
        </button>
      </div>

      {/* Audit Results */}
      <div className="p-6 rounded-2xl pb-panel space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--pb-line)]">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Variation Integrity Audit Log
          </span>
          <span className="text-xs font-mono text-[var(--pb-silver-3)]">
            <span className="text-white font-bold">{products.length}</span> Scanned ·{' '}
            <span className={productsWithDuplicates.length > 0 ? 'text-[var(--pb-amber)] font-bold' : 'text-[var(--pb-emerald)] font-bold'}>
              {productsWithDuplicates.length}
            </span>{' '}
            Issues
          </span>
        </div>

        {productsWithDuplicates.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--pb-emerald)]/10 border border-[var(--pb-emerald)]/30 text-[var(--pb-emerald)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-white font-display">Zero Duplicate Variations Detected</div>
            <p className="text-xs text-[var(--pb-silver-3)] max-w-md mx-auto">
              All digital keys, subscriptions, and projector models are verified clean and deduplicated.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {productsWithDuplicates.map((p) => {
              // Identify which variants are duplicates (for the expanded view)
              const seenKeys = new Map<string, number>();
              const dupIdx = new Set<number>();
              p.variations?.forEach((v, i) => {
                const key = `${v.type?.toLowerCase().trim()}_${v.value?.toLowerCase().trim()}`;
                if (seenKeys.has(key)) {
                  dupIdx.add(i);
                  dupIdx.add(seenKeys.get(key)!);
                } else {
                  seenKeys.set(key, i);
                }
              });

              const isExpanded = expandedId === p.id;

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-[var(--pb-ink)] border border-[var(--pb-amber)]/30"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white font-display truncate">{p.title}</div>
                      <div className="text-[11px] text-[var(--pb-amber)] font-mono mt-0.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>
                          Contains {dupIdx.size} duplicate variations ({p.variations?.length} total)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className="pb-btn pb-btn-ghost pb-btn-sm"
                        aria-label={isExpanded ? 'Hide details' : 'Show details'}
                      >
                        <Eye className="w-3 h-3" />
                        <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                      </button>
                      <button
                        onClick={handleCleanAll}
                        className="pb-btn pb-btn-primary pb-btn-sm"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Fix</span>
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[var(--pb-line)] space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--pb-silver-3)] mb-2">
                        Variations (highlighted = duplicates):
                      </div>
                      {p.variations?.map((v, i) => (
                        <div
                          key={v.id || i}
                          className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md text-xs font-mono ${
                            dupIdx.has(i)
                              ? 'bg-[var(--pb-red-soft)] border border-[var(--pb-red-line)] text-white'
                              : 'bg-[var(--pb-charcoal-3)] border border-[var(--pb-line)] text-[var(--pb-silver-2)]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-[var(--pb-silver-4)] shrink-0">{i + 1}.</span>
                            <span className="text-white shrink-0">{v.type}:</span>
                            <span className="truncate">{v.value}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[var(--pb-silver-3)]">${v.price.toFixed(2)}</span>
                            <span className="text-[var(--pb-silver-4)]">stock: {v.stock}</span>
                            {dupIdx.has(i) && (
                              <AlertTriangle className="w-3 h-3 text-[var(--pb-red-bright)]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
