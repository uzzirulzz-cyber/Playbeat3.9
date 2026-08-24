/**
 * TikTok Account Insights — Usage Example (MCP Edition)
 *
 * Demonstrates: performance overview, trends, region breakdown
 * via mcp_tt_ads_flat_report_integrated_get.
 */

const { MCPClient } = require("../../../lib/mcp-client");
const AccountInsights = require("../src/index");

// ADVERTISER_ID: get yours from TikTok Ads Manager →
//   https://ads.tiktok.com/i18n/  → Account Settings → Advertiser ID
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const ADVERTISER_ID = process.env.TIKTOK_ADVERTISER_ID || "<YOUR_ADVERTISER_ID>";

async function main() {
  console.log("TikTok Account Insights — MCP Demo\n");

  const client = new MCPClient();
  const insights = new AccountInsights(client);

  // ── 1. Account Performance (last 7 days) ──────────────────────
  console.log("1. getAccountPerformance (7 days):");
  const perf = insights.getAccountPerformance({
    advertiser_id: ADVERTISER_ID,
    start_date: daysAgo(7),
    end_date: daysAgo(0),
  });
  console.log("   Tool:", perf.tool);
  console.log("   data_level:", perf.args.data_level);

  // ── 2. Trend Analysis with Anomaly Detection ──────────────────
  console.log("\n2. getTrendAnalysis:");
  const trend = insights.getTrendAnalysis({
    advertiser_id: ADVERTISER_ID,
    start_date: daysAgo(7),
    end_date: daysAgo(0),
  });
  console.log("   Tool:", trend.call.tool);
  console.log("   Anomaly config:", trend.anomalyConfig.description);

  // ── 3. Region Breakdown ───────────────────────────────────────
  console.log("\n3. getRegionBreakdown:");
  const regions = insights.getRegionBreakdown({
    advertiser_id: ADVERTISER_ID,
    start_date: daysAgo(7),
    end_date: daysAgo(0),
  });
  console.log("   Tool:", regions.tool);
  console.log("   dimensions:", regions.args.dimensions);

  // ── 4. Static Helpers (demo with mock data) ───────────────────
  console.log("\n4. Static helpers (mock data):");
  const mockData = [
    { dimensions: { country_code: "US" }, metrics: { spend: "100", impressions: "1000" } },
    { dimensions: { country_code: "US" }, metrics: { spend: "200", impressions: "2000" } },
    { dimensions: { country_code: "JP" }, metrics: { spend: "50", impressions: "500" } },
  ];
  const agg = AccountInsights.aggregateMetrics(mockData);
  console.log("   aggregateMetrics: spend=$" + agg.spend + " impressions=" + agg.impressions);

  const regionAgg = AccountInsights.aggregateByCountry(mockData);
  console.log("   aggregateByCountry: " + regionAgg.sorted_by_spend.length + " countries");
}

main().catch(console.error);
