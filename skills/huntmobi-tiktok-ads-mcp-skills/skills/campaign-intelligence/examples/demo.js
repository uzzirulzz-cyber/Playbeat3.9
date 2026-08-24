/**
 * TikTok Campaign Intelligence — Usage Example (MCP Edition)
 *
 * Demonstrates: campaign tree, performance analysis,
 * high-spend/low-perf detection, Smart+ analysis via MCP pipeline.
 */

const { MCPClient } = require("../../../lib/mcp-client");
const CampaignIntelligence = require("../src/index");

// ADVERTISER_ID: get yours from TikTok Ads Manager →
//   https://ads.tiktok.com/i18n/  → Account Settings → Advertiser ID
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const ADVERTISER_ID = process.env.TIKTOK_ADVERTISER_ID || "<YOUR_ADVERTISER_ID>";

async function main() {
  console.log("TikTok Campaign Intelligence — MCP Demo\n");

  const client = new MCPClient();
  const ci = new CampaignIntelligence(client);

  // ── 1. Campaign Details ───────────────────────────────────────
  console.log("1. getCampaignDetails:");
  const details = ci.getCampaignDetails({ advertiser_id: ADVERTISER_ID });
  console.log("   Tool:", details.tool);

  // ── 2. Full Structure (3-step MCP pipeline) ───────────────────
  console.log("\n2. getFullStructure (3-step pipeline):");
  const structure = ci.getFullStructure({ advertiser_id: ADVERTISER_ID });
  structure.steps.forEach((s) => {
    console.log(`   Step ${s.order}: ${s.description}`);
    console.log(`     → ${s.call.tool}`);
  });

  // ── 3. Performance Analysis ───────────────────────────────────
  console.log("\n3. getPerformanceAnalysis:");
  const perf = ci.getPerformanceAnalysis({
    advertiser_id: ADVERTISER_ID,
    start_date: daysAgo(7),
    end_date: daysAgo(0),
  });
  console.log("   Tool:", perf.call.tool);
  console.log("   Post-process:", perf.postProcessing.description);

  // ── 4. High-Spend Low-Performance ─────────────────────────────
  console.log("\n4. findHighSpendLowPerformance:");
  const hsl = ci.findHighSpendLowPerformance({
    advertiser_id: ADVERTISER_ID,
    start_date: daysAgo(7),
    end_date: daysAgo(0),
  });
  console.log("   Tool:", hsl.call.tool);
  console.log("   Filters:", hsl.filters.description);

  // ── 5. Smart+ Analysis ────────────────────────────────────────
  console.log("\n5. analyzeSmartPlus:");
  const sm = ci.analyzeSmartPlus({
    advertiser_id: ADVERTISER_ID,
    start_date: daysAgo(7),
    end_date: daysAgo(0),
  });
  sm.steps.forEach((s) => {
    console.log(`   Step ${s.order}: ${s.description}`);
    console.log(`     → ${s.call.tool}`);
  });

  // ── 6. Static Helpers ─────────────────────────────────────────
  console.log("\n6. Static helpers (mock data):");
  const mockCampaigns = [
    { campaign_id: "c1", spend: 500, impressions: 10000, clicks: 300, conversions: 20 },
    { campaign_id: "c2", spend: 50, impressions: 1000, clicks: 20, conversions: 1 },
  ];
  const ranked = CampaignIntelligence.aggregateByCampaign(
    mockCampaigns.map((c) => ({
      dimensions: { campaign_id: c.campaign_id },
      metrics: { spend: String(c.spend), impressions: String(c.impressions), clicks: String(c.clicks), conversions: String(c.conversions) },
    }))
  );
  ranked.forEach((c) => console.log(`   ${c.campaign_id}: spend=$${c.spend} ctr=${c.ctr} cpa=${c.cpa}`));
}

main().catch(console.error);
