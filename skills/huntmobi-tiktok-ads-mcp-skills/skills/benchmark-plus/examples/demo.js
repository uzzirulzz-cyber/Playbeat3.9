/**
 * TikTok Benchmark Plus — Usage Example (MCP Edition)
 *
 * Demonstrates: peer comparison, baseline analysis, effect evaluation,
 * and performance interpretation via mcp_tt_ads_flat_report_integrated_get.
 */

const { MCPClient } = require("../../../lib/mcp-client");
const BenchmarkPlus = require("../src/index");

// ADVERTISER_ID: get yours from TikTok Ads Manager →
//   https://ads.tiktok.com/i18n/  → Account Settings → Advertiser ID
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const ADVERTISER_ID = process.env.TIKTOK_ADVERTISER_ID || "<YOUR_ADVERTISER_ID>";

async function main() {
  console.log("TikTok Benchmark Plus — MCP Demo\n");

  const client = new MCPClient();
  const bp = new BenchmarkPlus(client);

  // ── 1. Compare to Peers (target + 2 peers) ────────────────────
  console.log("1. compareToPeers:");
  const peers = bp.compareToPeers({
    advertiser_id: ADVERTISER_ID,
    peer_ids: ["<PEER_1>", "<PEER_2>"],
    start_date: daysAgo(7),
    end_date: daysAgo(0),
  });
  console.log("   Parallel calls:", peers.calls.length, "accounts");
  console.log("   Target:", peers.calls[0].call.tool);
  console.log("   Verdict logic:", peers.compareFn);

  // ── 2. Compare to Baseline ────────────────────────────────────
  console.log("\n2. compareToBaseline:");
  const baseline = bp.compareToBaseline({
    advertiser_id: ADVERTISER_ID,
    current_start: daysAgo(7),
    current_end: daysAgo(0),
    baseline_start: daysAgo(14),
    baseline_end: daysAgo(7),
  });
  baseline.calls.forEach((c) =>
    console.log(`   ${c.period}: ${c.call.tool}`)
  );

  // ── 3. Effect Evaluation ──────────────────────────────────────
  console.log("\n3. evaluateEffect (bid optimization):");
  const effect = bp.evaluateEffect({
    advertiser_id: ADVERTISER_ID,
    before_start: daysAgo(28),
    before_end: daysAgo(15),
    after_start: daysAgo(14),
    after_end: daysAgo(7),
    action_description: "Bid optimization",
  });
  effect.calls.forEach((c) =>
    console.log(`   ${c.period}: ${c.call.tool}`)
  );
  console.log("   Recommendation logic:", effect.recommendationLogic.trim().slice(0, 80) + "...");

  // ── 4. Performance Interpretation (pure function) ─────────────
  console.log("\n4. interpretPerformance (pure function, no MCP call):");
  const ctrHigh = bp.interpretPerformance({
    value: 2.5, benchmark_avg: 1.8, metric_name: "CTR",
  });
  console.log("   CTR 2.5% vs 1.8% avg:", ctrHigh.rating, `(${ctrHigh.percentile})`);

  const cpaGood = bp.interpretPerformance({
    value: 3.2, benchmark_avg: 5.0, metric_name: "CPA",
    direction: "lower_is_better",
  });
  console.log("   CPA $3.2 vs $5.0 avg:", cpaGood.rating, `(${cpaGood.percentile})`);

  // ── 5. Static Helpers ─────────────────────────────────────────
  console.log("\n5. Static helpers (mock data):");
  const mockCurrent = { spend: 1000, impressions: 50000, clicks: 1500, ctr: 3.0, cpa: 0.67 };
  const mockBaseline = { spend: 800, impressions: 40000, clicks: 1000, ctr: 2.5, cpa: 0.80 };
  const changes = BenchmarkPlus.computeChanges(mockCurrent, mockBaseline,
    ["spend", "impressions", "clicks", "ctr", "cpa"]);
  console.log("   spend delta:", changes.spend.delta_pct);
  console.log("   ctr delta:", changes.ctr.delta_pct);

  const verdict = BenchmarkPlus.generateChangeVerdict(changes);
  console.log("   Verdict:", verdict);
}

main().catch(console.error);
