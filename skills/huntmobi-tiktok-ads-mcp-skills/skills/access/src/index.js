/**
 * TikTok Access Skill — Implementation (MCP edition)
 *
 * Serves as the entry point for TikTok Ads MCP integration.
 * No app_id/secret/OAuth flow needed — MCP auth is handled by Hermes.
 *
 * Prerequisites:
 *   hermes mcp add tt-ads-flat --url https://business-api.tiktok.com/open_mcp/tt-ads-mcp-flat --auth oauth
 *
 * Provides:
 *   - createClient() — instantiate MCPClient (default advertiser_id optional)
 *   - getAdvertisers() — list authorized ad accounts via MCP
 *   - checkConnection() — verify MCP server is reachable
 */

const { MCPClient } = require("../../../lib/mcp-client");

// ─── Public API ───────────────────────────────────────────────────

module.exports = {
  /**
   * Create a ready-to-use MCPClient.
   * Auth is handled transparently by Hermes MCP OAuth.
   *
   * @param {object} [opts]
   * @param {string} [opts.advertiser_id] - Default advertiser ID (optional)
   * @returns {MCPClient}
   */
  createClient(opts = {}) {
    return new MCPClient({
      advertiser_id: opts.advertiser_id || null,
    });
  },

  /**
   * Get authorized ad accounts — the MCP equivalent of the old
   * GET /oauth2/advertiser/get/ call. Uses mcp_tt_ads_flat_auth_advertiser_get.
   *
   * @returns {{ tool: string, args: object }}
   */
  getAuthorizedAdvertisers() {
    const client = new MCPClient();
    return client.getAuthorizedAdvertisers();
  },

  /**
   * Build a client and fetch advertisers in one step.
   * Convenience method for the typical "connect → list accounts" flow.
   *
   * @returns {{ client: MCPClient, advertisersCall: { tool, args } }}
   */
  connect() {
    const client = new MCPClient();
    return {
      client,
      advertisersCall: client.getAuthorizedAdvertisers(),
    };
  },

  /**
   * Check MCP connection status.
   * In Hermes, run: hermes mcp list
   * Returns instructions for verifying the connection.
   *
   * @returns {{ status: string, instructions: string }}
   */
  checkConnection() {
    return {
      status: "requires_verification",
      instructions: "Run `hermes mcp list` to verify tt-ads-flat is connected and tools are enabled.",
      required_server: "tt-ads-flat",
    };
  },
};
