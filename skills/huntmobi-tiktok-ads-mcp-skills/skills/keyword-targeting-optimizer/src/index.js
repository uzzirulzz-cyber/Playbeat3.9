/**
 * TikTok Keyword & Targeting Optimizer — Implementation (MCP edition)
 *
 * Provides: keyword recommendations, interest targeting suggestions,
 * hashtag recommendations, blocked word management, negative keywords.
 *
 * Key MCP tools used:
 *   mcp_tt_ads_flat_tool_search_keyword_recommend
 *   mcp_tt_ads_flat_tool_targeting_category_recommend_get
 *   mcp_tt_ads_flat_targeting_search
 *   mcp_tt_ads_flat_tool_hashtag_recommend_search
 *   mcp_tt_ads_flat_blockedword_list_get
 *   mcp_tt_ads_flat_search_ad_negative_keyword_get
 */

const { MCPClient } = require("../../../lib/mcp-client");

class KeywordTargetingOptimizer {
  /**
   * @param {MCPClient} client
   */
  constructor(client) {
    if (!client) throw new Error("MCPClient instance is required");
    this.client = client;
  }

  // ─── Search Keyword Recommendations ─────────────────────────────

  /**
   * Get keyword suggestions → mcp_tt_ads_flat_tool_search_keyword_recommend
   */
  suggestKeywords(opts) {
    return this.client.suggestKeywords({
      advertiser_id: opts.advertiser_id,
      keyword: opts.keyword,
      limit: opts.limit || 50,
      regions: opts.regions,
      ...(opts.language && { language: opts.language }),
    });
  }

  /**
   * Batch keyword expansion from multiple seeds.
   * Returns parallel calls for the agent to execute.
   */
  batchSuggestKeywords(opts) {
    return {
      description: "Parallel keyword suggestions for multiple seeds",
      calls: opts.seed_keywords.slice(0, 10).map((seed) => ({
        seed,
        call: this.client.suggestKeywords({
          advertiser_id: opts.advertiser_id,
          keyword: seed,
          regions: opts.regions,
          ...(opts.language && { language: opts.language }),
          limit: opts.limit || 50,
        }),
      })),
    };
  }

  // ─── Interest Targeting Suggestions ─────────────────────────────

  /**
   * Get targeting recommendations → mcp_tt_ads_flat_tool_targeting_category_recommend_get
   */
  suggestTargetingInterests(opts) {
    return this.client.recommendTargeting({
      advertiser_id: opts.advertiser_id,
      region_codes: opts.region_codes,
      ...(opts.app_id && { app_id: opts.app_id }),
    });
  }

  // ─── Hashtag Recommendations ────────────────────────────────────

  /**
   * Recommend hashtags → mcp_tt_ads_flat_tool_hashtag_recommend_search
   *
   * Uses TikTok's dedicated hashtag recommendation MCP tool.
   * Unlike REST-based approach, this is a native MCP endpoint.
   */
  suggestHashtags(opts) {
    return this.client.recommendHashtags({
      advertiser_id: opts.advertiser_id,
      keyword: opts.topic || opts.keyword,
      limit: opts.limit || 20,
      ...(opts.language && { language: opts.language }),
    });
  }

  /**
   * Search targeting by keyword → mcp_tt_ads_flat_targeting_search
   */
  searchTargeting(opts) {
    return this.client.searchTargeting({
      advertiser_id: opts.advertiser_id,
      keyword: opts.keyword,
    });
  }

  // ─── Blocked Word Management ────────────────────────────────────

  /**
   * Get blocked word list → mcp_tt_ads_flat_blockedword_list_get
   */
  getBlockedWords(opts) {
    return this.client.getBlockedWords({
      advertiser_id: opts.advertiser_id,
    });
  }

  /**
   * Check if specific words are blocked.
   * Fetches the full blocklist, then filters.
   *
   * @param {object} opts
   * @param {string} opts.advertiser_id
   * @param {string[]} opts.words
   * @returns {{ call: {tool, args}, checkWords: string[] }}
   */
  checkBlockedWords(opts) {
    return {
      call: this.client.getBlockedWords({
        advertiser_id: opts.advertiser_id,
      }),
      checkWords: opts.words,
      postProcessing: "Filter blocklist response against opts.words array",
    };
  }

  // ─── Negative Keyword Management ────────────────────────────────

  /**
   * Get existing negative keywords → mcp_tt_ads_flat_search_ad_negative_keyword_get
   */
  getNegativeKeywords(opts) {
    return this.client.getNegativeKeywords({
      advertiser_id: opts.advertiser_id,
      ...(opts.campaign_ids && { campaign_ids: opts.campaign_ids }),
      ...(opts.adgroup_ids && { adgroup_ids: opts.adgroup_ids }),
    });
  }

  /**
   * Generate a negative keyword recommendation list.
   * Combines brand protection + competitor exclusions + generic low-intent terms.
   *
   * This is a LOCAL computation — to apply, use MCP tools:
   *   mcp_tt_ads_flat_search_ad_negative_keyword_add (create)
   *   mcp_tt_ads_flat_search_ad_negative_keyword_delete (delete)
   *   mcp_tt_ads_flat_search_ad_negative_keyword_update (update)
   *
   * @param {object} opts
   * @param {string[]} [opts.brand_terms]
   * @param {string[]} [opts.competitor_terms]
   * @param {string[]} [opts.generic_exclusions]
   * @returns {{ negative_keywords: string[], categories: object, applyVia: string[] }}
   */
  generateNegativeKeywordList(opts = {}) {
    const categories = {
      brand_protection: opts.brand_terms || [],
      competitor_exclusion: opts.competitor_terms || [],
      generic_exclusions: opts.generic_exclusions || [
        "free", "cheap", "tutorial", "how to", "diy",
        "download", "crack", "hack", "pirate", "torrent",
      ],
    };

    return {
      negative_keywords: [
        ...new Set([
          ...categories.brand_protection,
          ...categories.competitor_exclusion,
          ...categories.generic_exclusions,
        ]),
      ],
      categories,
      applyVia: [
        "mcp_tt_ads_flat_search_ad_negative_keyword_add",
        "mcp_tt_ads_flat_search_ad_negative_keyword_update",
      ],
    };
  }

  // ─── Keyword Performance Analysis ───────────────────────────────

  /**
   * Analyze keyword performance from reporting API.
   * → mcp_tt_ads_flat_report_integrated_get (data_level: AUCTION_AD, CREATIVE report)
   */
  analyzeKeywordPerformance(opts) {
    return {
      call: this.client.getReport({
        advertiser_id: opts.advertiser_id,
        service_type: "AUCTION",
        report_type: "CREATIVE",
        data_level: "AUCTION_AD",
        dimensions: ["ad_id", "stat_time_day"],
        metrics: ["spend", "impressions", "clicks", "conversions", "ctr", "cpa"],
        start_date: opts.start_date,
        end_date: opts.end_date,
      }),
      postProcessing: {
        description: "Aggregate by ad_id, rank by CTR (top 5) and CPA (worst 5)",
        outputFields: ["top_performers", "low_performers"],
      },
    };
  }

  // ─── Response Processing Helpers ────────────────────────────────

  /**
   * Rank ads by CTR (descending) and CPA (descending — worst first).
   */
  static rankByPerformance(entries) {
    const topPerformers = [...entries]
      .sort((a, b) => (parseFloat(a.ctr) || 0) - (parseFloat(b.ctr) || 0))
      .reverse()
      .slice(0, 5);

    const lowPerformers = entries
      .filter((e) => e.cpa !== "N/A")
      .sort((a, b) => parseFloat(a.cpa) - parseFloat(b.cpa))
      .reverse()
      .slice(0, 5);

    return { top_performers: topPerformers, low_performers: lowPerformers };
  }

  /**
   * Filter blocklist response to find which words are blocked.
   */
  static filterBlockedWords(blocklistResponse, checkWords) {
    const blockedSet = new Set(blocklistResponse?.list || blocklistResponse || []);
    const blocked = [];
    const notBlocked = [];
    for (const word of checkWords) {
      blockedSet.has(word) ? blocked.push(word) : notBlocked.push(word);
    }
    return { blocked, notBlocked };
  }
}

module.exports = KeywordTargetingOptimizer;
