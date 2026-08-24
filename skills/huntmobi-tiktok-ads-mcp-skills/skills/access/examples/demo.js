/**
 * TikTok Access — Usage Example (MCP Edition)
 *
 * Demonstrates: MCP connection verification, client creation,
 * and advertiser listing — no app_id/secret needed.
 */

const access = require("../src/index");

// ADVERTISER_ID: get your advertiser ID from TikTok Ads Manager →
//   https://ads.tiktok.com/i18n/  → Account Settings → Advertiser ID
const ADVERTISER_ID = process.env.TIKTOK_ADVERTISER_ID || "<YOUR_ADVERTISER_ID>";

async function main() {
  console.log("TikTok Access — MCP Demo\n");

  // ── Step 1: Check MCP connection ──────────────────────────────
  const status = access.checkConnection();
  console.log("1. Connection status:");
  console.log("   Required server:", status.required_server);
  console.log("   Verify:", status.instructions);

  // ── Step 2: Create MCP client ─────────────────────────────────
  const client = access.createClient();
  console.log("\n2. Client created:", client.constructor.name);

  // ── Step 3: List authorized advertisers ───────────────────────
  const { advertisersCall } = access.connect();
  console.log("\n3. Authorized advertisers — MCP call:");
  console.log("   Tool:", advertisersCall.tool);
  console.log("   Args:", JSON.stringify(advertisersCall.args, null, 2));
  console.log("\n   → Hermes agent executes this MCP tool call");
}

main().catch(console.error);
