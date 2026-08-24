/**
 * TikTok Ads MCP Client — maps TikTok MCP tools to a clean JavaScript API.
 *
 * This client wraps TikTok MCP tools (tt-ads-flat).
 * It does NOT make REST calls — every method returns the MCP tool name + args
 * for the Hermes agent to execute.
 *
 * MCP Server: tt-ads-flat (384 tools, https://business-api.tiktok.com/open_mcp/tt-ads-mcp-flat)
 * Auth: OAuth 2.0 PKCE handled by Hermes MCP client (no app_id/secret needed)
 *
 * Usage:
 *   const client = new MCPClient();
 *   const { tool, args } = client.getAdvertiserInfo(["123"]);
 *   // Hermes agent calls: mcp_tt_ads_flat_advertiser_info_get(args)
 */

// ─── MCP Tool Name Mapping ──────────────────────────────────────────

const MCP_PREFIX = "mcp_tt_ads_flat_";

const TOOLS = {
  advertiser_info_get:              "advertiser_info_get",
  campaign_get:                     "campaign_get",
  adgroup_get:                      "adgroup_get",
  ad_get:                           "ad_get",
  report_integrated_get:            "report_integrated_get",
  file_image_ad_info_get:           "file_image_ad_info_get",
  file_video_ad_info_get:           "file_video_ad_info_get",
  identity_get:                     "identity_get",
  tool_search_keyword_recommend:    "tool_search_keyword_recommend",
  tool_targeting_category_recommend_get: "tool_targeting_category_recommend_get",
  auth_advertiser_get:              "auth_advertiser_get",
  file_image_ad_search:             "file_image_ad_search",
  file_video_ad_search:             "file_video_ad_search",
  targeting_search:                 "targeting_search",
  tool_hashtag_recommend_search:    "tool_hashtag_recommend_search",
  blockedword_list_get:             "blockedword_list_get",
  search_ad_negative_keyword_get:   "search_ad_negative_keyword_get",
};

// ─── Input Validation ───────────────────────────────────────────────

function validateDateString(value, fieldName) {
  if (!value || typeof value !== "string") {
    throw new Error(`${fieldName} is required and must be a string (YYYY-MM-DD)`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${fieldName} must be in YYYY-MM-DD format, got: "${value}"`);
  }
}

function validateRequiredString(value, fieldName) {
  if (!value || typeof value !== "string") {
    throw new Error(`${fieldName} is required and must be a non-empty string`);
  }
}

// ─── Main MCP Client ────────────────────────────────────────────────

class MCPClient {
  /**
   * @param {object} [opts]
   * @param {string} [opts.advertiser_id] - Default advertiser ID (optional shortcut)
   * @param {boolean} [opts.dryRun=false]  - Dry-run mode: returns tool calls without executing
   */
  constructor(opts = {}) {
    this.advertiserId = opts.advertiser_id || null;
    this.dryRun = opts.dryRun || false;
  }

  /**
   * Build a tool call object that the Hermes agent executes.
   * @param {string} toolKey - key in TOOLS map
   * @param {object} args - MCP tool arguments
   * @returns {{ tool: string, args: object }}
   */
  _call(toolKey, args) {
    const tool = MCP_PREFIX + TOOLS[toolKey];
    return { tool, args };
  }

  // ─── Advertiser ──────────────────────────────────────────────────

  /**
   * Get advertiser info → mcp_tt_ads_flat_advertiser_info_get
   * @param {string[]} advertiserIds
   */
  getAdvertiserInfo(advertiserIds) {
    validateRequiredString(advertiserIds?.[0], "advertiserIds[0]");
    return this._call("advertiser_info_get", {
      advertiser_ids: advertiserIds,
    });
  }

  /**
   * Get authorized ad accounts → mcp_tt_ads_flat_auth_advertiser_get
   */
  getAuthorizedAdvertisers() {
    return this._call("auth_advertiser_get", {});
  }

  // ─── Campaign ────────────────────────────────────────────────────

  /**
   * List campaigns → mcp_tt_ads_flat_campaign_get
   * @param {object} params
   * @param {string} params.advertiser_id
   * @param {string[]} [params.campaign_ids]
   * @param {number} [params.page=1]
   * @param {number} [params.page_size=100]
   */
  listCampaigns(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    const args = {
      advertiser_id: params.advertiser_id,
      page: params.page || 1,
      page_size: params.page_size || 100,
    };
    if (params.campaign_ids) args.campaign_ids = params.campaign_ids;
    return this._call("campaign_get", args);
  }

  // ─── Ad Group ────────────────────────────────────────────────────

  /**
   * List ad groups → mcp_tt_ads_flat_adgroup_get
   */
  listAdGroups(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    const args = {
      advertiser_id: params.advertiser_id,
      page: params.page || 1,
      page_size: params.page_size || 100,
    };
    if (params.campaign_ids) args.campaign_ids = params.campaign_ids;
    if (params.adgroup_ids) args.adgroup_ids = params.adgroup_ids;
    return this._call("adgroup_get", args);
  }

  // ─── Ad ──────────────────────────────────────────────────────────

  /**
   * List ads → mcp_tt_ads_flat_ad_get
   */
  listAds(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    const args = {
      advertiser_id: params.advertiser_id,
      page: params.page || 1,
      page_size: params.page_size || 100,
    };
    if (params.campaign_ids) args.campaign_ids = params.campaign_ids;
    if (params.adgroup_ids) args.adgroup_ids = params.adgroup_ids;
    if (params.ad_ids) args.ad_ids = params.ad_ids;
    return this._call("ad_get", args);
  }

  // ─── Reporting ───────────────────────────────────────────────────

  /**
   * Get integrated report → mcp_tt_ads_flat_report_integrated_get
   * @param {object} params
   * @param {string} params.advertiser_id
   * @param {string} params.start_date - YYYY-MM-DD
   * @param {string} params.end_date - YYYY-MM-DD
   * @param {string} [params.data_level] - AUCTION_ADVERTISER, AUCTION_CAMPAIGN, AUCTION_ADGROUP, AUCTION_AD
   * @param {string[]} [params.dimensions]
   * @param {string[]} [params.metrics]
   * @param {string} [params.order_field]
   * @param {string} [params.order_type] - ASC, DESC
   */
  getReport(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    validateDateString(params?.start_date, "start_date");
    validateDateString(params?.end_date, "end_date");

    // NOTE: "conversions", "cvr", "cpa" are excluded from defaults
    // because they are not available for all advertiser accounts.
    // Pass them explicitly in opts.metrics when supported.
    const defaultMetrics = [
      "spend", "impressions", "clicks",
      "ctr", "cpm", "cpc",
    ];

    return this._call("report_integrated_get", {
      advertiser_id: params.advertiser_id,
      service_type: params.service_type || "AUCTION",
      report_type: params.report_type || "BASIC",
      data_level: params.data_level || "AUCTION_AD",
      dimensions: params.dimensions || ["ad_id", "stat_time_day"],
      metrics: params.metrics || defaultMetrics,
      start_date: params.start_date,
      end_date: params.end_date,
      ...(params.order_field && { order_field: params.order_field }),
      ...(params.order_type && { order_type: params.order_type }),
      page: params.page || 1,
      page_size: params.page_size || 100,
    });
  }

  // ─── Creative / File ─────────────────────────────────────────────

  /**
   * List creative files (images + videos).
   * MCP has separate endpoints for images and videos.
   * Returns { images: {tool, args}, videos: {tool, args} }
   */
  listCreativeFiles(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    const baseArgs = {
      advertiser_id: params.advertiser_id,
      page: params.page || 1,
      page_size: params.page_size || 100,
    };
    if (params.file_ids) baseArgs.file_ids = params.file_ids;

    return {
      images: this._call("file_image_ad_info_get", {
        ...baseArgs,
        ...(params.file_type === "IMAGE" && { file_type: "IMAGE" }),
      }),
      videos: this._call("file_video_ad_info_get", {
        ...baseArgs,
        ...(params.file_type === "VIDEO" && { file_type: "VIDEO" }),
      }),
    };
  }

  /**
   * Search images in asset library → mcp_tt_ads_flat_file_image_ad_search
   */
  searchImages(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    return this._call("file_image_ad_search", {
      advertiser_id: params.advertiser_id,
      page: params.page || 1,
      page_size: params.page_size || 100,
    });
  }

  /**
   * Search videos in asset library → mcp_tt_ads_flat_file_video_ad_search
   */
  searchVideos(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    return this._call("file_video_ad_search", {
      advertiser_id: params.advertiser_id,
      page: params.page || 1,
      page_size: params.page_size || 100,
    });
  }

  // ─── Audience / Targeting ────────────────────────────────────────

  /**
   * Get keyword recommendations → mcp_tt_ads_flat_tool_search_keyword_recommend
   */
  suggestKeywords(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    validateRequiredString(params?.keyword, "keyword");
    return this._call("tool_search_keyword_recommend", {
      advertiser_id: params.advertiser_id,
      search_queries: [params.keyword],
      regions: params.regions || ["US"],
      ...(params.limit && { limit: params.limit }),
    });
  }

  /**
   * Get targeting category recommendations
   * → mcp_tt_ads_flat_tool_targeting_category_recommend_get
   */
  recommendTargeting(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    if (!params?.region_codes || !Array.isArray(params.region_codes) || params.region_codes.length === 0) {
      throw new Error("region_codes is required and must be a non-empty array (e.g. ['US', 'JP'])");
    }
    return this._call("tool_targeting_category_recommend_get", {
      advertiser_id: params.advertiser_id,
      region_codes: params.region_codes,
      ...(params.app_id && { app_id: params.app_id }),
    });
  }

  /**
   * Search targeting → mcp_tt_ads_flat_targeting_search
   */
  searchTargeting(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    return this._call("targeting_search", {
      advertiser_id: params.advertiser_id,
      ...(params.keyword && { keyword: params.keyword }),
    });
  }

  /**
   * Recommend hashtags → mcp_tt_ads_flat_tool_hashtag_recommend_search
   */
  recommendHashtags(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    return this._call("tool_hashtag_recommend_search", {
      advertiser_id: params.advertiser_id,
      keyword: params.keyword || params.topic,
      ...(params.limit && { limit: params.limit }),
    });
  }

  // ─── Identity ────────────────────────────────────────────────────

  /**
   * List identities → mcp_tt_ads_flat_identity_get
   */
  listIdentities(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    return this._call("identity_get", {
      advertiser_id: params.advertiser_id,
    });
  }

  // ─── Blocked Words ───────────────────────────────────────────────

  /**
   * Get blocked word list → mcp_tt_ads_flat_blockedword_list_get
   */
  getBlockedWords(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    return this._call("blockedword_list_get", {
      advertiser_id: params.advertiser_id,
    });
  }

  // ─── Negative Keywords ───────────────────────────────────────────

  /**
   * Get negative keywords → mcp_tt_ads_flat_search_ad_negative_keyword_get
   */
  getNegativeKeywords(params) {
    validateRequiredString(params?.advertiser_id, "advertiser_id");
    return this._call("search_ad_negative_keyword_get", {
      advertiser_id: params.advertiser_id,
      ...(params.campaign_ids && { campaign_ids: params.campaign_ids }),
      ...(params.adgroup_ids && { adgroup_ids: params.adgroup_ids }),
    });
  }

  // ─── Pagination (MCP handles this natively) ──────────────────────

  /**
   * MCP tools support pagination natively via page/page_size params.
   * This helper iterates over pages and collects tool calls.
   * @param {Function} fetchFn - async (page) => { tool, args }
   * @param {number} [maxPages=100]
   * @returns {Promise<Array<{tool, args}>>} Array of tool calls per page
   */
  async paginate(fetchFn, maxPages = 100) {
    const calls = [];
    for (let page = 1; page <= maxPages; page++) {
      const { tool, args } = await fetchFn(page);
      calls.push({ tool, args: { ...args, page, page_size: args.page_size || 100 } });
    }
    return calls;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Execute a tool call via Hermes MCP. In Hermes, this is handled by the agent.
 * Standalone (Node.js CLI): prints the tool call as JSON for dry-run visibility.
 *
 * @param {{ tool: string, args: object }} call
 * @returns {Promise<object>} MCP response data
 */
async function executeMCPCall(call) {
  // When running inside Hermes, the agent calls MCP tools directly.
  // This function is provided for standalone testing / dry-run.
  if (process.env.HERMES_MCP_DRY_RUN || !process.env.HERMES_SESSION_ID) {
    console.log("[MCP CALL]", JSON.stringify(call, null, 2));
    return { _dry_run: true, ...call };
  }
  // In Hermes context, the agent intercepts and executes MCP calls.
  // Return the call object for the agent to process.
  return call;
}

/**
 * Helper to extract advertiser ID from auth response.
 */
function extractAdvertiserId(authResult) {
  const list = authResult?.list || authResult || [];
  return Array.isArray(list) ? list[0]?.advertiser_id : list?.advertiser_id;
}

module.exports = {
  MCPClient,
  MCP_PREFIX,
  TOOLS,
  executeMCPCall,
  extractAdvertiserId,
};
