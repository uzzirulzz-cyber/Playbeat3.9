import fs from 'fs';

function parseCsv(content) {
  content = content.replace(/^\uFEFF/, '');
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') { currentField += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim())) rows.push(currentRow);
      currentRow = []; currentField = '';
    } else if (char === '\r') { /* skip */ }
    else { currentField += char; }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim())) rows.push(currentRow);
  }
  return rows;
}

function mapCategory(catStr) {
  const c = (catStr || '').toLowerCase();
  if (c.includes('gift card') || c.includes('crypto')) return 'gift-cards';
  if (c.includes('gaming') || c.includes('game')) return 'gaming';
  if (c.includes('software') || c.includes('windows') || c.includes('office')) return 'software';
  if (c.includes('saas') || c.includes('ai') || c.includes('tool')) return 'saas';
  if (c.includes('stream') || c.includes('netflix') || c.includes('spotify')) return 'streaming';
  if (c.includes('iptv') || c.includes('tv')) return 'iptv';
  if (c.includes('projector')) return 'smart-projectors';
  if (c.includes('coaching') || c.includes('session')) return 'game-coaching';
  if (c.includes('companion')) return 'gamepal-companion';
  return 'gaming';
}

const csvContent = fs.readFileSync('/home/z/my-project/upload/1.csv', 'utf-8');
const rows = parseCsv(csvContent);
const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
console.log(`Headers: ${headers.length} cols, Data: ${rows.length - 1} rows`);

const items = [];
for (let i = 1; i < rows.length; i++) {
  const cols = rows[i];
  const row = {};
  headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });
  const name = row['name'] || row['title'] || 'Untitled';
  const sku = row['sku'] || `PB-${row['id'] || i}`;
  const desc = (row['description'] || row['short description'] || '').replace(/<[^>]+>/g, '').substring(0, 500);
  const price = parseFloat(row['regular price'] || row['sale price'] || '29.99') || 29.99;
  const attrValues = row['attribute 1 value(s)'] || '';
  let variations;
  if (attrValues) {
    const parts = attrValues.split('|').map(v => v.trim()).filter(Boolean);
    if (parts.length > 0) {
      variations = parts.map(val => ({ type: row['attribute 1 name'] || 'Denomination', value: val, costPrice: price * 0.8, stock: 100 }));
    }
  }
  items.push({
    externalId: sku, title: name, description: desc,
    category: mapCategory(row['categories'] || ''),
    costPrice: price * 0.8, stock: 100, sku,
    imageUrl: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/1a2604e96f45.jpg',
    productType: 'digital', variations: variations,
  });
}

console.log(`Parsed ${items.length} products. Importing one by one...\n`);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let totalImported = 0;
// Import one at a time to avoid payload/crash issues
for (let i = 0; i < items.length; i++) {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/import/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [items[i]], markupType: 'percentage', markupValue: 25, autoApprove: true }),
    });
    const data = await res.json();
    if (data.success && data.importJob.importedCount > 0) {
      totalImported++;
      console.log(`  [${i+1}/${items.length}] ✓ ${items[i].title.substring(0, 40)}`);
    } else if (data.success && data.importJob.duplicateCount > 0) {
      console.log(`  [${i+1}/${items.length}] ⊘ duplicate: ${items[i].sku}`);
    } else {
      console.log(`  [${i+1}/${items.length}] ✗ ${data.error || 'failed'}`);
    }
  } catch (err) {
    console.log(`  [${i+1}/${items.length}] ✗ network error, retrying...`);
    await sleep(2000);
    try {
      const res2 = await fetch('http://127.0.0.1:3000/api/import/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [items[i]], markupType: 'percentage', markupValue: 25, autoApprove: true }),
      });
      const data2 = await res2.json();
      if (data2.success && data2.importJob.importedCount > 0) {
        totalImported++;
        console.log(`  [${i+1}/${items.length}] ✓ (retry) ${items[i].title.substring(0, 40)}`);
      }
    } catch {
      console.log(`  [${i+1}/${items.length}] ✗ failed after retry`);
    }
  }
  await sleep(100); // small delay between requests
}

console.log(`\n=== Done! Total imported: ${totalImported} out of ${items.length} ===`);
