import { Product, ProductType, ProductSource, ProductVariation, ImportJob, G2GSupplierConnector } from '../types.js';
import { deduplicateVariations } from './variantProtection.js';
import { buildVariationsForProduct } from './variationBuilder.js';

export interface RawImportItem {
  externalId?: string;
  title: string;
  description?: string;
  category?: string;
  costPrice: number;
  stock?: number;
  sku?: string;
  imageUrl?: string;
  productType?: 'digital' | 'physical_projector';
  source?: ProductSource;
  variations?: {
    type: string;
    value: string;
    costPrice: number;
    price?: number;
    stock: number;
  }[];
}

export interface ImportOptions {
  connector?: G2GSupplierConnector;
  markupType: 'percentage' | 'fixed';
  markupValue: number;
  autoApprove: boolean;
  defaultCategoryId?: string;
}

export function cleanTitle(raw: string): string {
  if (!raw) return 'Untitled Product';
  return raw
    .replace(/\[.*?\]|\(.*?\)/g, (match) => {
      // Remove spam brackets like [INSTANT] [FAST] [2026] but preserve legitimate specs like (4K UHD)
      if (/instant|fast|cheap|100%|trusted|legit|promo|sale|best/i.test(match)) {
        return '';
      }
      return match;
    })
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateSellingPrice(costPrice: number, markupType: 'percentage' | 'fixed', markupValue: number): number {
  if (costPrice <= 0) return 9.99;
  if (markupType === 'percentage') {
    const markupMultiplier = 1 + markupValue / 100;
    const raw = costPrice * markupMultiplier;
    // Format to psychological pricing (.99)
    return Math.max(0.99, Math.ceil(raw) - 0.01);
  } else {
    return Math.max(0.99, Number((costPrice + markupValue).toFixed(2)));
  }
}

export function processSmartProductImport(
  rawItems: RawImportItem[],
  existingCatalog: Product[],
  options: ImportOptions
): {
  importedProducts: Product[];
  importJob: ImportJob;
} {
  const importedProducts: Product[] = [];
  const logs: string[] = [];
  let duplicateCount = 0;
  let errorCount = 0;

  logs.push(`[${new Date().toISOString()}] Started smart import engine processing ${rawItems.length} records.`);
  logs.push(`Applied markup rule: ${options.markupType === 'percentage' ? `+${options.markupValue}%` : `+$${options.markupValue}`}. Auto-approve: ${options.autoApprove ? 'ENABLED' : 'DISABLED (Queued for Manual Review)'}`);

  const existingSkus = new Set(existingCatalog.map(p => p.sku.toLowerCase()));
  const existingSlugs = new Set(existingCatalog.map(p => p.slug));

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    try {
      const sanitizedTitle = cleanTitle(item.title);
      if (!sanitizedTitle) {
        logs.push(`[WARN] Skipped row #${i + 1}: Missing product title.`);
        errorCount++;
        continue;
      }

      let generatedSku = item.sku || `PB-IMP-${Date.now().toString().slice(-6)}-${i + 1}`;
      if (existingSkus.has(generatedSku.toLowerCase())) {
        duplicateCount++;
        logs.push(`[DUPLICATE DETECTED] Product SKU "${generatedSku}" already exists. Generating collision-safe SKU.`);
        generatedSku = `${generatedSku}-D${Math.floor(Math.random() * 900 + 100)}`;
      }

      let baseSlug = slugify(sanitizedTitle);
      if (existingSlugs.has(baseSlug)) {
        baseSlug = `${baseSlug}-${Math.floor(Math.random() * 9000 + 1000)}`;
      }
      existingSlugs.add(baseSlug);

      const costPrice = item.costPrice || 5.0;
      const sellingPrice = calculateSellingPrice(costPrice, options.markupType, options.markupValue);
      const comparePrice = Math.round(sellingPrice * 1.25 * 100) / 100;
      const discountPercent = Math.max(5, Math.round(((comparePrice - sellingPrice) / comparePrice) * 100));

      const productId = `imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const prodType: ProductType = item.productType || 'digital';
      const source: ProductSource = item.source || (options.connector ? 'g2g_authorized' : 'manual');

      // Map variations if present
      let rawVariations: ProductVariation[] = [];
      if (item.variations && item.variations.length > 0) {
        rawVariations = item.variations.map((v, idx) => {
          const varCost = v.costPrice || costPrice;
          const varPrice = v.price || calculateSellingPrice(varCost, options.markupType, options.markupValue);
          return {
            id: `var-${productId}-${idx + 1}`,
            type: v.type || 'Standard Option',
            value: v.value || 'Default',
            costPrice: varCost,
            price: varPrice,
            stock: v.stock || 50,
            sku: `${generatedSku}-V${idx + 1}`,
            isAvailable: true
          };
        });
      } else {
        // No variations in the import payload — auto-generate a rich
        // category-aware variations set (durations / editions / sessions)
        // instead of falling back to a single "Standard Global Access" row.
        // The product is fully constructed first so buildVariationsForProduct
        // can read its category / type / title / price / sku.
        // NOTE: categoryId/categoryName are determined later in this function,
        // so we use the same fallback ("gaming") that the function uses below.
        // The real values are then merged into the final newProduct object.
        const previewProduct: Product = {
          id: productId,
          title: sanitizedTitle,
          slug: baseSlug,
          shortDescription: '',
          description: '',
          categoryId: options.defaultCategoryId || 'gaming',
          categoryName: 'Gaming & Keys',
          productType: prodType,
          price: sellingPrice,
          compareAtPrice: comparePrice,
          costPrice,
          variations: [],
          tags: [],
          isFeatured: false,
          isTrending: false,
          isBestSeller: false,
          isLimitedTime: false,
          isFlashDeal: false,
          status: 'published',
          rating: 5.0,
          reviewCount: 0,
          reviews: [],
          stock: item.stock || 100,
          lowStockThreshold: 10,
          sku: generatedSku,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Product;

        const generated = buildVariationsForProduct(previewProduct);
        if (generated && generated.length > 0) {
          // Re-key variation IDs to use the real product ID we just generated
          rawVariations = generated.map((v, idx) => ({
            ...v,
            id: `var-${productId}-${idx + 1}`,
          }));
        } else {
          // Final fallback: 1 default variant (only reached for physical_projector
          // imports, which should not happen via CSV but just in case)
          rawVariations = [
            {
              id: `var-${productId}-default`,
              type: 'Edition / Tier',
              value: 'Standard Global Access',
              costPrice,
              price: sellingPrice,
              stock: item.stock || 100,
              sku: `${generatedSku}-STD`,
              isAvailable: true,
            },
          ];
        }
      }

      // Run duplicate variation protection
      const dedupeResult = deduplicateVariations(productId, rawVariations);
      if (dedupeResult.duplicatesFound > 0) {
        logs.push(`[VARIATION MERGE] Product "${sanitizedTitle}": ${dedupeResult.warnings.join(' | ')}`);
      }

      const totalStock = dedupeResult.cleanVariations.reduce((sum, v) => sum + v.stock, 0);

      // Determine category mapping
      let categoryId = options.defaultCategoryId || 'gaming';
      let categoryName = 'Gaming & Keys';
      if (options.connector?.categoryMappings && item.category) {
        const mapping = options.connector.categoryMappings.find(
          m => m.externalCategory.toLowerCase() === item.category?.toLowerCase()
        );
        if (mapping) {
          categoryId = mapping.localCategoryId;
        }
      }

      const newProduct: Product = {
        id: productId,
        title: sanitizedTitle,
        slug: baseSlug,
        shortDescription: item.description ? item.description.slice(0, 140) + '...' : `Instant access and verified digital delivery for ${sanitizedTitle}.`,
        description: item.description || `Official authorized digital product for ${sanitizedTitle}. Delivered automatically upon checkout with 24/7 technical support.`,
        categoryId,
        categoryName,
        productType: prodType,
        productSource: source,
        price: sellingPrice,
        compareAtPrice: comparePrice,
        costPrice,
        discountPercent,
        taxRate: 0.0,
        images: item.imageUrl ? [item.imageUrl] : ['https://images.unsplash.com/photo-1612287233215-648f5a2e5976?auto=format&fit=crop&w=800&q=80'],
        variations: dedupeResult.cleanVariations,
        instantDeliveryFormat: prodType === 'digital' ? 'license_key' : undefined,
        deliveryInstructions: prodType === 'digital' ? 'Check your order confirmation screen and email for the instant activation code.' : undefined,
        tags: [categoryName, 'Authorized Import', 'PlayBeat Digital'],
        isFeatured: false,
        isTrending: false,
        isBestSeller: false,
        isFlashDeal: false,
        status: options.autoApprove ? 'published' : 'pending_approval',
        rating: 5.0,
        reviewCount: 0,
        reviews: [],
        stock: totalStock,
        lowStockThreshold: 10,
        sku: generatedSku,
        supplierName: options.connector ? options.connector.name : 'Supplier Feed',
        seo: {
          title: `${sanitizedTitle} | PlayBeat Digital`,
          description: `Buy ${sanitizedTitle} with instant automated delivery and buyer warranty on PlayBeat Digital.`,
          keywords: [sanitizedTitle.toLowerCase(), 'buy online', 'instant delivery', 'playbeat digital']
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      importedProducts.push(newProduct);
      existingSkus.add(generatedSku.toLowerCase());
      logs.push(`[SUCCESS] Normalized & imported: "${sanitizedTitle}" -> $${sellingPrice} (SKU: ${generatedSku}, Status: ${newProduct.status})`);
    } catch (err: any) {
      errorCount++;
      logs.push(`[ERROR] Failed to process row #${i + 1}: ${err.message || String(err)}`);
    }
  }

  const importJob: ImportJob = {
    id: `job-${Date.now()}`,
    source: options.connector ? 'g2g_api' : 'csv_upload',
    status: errorCount > 0 && importedProducts.length === 0 ? 'failed' : (options.autoApprove ? 'completed' : 'pending_approval'),
    totalCount: rawItems.length,
    importedCount: importedProducts.length,
    duplicateCount,
    errorCount,
    items: importedProducts,
    logs,
    createdAt: new Date().toISOString()
  };

  return {
    importedProducts,
    importJob
  };
}
