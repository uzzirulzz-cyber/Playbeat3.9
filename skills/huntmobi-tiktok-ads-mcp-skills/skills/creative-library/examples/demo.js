/**
 * TikTok Creative Library — Usage Example (MCP Edition)
 *
 * Demonstrates: asset inventory, identity lookup, launch readiness
 * via parallel MCP calls (images + videos + identities).
 */

const { MCPClient } = require("../../../lib/mcp-client");
const CreativeLibrary = require("../src/index");

// ADVERTISER_ID: get yours from TikTok Ads Manager →
//   https://ads.tiktok.com/i18n/  → Account Settings → Advertiser ID
const ADVERTISER_ID = process.env.TIKTOK_ADVERTISER_ID || "<YOUR_ADVERTISER_ID>";

async function main() {
  console.log("TikTok Creative Library — MCP Demo\n");

  const client = new MCPClient();
  const lib = new CreativeLibrary(client);

  // ── 1. List Images ────────────────────────────────────────────
  console.log("1. listImages:");
  const images = lib.listImages({ advertiser_id: ADVERTISER_ID });
  console.log("   Tool:", images.tool);

  // ── 2. List Videos ────────────────────────────────────────────
  console.log("\n2. listVideos:");
  const videos = lib.listVideos({ advertiser_id: ADVERTISER_ID });
  console.log("   Tool:", videos.tool);

  // ── 3. Inventory Summary (3 parallel MCP calls) ───────────────
  console.log("\n3. getInventorySummary (3 parallel calls):");
  const inv = lib.getInventorySummary(ADVERTISER_ID);
  console.log("   Description:", inv.description);
  inv.calls.forEach((c) => console.log(`   ${c.type}: ${c.call.tool}`));

  // ── 4. Launch Readiness ───────────────────────────────────────
  console.log("\n4. checkLaunchReadiness:");
  const ready = lib.checkLaunchReadiness(ADVERTISER_ID, {
    min_videos: 3, min_images: 5, min_identities: 1,
  });
  console.log("   Thresholds:", JSON.stringify(ready.thresholds));
  ready.calls.forEach((c) => console.log(`   ${c.type}: ${c.call.tool}`));

  // ── 5. List Identities ────────────────────────────────────────
  console.log("\n5. listIdentities:");
  const ident = lib.listIdentities(ADVERTISER_ID);
  console.log("   Tool:", ident.tool);

  // ── 6. Static Helpers ─────────────────────────────────────────
  console.log("\n6. Static helpers (mock data):");
  const mockVideos = [
    { width: 1920, height: 1080, create_time: new Date().toISOString() },
    { width: 1080, height: 1920, create_time: "2026-01-01" },
  ];
  const fmt = CreativeLibrary.computeFormatBreakdown(mockVideos);
  console.log("   Format breakdown:", JSON.stringify(fmt));

  const recent = CreativeLibrary.countRecentUploads(
    [{ create_time: new Date().toISOString() }],
    [{ create_time: new Date().toISOString() }]
  );
  console.log("   Recent 7d: images=" + recent.images + " videos=" + recent.videos);
}

main().catch(console.error);
