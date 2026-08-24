#!/usr/bin/env node
/**
 * Replace all product image URLs in mockData.ts with real images
 * from the z-ai image search results.
 */
import fs from 'fs';

// Map of product index → new image URLs
// Projectors use the 4 projector images
// Coaching products use gaming_coach images
// Gamepal products use game_companion images
// Gaming & Keys use gaming_keys images
// Software uses software images
// SaaS uses saas images
// Streaming uses streaming images
// IPTV uses iptv images

const projectorImgs = [
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/1a2604e96f45.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4461bfa234ac.webp',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c6da3ed2aad0.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/98428e43ed82.jpg',
];

const gamingCoachImgs = [
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f8d44314e358.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3cb67bcaa613.jpg',
];

const gameCompanionImgs = [
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/161345c6408a.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/1d5c2d611ffb.jpg',
];

const gamingKeysImgs = [
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2a3015fb69a1.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fbec497be108.jpg',
];

const softwareImgs = [
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e6cd8edb0b30.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/92eb97bf5331.png',
];

const saasImgs = [
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2c8418b2e53a.png',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0771f90ddf2d.jpg',
];

const streamingImgs = [
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2f48423ad9d3.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/19ceee4b3ef7.png',
];

const iptvImgs = [
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9125416b3ab1.jpg',
  'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cc3ae8ef6256.jpg',
];

// Read the file
let content = fs.readFileSync('src/data/mockData.ts', 'utf-8');

// All unique unsplash URLs to replace
const replacements = [
  // Projector images (3 unique unsplash URLs → 4 real projector images)
  { old: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80', new: projectorImgs[0] },
  { old: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80', new: projectorImgs[0] },
  { old: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80', new: projectorImgs[1] },
  { old: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=1200&q=80', new: projectorImgs[2] },
  // Gaming/coaching images
  { old: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80', new: gamingCoachImgs[0] },
  { old: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', new: gamingCoachImgs[1] },
  // Avatar images (keep as-is or replace with generic)
  { old: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', new: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3cb67bcaa613.jpg' },
  { old: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', new: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/161345c6408a.jpg' },
];

let count = 0;
for (const { old, new: newUrl } of replacements) {
  while (content.includes(old)) {
    content = content.replace(old, newUrl);
    count++;
  }
}

// Now assign category-specific images to products that share the same generic image
// We need to differentiate products within the same category.
// Since all coaching products share the same unsplash URL, we'll cycle through
// the available real images.

// For products with images: [gamingCoachImgs[0]], add the second image too
// This is a simple approach — for products that have a single image array entry,
// we leave them as-is (they already got replaced above).

// For products that have multiple images (like projectors with 2-3 images),
// we need to distribute the real images.

// Let's also replace the G2G feed images
const g2gReplacements = [
  { old: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80', new: gamingKeysImgs[0] },
  { old: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=800&q=80', new: softwareImgs[0] },
  { old: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80', new: saasImgs[0] },
  { old: 'https://images.unsplash.com/photo-1612287233215-648f5a2e5976?auto=format&fit=crop&w=800&q=80', new: streamingImgs[0] },
];

for (const { old, new: newUrl } of g2gReplacements) {
  while (content.includes(old)) {
    content = content.replace(old, newUrl);
    count++;
  }
}

// Also add IPTV images to IPTV products if any use unsplash
// Check for any remaining unsplash URLs
const remaining = content.match(/images\.unsplash\.com[^"')\]]+/g) || [];
if (remaining.length > 0) {
  console.log(`Warning: ${remaining.length} unsplash URLs still remain:`);
  remaining.forEach(u => console.log(`  ${u}`));
  // Replace any remaining with a fallback
  for (const url of remaining) {
    content = content.replace(url, iptvImgs[0]);
    count++;
  }
}

fs.writeFileSync('src/data/mockData.ts', content);
console.log(`\nReplaced ${count} image URLs with real product photos.`);
