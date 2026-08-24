import { execSync } from 'child_process';
import fs from 'fs';

const queries = [
  { cat: 'projector', q: 'Magcubic HY300 portable smart projector 4K', c: 4 },
  { cat: 'gaming_coach', q: 'professional esports gaming coach headset setup', c: 2 },
  { cat: 'game_companion', q: 'gaming companion mobile game controller', c: 2 },
  { cat: 'gaming_keys', q: 'steam game cd key digital code card', c: 2 },
  { cat: 'software', q: 'windows 11 pro office software license box', c: 2 },
  { cat: 'saas', q: 'canva pro adobe creative cloud saas subscription', c: 2 },
  { cat: 'streaming', q: 'netflix spotify premium streaming app', c: 2 },
  { cat: 'iptv', q: 'IPTV live tv streaming set top box', c: 2 },
];

const results = {};
for (const { cat, q, c } of queries) {
  try {
    console.log(`Searching: ${cat}...`);
    const output = execSync(`z-ai image-search -q "${q}" -c ${c} --gl us --no-rank 2>/dev/null`, { encoding: 'utf-8', timeout: 120000 });
    const data = JSON.parse(output);
    if (data.success && data.results) {
      results[cat] = data.results.map(r => r.original_url);
      console.log(`  Found ${results[cat].length} images`);
    } else {
      console.log(`  No results`);
      results[cat] = [];
    }
  } catch (err) {
    console.log(`  Error: ${err.message}`);
    results[cat] = [];
  }
}

fs.writeFileSync('/tmp/image-results.json', JSON.stringify(results, null, 2));
console.log('\nDone! Results saved to /tmp/image-results.json');
