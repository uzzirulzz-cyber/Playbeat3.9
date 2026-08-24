import type { Product } from '../types';

/**
 * PlayBeat-owned streaming inventory.
 * Selling price is always calculated as buying price + 35%.
 * These products intentionally have no offers, sale badges, or compare-at discounts.
 */
const inventory = [
  { id: 'pb-stream-netflix-premium', title: 'Netflix Premium 4K UHD', buy: 1200, description: 'Premium 4K streaming access with verified instant delivery.', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=900&q=80' },
  { id: 'pb-stream-spotify-premium', title: 'Spotify Premium Individual', buy: 650, description: 'Ad-free music, offline listening, and verified account delivery.', image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?auto=format&fit=crop&w=900&q=80' },
  { id: 'pb-stream-disney-plus', title: 'Disney+ Premium Streaming', buy: 900, description: 'Verified access to Disney, Pixar, Marvel, Star Wars, and more.', image: 'https://images.unsplash.com/photo-1602067340377-8e5c5c8b6c2a?auto=format&fit=crop&w=900&q=80' },
  { id: 'pb-stream-youtube-premium', title: 'YouTube Premium', buy: 800, description: 'Ad-free video, background play, and YouTube Music access.', image: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=80' },
  { id: 'pb-stream-crunchyroll-mega', title: 'Crunchyroll Mega Fan', buy: 700, description: 'Verified anime streaming with offline viewing and premium access.', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=80' },
  { id: 'pb-stream-amazon-prime', title: 'Amazon Prime Video', buy: 950, description: 'Verified Prime Video access for movies, series, and originals.', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80' },
] as const;

export const VIDEO_STREAMING_INVENTORY: Product[] = inventory.map((item) => {
  const sellingPrice = Math.round(item.buy * 1.35);
  return {
    id: item.id,
    title: item.title,
    slug: item.id,
    shortDescription: item.description,
    description: item.description,
    categoryId: 'streaming',
    categoryName: 'Video Streaming',
    subcategory: 'Verified PlayBeat Inventory',
    productType: 'digital',
    productSource: 'internal',
    price: sellingPrice,
    compareAtPrice: sellingPrice,
    costPrice: item.buy,
    discountPercent: 0,
    images: [item.image],
    variations: [],
    instantDeliveryFormat: 'account_credentials',
    deliveryInstructions: 'Verified PlayBeat digital delivery instructions are provided after checkout.',
    tags: ['video streaming', 'verified inventory', 'playbeat digital'],
    isFeatured: false,
    isTrending: false,
    isTrendingWeek: false,
    isBestSeller: false,
    isFlashDeal: false,
    isLimitedTime: false,
    rating: 5,
    reviewCount: 0,
    stock: 100,
    lowStockThreshold: 10,
    sku: `PB-STREAM-${item.id.replace('pb-stream-', '').toUpperCase()}`,
    status: 'published',
    createdAt: '2026-08-23T00:00:00.000Z',
    updatedAt: '2026-08-23T00:00:00.000Z',
  };
});
