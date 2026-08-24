// Quick smoke test for variationBuilder — no DB, just logic
import { buildVariationsForProduct, needsVariationMigration } from '../src/utils/variationBuilder';
import type { Product } from '../src/types';

const samples: Product[] = [
  {
    id: 'imp-001', title: 'Netflix Premium 4K', slug: 'netflix-premium',
    shortDescription: '', description: '',
    categoryId: 'streaming', categoryName: 'Streaming Services',
    productType: 'digital', price: 9.99, compareAtPrice: 12.99, costPrice: 4.5,
    discountPercent: 23, images: [], variations: [],
    tags: [], isFeatured: false, isTrending: false, isBestSeller: false,
    isLimitedTime: false, isFlashDeal: false, status: 'published',
    rating: 5, reviewCount: 0, reviews: [], stock: 0, lowStockThreshold: 5,
    sku: 'NFLX', createdAt: '', updatedAt: '',
  },
  {
    id: 'imp-002', title: 'Windows 11 Pro OEM', slug: 'win11-pro',
    shortDescription: '', description: '',
    categoryId: 'software', categoryName: 'Software & OS',
    productType: 'digital', price: 19.99, compareAtPrice: 39.99, costPrice: 8,
    discountPercent: 50, images: [], variations: [],
    tags: [], isFeatured: false, isTrending: false, isBestSeller: false,
    isLimitedTime: false, isFlashDeal: false, status: 'published',
    rating: 5, reviewCount: 0, reviews: [], stock: 0, lowStockThreshold: 5,
    sku: 'WIN11', createdAt: '', updatedAt: '',
  },
  {
    id: 'imp-003', title: 'Steam Gift Card $50', slug: 'steam-gift',
    shortDescription: '', description: '',
    categoryId: 'gaming', categoryName: 'Gaming & Keys',
    productType: 'digital', price: 49.99, compareAtPrice: 59.99, costPrice: 35,
    discountPercent: 17, images: [], variations: [],
    tags: [], isFeatured: false, isTrending: false, isBestSeller: false,
    isLimitedTime: false, isFlashDeal: false, status: 'published',
    rating: 5, reviewCount: 0, reviews: [], stock: 0, lowStockThreshold: 5,
    sku: 'STM50', createdAt: '', updatedAt: '',
  },
  {
    id: 'imp-004', title: 'ChatGPT Team', slug: 'chatgpt-team',
    shortDescription: '', description: '',
    categoryId: 'saas-tools', categoryName: 'SaaS Tools',
    productType: 'digital', price: 25.0, compareAtPrice: 35.0, costPrice: 12,
    discountPercent: 29, images: [], variations: [],
    tags: [], isFeatured: false, isTrending: false, isBestSeller: false,
    isLimitedTime: false, isFlashDeal: false, status: 'published',
    rating: 5, reviewCount: 0, reviews: [], stock: 0, lowStockThreshold: 5,
    sku: 'GPT', createdAt: '', updatedAt: '',
  },
  {
    id: 'imp-005', title: 'Rocket League Coaching', slug: 'rl-coach',
    shortDescription: '', description: '',
    categoryId: 'game-coaching', categoryName: 'Game Coaching & Sessions',
    productType: 'digital', price: 30.0, compareAtPrice: 50.0, costPrice: 15,
    discountPercent: 40, images: [], variations: [],
    tags: [], isFeatured: false, isTrending: false, isBestSeller: false,
    isLimitedTime: false, isFlashDeal: false, status: 'published',
    rating: 5, reviewCount: 0, reviews: [], stock: 0, lowStockThreshold: 5,
    sku: 'RL', createdAt: '', updatedAt: '',
  },
  {
    id: 'imp-006', title: 'Premium IPTV 4K', slug: 'iptv-4k',
    shortDescription: '', description: '',
    categoryId: 'iptv', categoryName: 'IPTV Subscriptions',
    productType: 'digital', price: 12.99, compareAtPrice: 19.99, costPrice: 6,
    discountPercent: 35, images: [], variations: [],
    tags: [], isFeatured: false, isTrending: false, isBestSeller: false,
    isLimitedTime: false, isFlashDeal: false, status: 'published',
    rating: 5, reviewCount: 0, reviews: [], stock: 0, lowStockThreshold: 5,
    sku: 'IPTV', createdAt: '', updatedAt: '',
  },
  {
    id: 'proj-001', title: 'Magcubic HY300 PRO', slug: 'hy300-pro',
    shortDescription: '', description: '',
    categoryId: 'smart-projectors', categoryName: 'Smart Projectors',
    productType: 'physical_projector', price: 30500, compareAtPrice: 38500, costPrice: 22500,
    discountPercent: 21, images: [], variations: [
      { id: 'var-1', type: 'Bundle', value: 'Standard', price: 30500, costPrice: 22500, stock: 5, sku: 'P1', isAvailable: true }
    ],
    tags: [], isFeatured: false, isTrending: false, isBestSeller: false,
    isLimitedTime: false, isFlashDeal: false, status: 'published',
    rating: 5, reviewCount: 0, reviews: [], stock: 5, lowStockThreshold: 5,
    sku: 'PROJ', createdAt: '', updatedAt: '',
  },
  {
    id: 'imp-007', title: 'Already Migrated Game',
    slug: 'migrated', shortDescription: '', description: '',
    categoryId: 'gaming', categoryName: 'Gaming & Keys',
    productType: 'digital', price: 19.99, compareAtPrice: 29.99, costPrice: 10,
    discountPercent: 33, images: [], variations: [
      { id: 'v1', type: 'Edition', value: 'Standard Edition', price: 19.99, costPrice: 10, stock: 50, sku: 'G1', isAvailable: true },
      { id: 'v2', type: 'Edition', value: 'Deluxe Edition', price: 27.99, costPrice: 13, stock: 50, sku: 'G2', isAvailable: true },
    ],
    tags: [], isFeatured: false, isTrending: false, isBestSeller: false,
    isLimitedTime: false, isFlashDeal: false, status: 'published',
    rating: 5, reviewCount: 0, reviews: [], stock: 100, lowStockThreshold: 5,
    sku: 'GMIG', createdAt: '', updatedAt: '',
  },
];

console.log('=== Variation Builder Smoke Test ===\n');
for (const p of samples) {
  const needs = needsVariationMigration(p);
  const vars = buildVariationsForProduct(p);
  console.log(`Product: ${p.title}`);
  console.log(`  Category: ${p.categoryId} | Type: ${p.productType}`);
  console.log(`  needsMigration: ${needs}`);
  console.log(`  variations built: ${vars?.length ?? 0}`);
  if (vars && vars.length > 0) {
    for (const v of vars) {
      console.log(`    - [${v.type}] ${v.value}  →  $${v.price}  (cost $${v.costPrice})  stock=${v.stock}  sku=${v.sku}`);
    }
  }
  console.log('');
}
