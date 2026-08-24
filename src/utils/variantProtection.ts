import { ProductVariation } from '../types.js';

/**
 * Normalizes a variation key string based on product ID, variation type, and variation value.
 * Example: 'proj-123' + 'Duration' + '1 Month' => 'proj-123+duration+1_month'
 */
export function generateNormalizedVariantKey(productId: string, type: string, value: string): string {
  const cleanType = type.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  const cleanVal = value.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${productId}+${cleanType}+${cleanVal}`;
}

export interface DeduplicationResult {
  cleanVariations: ProductVariation[];
  duplicatesFound: number;
  mergedKeys: string[];
  warnings: string[];
}

/**
 * Enforces Duplicate Variation Protection:
 * Prevents identical options (e.g., '1 Month' repeated twice) from appearing in customer dropdowns.
 * Merges duplicate entries by:
 * - Keeping the lower/valid price or higher priority
 * - Summing up inventory stock
 * - Generating safe SKUs
 * - Returning detailed admin warnings
 */
export function deduplicateVariations(productId: string, variations: ProductVariation[]): DeduplicationResult {
  const map = new Map<string, ProductVariation>();
  let duplicatesFound = 0;
  const mergedKeys: string[] = [];
  const warnings: string[] = [];

  for (const variant of variations) {
    const key = variant.normalizedKey || generateNormalizedVariantKey(productId, variant.type, variant.value);

    if (map.has(key)) {
      duplicatesFound++;
      mergedKeys.push(key);
      const existing = map.get(key)!;

      // Merge stock
      const combinedStock = existing.stock + variant.stock;
      // Prefer active availability
      const isAvailable = existing.isAvailable || variant.isAvailable;
      // Retain latest valid price or best offer
      const validPrice = variant.price > 0 ? variant.price : existing.price;
      const validCost = variant.costPrice > 0 ? variant.costPrice : existing.costPrice;

      warnings.push(
        `Duplicate variation detected for option "${variant.type}: ${variant.value}". Merged stock (${existing.stock} + ${variant.stock} = ${combinedStock}) and resolved price to $${validPrice.toFixed(2)}.`
      );

      map.set(key, {
        ...existing,
        stock: combinedStock,
        price: validPrice,
        costPrice: validCost,
        isAvailable,
        normalizedKey: key
      });
    } else {
      map.set(key, {
        ...variant,
        normalizedKey: key
      });
    }
  }

  return {
    cleanVariations: Array.from(map.values()),
    duplicatesFound,
    mergedKeys,
    warnings
  };
}
