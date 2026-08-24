/**
 * Update product variations in MongoDB — direct DB script (operator use).
 *
 * Context:
 *   - The original CSV import (100 products) only created a single "Standard
 *     Global Access" variation per product. That makes the storefront look thin.
 *   - The admin UI now exposes the same logic via the
 *     "Migrate Variations" button (calls /api/admin/products/migrate-variations).
 *   - This script is the operator-side escape hatch — useful when you want
 *     to update the DB from a CI/CD pipeline or a one-off terminal without
 *     going through the admin UI.
 *
 * Usage (run from your local machine that has MongoDB Atlas network access):
 *   node scripts/update-product-variations.mjs --dry-run
 *   node scripts/update-product-variations.mjs --apply
 *
 * Env:
 *   MONGODB_URI     (default: the project's Atlas cluster)
 *   MONGODB_DB_NAME (default: "playbeat")
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://uzzirulzz_db_user:VaOqvbEVgfN5bYNC@cluster0.75ddnhu.mongodb.net/?appName=Cluster0';
const DB_NAME = process.env.MONGODB_DB_NAME || 'playbeat';

const APPLY = process.argv.includes('--apply');
const DRY_RUN = !APPLY;

console.log(`[mode] ${DRY_RUN ? 'DRY RUN (no writes)' : 'APPLY (writing to MongoDB)'}`);

// Re-implement the same generation rules as src/utils/variationBuilder.ts.
// Kept inline here so the script can run standalone without a TS build step.
function round2(n) { return Math.round(n * 100) / 100; }

function streamingVariations(product) {
  const base = product.price || 9.99;
  const tiers = [
    { value: '1 Month', mult: 1.0 },
    { value: '3 Months', mult: 2.6 },
    { value: '6 Months', mult: 4.9 },
    { value: '12 Months', mult: 8.8 },
  ];
  return tiers.map((t, i) => ({
    id: `var-${product.id}-dur-${i + 1}`,
    type: 'Duration', value: t.value,
    price: round2(base * t.mult), costPrice: round2(base * t.mult * 0.55),
    stock: 100, sku: `${product.sku || product.id}-D${i + 1}`, isAvailable: true,
    normalizedKey: `${product.id}+duration+${t.value.toLowerCase().replace(/\s+/g, '_')}`,
  }));
}

function iptvVariations(product) {
  const base = product.price || 12.99;
  const tiers = [
    { value: '1 Month — 1 Connection', mult: 1.0 },
    { value: '3 Months — 1 Connection', mult: 2.6 },
    { value: '6 Months — 2 Connections', mult: 5.4 },
    { value: '12 Months — 2 Connections', mult: 9.2 },
    { value: '12 Months — 4 Connections', mult: 14.5 },
  ];
  return tiers.map((t, i) => ({
    id: `var-${product.id}-iptv-${i + 1}`,
    type: 'Duration / Connections', value: t.value,
    price: round2(base * t.mult), costPrice: round2(base * t.mult * 0.5),
    stock: 80, sku: `${product.sku || product.id}-I${i + 1}`, isAvailable: true,
    normalizedKey: `${product.id}+duration_connections+${t.value.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
  }));
}

function softwareVariations(product) {
  const base = product.price || 29.99;
  const title = (product.title || '').toLowerCase();
  let editions;
  if (title.includes('office') || title.includes('word') || title.includes('excel')) {
    editions = [
      { value: 'Home & Student 2024', mult: 1.0 },
      { value: 'Home & Business 2024', mult: 1.65 },
      { value: 'Professional Plus 2024', mult: 2.3 },
    ];
  } else if (title.includes('windows')) {
    editions = [
      { value: 'Home Edition', mult: 1.0 },
      { value: 'Pro Edition', mult: 1.45 },
      { value: 'Pro + Office Bundle', mult: 2.4 },
      { value: 'Enterprise LTSC', mult: 2.9 },
    ];
  } else if (title.includes('autocad') || title.includes('autodesk') || title.includes('3ds')) {
    editions = [
      { value: 'Single-User 1 Year', mult: 1.0 },
      { value: 'Commercial 1 Year', mult: 1.5 },
      { value: 'Multi-Seat 1 Year (5 Users)', mult: 4.2 },
    ];
  } else if (
    title.includes('antivirus') || title.includes('kaspersky') ||
    title.includes('bitdefender') || title.includes('norton') || title.includes('mcafee')
  ) {
    editions = [
      { value: '1 Device — 1 Year', mult: 1.0 },
      { value: '3 Devices — 1 Year', mult: 1.7 },
      { value: '5 Devices — 2 Years', mult: 2.8 },
      { value: '10 Devices — 2 Years', mult: 4.4 },
    ];
  } else {
    editions = [
      { value: 'Standard Edition', mult: 1.0 },
      { value: 'Professional Edition', mult: 1.55 },
      { value: 'Enterprise / Lifetime', mult: 2.8 },
    ];
  }
  return editions.map((e, i) => ({
    id: `var-${product.id}-ed-${i + 1}`,
    type: 'Edition', value: e.value,
    price: round2(base * e.mult), costPrice: round2(base * e.mult * 0.5),
    stock: 60, sku: `${product.sku || product.id}-E${i + 1}`, isAvailable: true,
    normalizedKey: `${product.id}+edition+${e.value.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
  }));
}

function gamingVariations(product) {
  const base = product.price || 19.99;
  const title = (product.title || '').toLowerCase();
  let editions;
  if (title.includes('steam gift') || title.includes('steam key')) {
    editions = [
      { value: 'Standard Edition', mult: 1.0 },
      { value: 'Deluxe Edition', mult: 1.35 },
      { value: 'Ultimate Edition', mult: 1.8 },
      { value: 'Gold / Season Pass Bundle', mult: 2.2 },
    ];
  } else if (title.includes('battle.net') || title.includes('battlenet') || title.includes('origin') || title.includes('ubisoft')) {
    editions = [
      { value: 'Standard Edition', mult: 1.0 },
      { value: 'Deluxe Edition', mult: 1.4 },
      { value: 'Ultimate Edition', mult: 1.9 },
    ];
  } else if (title.includes('xbox') || title.includes('playstation') || title.includes('ps5') || title.includes('ps4') || title.includes('nintendo')) {
    editions = [
      { value: 'Digital Code — 1 Month', mult: 1.0 },
      { value: 'Digital Code — 3 Months', mult: 2.7 },
      { value: 'Digital Code — 6 Months', mult: 5.0 },
      { value: 'Digital Code — 12 Months', mult: 8.5 },
    ];
  } else {
    editions = [
      { value: 'Standard Edition', mult: 1.0 },
      { value: 'Deluxe Edition', mult: 1.35 },
      { value: 'Ultimate Edition', mult: 1.85 },
    ];
  }
  return editions.map((e, i) => ({
    id: `var-${product.id}-game-${i + 1}`,
    type: 'Edition', value: e.value,
    price: round2(base * e.mult), costPrice: round2(base * e.mult * 0.55),
    stock: 75, sku: `${product.sku || product.id}-G${i + 1}`, isAvailable: true,
    normalizedKey: `${product.id}+edition+${e.value.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
  }));
}

function saasVariations(product) {
  const base = product.price || 14.99;
  const tiers = [
    { value: '1 Month — 1 User', mult: 1.0 },
    { value: '3 Months — 1 User', mult: 2.6 },
    { value: '6 Months — 1 User', mult: 4.8 },
    { value: '12 Months — 1 User', mult: 8.5 },
    { value: '12 Months — Team (5 Users)', mult: 24.0 },
  ];
  return tiers.map((t, i) => ({
    id: `var-${product.id}-saas-${i + 1}`,
    type: 'Duration / Seats', value: t.value,
    price: round2(base * t.mult), costPrice: round2(base * t.mult * 0.5),
    stock: 90, sku: `${product.sku || product.id}-S${i + 1}`, isAvailable: true,
    normalizedKey: `${product.id}+duration_seats+${t.value.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
  }));
}

function coachingVariations(product) {
  const base = product.price || 24.99;
  const tiers = [
    { value: 'Single Session — 1 Hour', mult: 1.0 },
    { value: 'Coaching Pack — 3 Hours', mult: 2.7 },
    { value: 'Coaching Pack — 5 Hours', mult: 4.2 },
    { value: 'Monthly Mentorship — 8 Hours', mult: 6.5 },
  ];
  return tiers.map((t, i) => ({
    id: `var-${product.id}-coach-${i + 1}`,
    type: 'Session Package', value: t.value,
    price: round2(base * t.mult), costPrice: round2(base * t.mult * 0.6),
    stock: 40, sku: `${product.sku || product.id}-C${i + 1}`, isAvailable: true,
    normalizedKey: `${product.id}+session_package+${t.value.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
  }));
}

function defaultVariations(product) {
  const base = product.price || 9.99;
  const editions = [
    { value: 'Standard', mult: 1.0 },
    { value: 'Premium', mult: 1.5 },
    { value: 'Lifetime', mult: 2.5 },
  ];
  return editions.map((e, i) => ({
    id: `var-${product.id}-def-${i + 1}`,
    type: 'Edition', value: e.value,
    price: round2(base * e.mult), costPrice: round2(base * e.mult * 0.55),
    stock: 80, sku: `${product.sku || product.id}-V${i + 1}`, isAvailable: true,
    normalizedKey: `${product.id}+edition+${e.value.toLowerCase()}`,
  }));
}

function buildVariations(product) {
  if (product.productType === 'physical_projector' || product.id?.startsWith('proj-')) {
    return null;
  }
  const cat = (product.categoryId || '').toLowerCase();
  switch (cat) {
    case 'streaming': return streamingVariations(product);
    case 'iptv': return iptvVariations(product);
    case 'software': return softwareVariations(product);
    case 'gaming': return gamingVariations(product);
    case 'saas-tools': return saasVariations(product);
    case 'game-coaching':
    case 'gamepal': return coachingVariations(product);
    case 'gift-cards':
    default: return defaultVariations(product);
  }
}

function needsMigration(product) {
  if (product.productType === 'physical_projector' || product.id?.startsWith('proj-')) return false;
  if (!product.variations || product.variations.length === 0) return true;
  if (product.variations.length === 1 && /standard global access/i.test(product.variations[0].value)) {
    return true;
  }
  return false;
}

async function main() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });
  console.log('[mongo] connecting…');
  await client.connect();
  console.log('[mongo] connected');
  const db = client.db(DB_NAME);
  const col = db.collection('products');

  const total = await col.countDocuments();
  console.log(`[mongo] products in collection: ${total}`);

  const cursor = col.find({}, { projection: { _id: 0 } });
  let updated = 0;
  let skipped = 0;
  const ops = [];

  for await (const prod of cursor) {
    if (!needsMigration(prod)) {
      skipped++;
      continue;
    }
    const newVars = buildVariations(prod);
    if (!newVars || newVars.length === 0) {
      skipped++;
      continue;
    }
    const totalStock = newVars.reduce((s, v) => s + (v.stock || 0), 0);

    if (DRY_RUN) {
      console.log(
        `[dry-run] ${prod.id}  "${(prod.title || '').substring(0, 50)}…"  (${prod.categoryId})  →  ${newVars.length} variants  stock=${totalStock}`
      );
    } else {
      ops.push({
        updateOne: {
          filter: { id: prod.id },
          update: {
            $set: {
              variations: newVars,
              stock: totalStock,
              updatedAt: new Date().toISOString(),
            },
          },
        },
      });
    }
    updated++;
  }

  if (!DRY_RUN && ops.length > 0) {
    console.log(`[mongo] applying ${ops.length} updateOne ops in batches of 50…`);
    for (let i = 0; i < ops.length; i += 50) {
      const batch = ops.slice(i, i + 50);
      const res = await col.bulkWrite(batch, { ordered: false });
      console.log(`  batch ${i / 50 + 1}: matched=${res.matchedCount} modified=${res.modifiedCount}`);
    }
  }

  console.log('\n[summary]');
  console.log(`  scanned         : ${total}`);
  console.log(`  updated         : ${updated}`);
  console.log(`  skipped         : ${skipped}`);
  console.log(`  mode            : ${DRY_RUN ? 'DRY RUN' : 'APPLY'}`);

  await client.close();
  console.log('[mongo] closed');
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
