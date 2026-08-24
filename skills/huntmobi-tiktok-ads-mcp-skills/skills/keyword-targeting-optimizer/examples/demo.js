/**
 * TikTok Keyword & Targeting — Usage Example (MCP Edition)
 *
 * Demonstrates: keyword suggestions, targeting interests,
 * hashtag recommendations, blocked words, negative keywords
 * via TikTok Ads MCP native tools.
 */

const { MCPClient } = require("../../../lib/mcp-client");
const KeywordTargetingOptimizer = require("../src/index");

// ADVERTISER_ID: get yours from TikTok Ads Manager →
//   https://ads.tiktok.com/i18n/  → Account Settings → Advertiser ID
const ADVERTISER_ID = process.env.TIKTOK_ADVERTISER_ID || "<YOUR_ADVERTISER_ID>";

async function main() {
  console.log("TikTok Keyword & Targeting — MCP Demo\n");

  const client = new MCPClient();
  const kt = new KeywordTargetingOptimizer(client);

  // ── 1. Keyword Suggestions ────────────────────────────────────
  console.log("1. suggestKeywords (seed: 'game'):");
  const kw = kt.suggestKeywords({
    advertiser_id: ADVERTISER_ID,
    keyword: "game",
    limit: 10,
  });
  console.log("   Tool:", kw.tool);
  console.log("   Args:", JSON.stringify(kw.args, null, 2));

  // ── 2. Batch Keywords ─────────────────────────────────────────
  console.log("\n2. batchSuggestKeywords (seeds: game, puzzle, strategy):");
  const batch = kt.batchSuggestKeywords({
    advertiser_id: ADVERTISER_ID,
    seed_keywords: ["game", "puzzle", "strategy"],
    limit: 20,
  });
  console.log("   Parallel calls:", batch.calls.length);

  // ── 3. Targeting Interests ────────────────────────────────────
  console.log("\n3. suggestTargetingInterests (region: US):");
  const interests = kt.suggestTargetingInterests({
    advertiser_id: ADVERTISER_ID,
    region_codes: ["US"],
  });
  console.log("   Tool:", interests.tool);

  // ── 4. Hashtag Recommendations ────────────────────────────────
  console.log("\n4. suggestHashtags (topic: 'gaming'):");
  const hashtags = kt.suggestHashtags({
    advertiser_id: ADVERTISER_ID,
    keyword: "gaming",
  });
  console.log("   Tool:", hashtags.tool);
  console.log("   → Native MCP hashtag tool (not keyword-suggest proxy)");

  // ── 5. Blocked Words ──────────────────────────────────────────
  console.log("\n5. getBlockedWords:");
  const blocked = kt.getBlockedWords({ advertiser_id: ADVERTISER_ID });
  console.log("   Tool:", blocked.tool);

  // ── 6. Negative Keywords ──────────────────────────────────────
  console.log("\n6. generateNegativeKeywordList + getNegativeKeywords:");
  const neg = kt.generateNegativeKeywordList({
    brand_terms: ["HuntMobi"],
    competitor_terms: ["CompetitorX", "CompetitorY"],
  });
  console.log("   Generated:", neg.negative_keywords.length, "terms");
  console.log("   Apply via:", neg.applyVia.join(", "));

  const existing = kt.getNegativeKeywords({ advertiser_id: ADVERTISER_ID });
  console.log("   Existing:", existing.tool);

  // ── 7. Keyword Performance ────────────────────────────────────
  console.log("\n7. analyzeKeywordPerformance:");
  const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
  const kwPerf = kt.analyzeKeywordPerformance({
    advertiser_id: ADVERTISER_ID,
    start_date: daysAgo(7),
    end_date: daysAgo(0),
  });
  console.log("   Tool:", kwPerf.call.tool);
  console.log("   Post-process:", kwPerf.postProcessing.description);
}

main().catch(console.error);
