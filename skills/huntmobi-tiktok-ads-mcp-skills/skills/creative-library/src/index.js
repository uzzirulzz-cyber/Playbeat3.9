/**
 * TikTok Creative Library — Implementation (MCP edition)
 *
 * Provides: image/video asset lookup, identity management,
 * inventory summaries, and launch readiness checks.
 *
 * Key MCP tools used:
 *   mcp_tt_ads_flat_file_image_ad_info_get
 *   mcp_tt_ads_flat_file_video_ad_info_get
 *   mcp_tt_ads_flat_file_image_ad_search
 *   mcp_tt_ads_flat_file_video_ad_search
 *   mcp_tt_ads_flat_identity_get
 */

const { MCPClient } = require("../../../lib/mcp-client");

class CreativeLibrary {
  /**
   * @param {MCPClient} client
   */
  constructor(client) {
    if (!client) throw new Error("MCPClient instance is required");
    this.client = client;
  }

  // ─── Image Assets ───────────────────────────────────────────────

  /**
   * List image assets → mcp_tt_ads_flat_file_image_ad_info_get
   */
  listImages(opts) {
    return this.client.searchImages({
      advertiser_id: opts.advertiser_id,
      page: opts.page || 1,
      page_size: opts.page_size || 100,
    });
  }

  // ─── Video Assets ───────────────────────────────────────────────

  /**
   * List video assets → mcp_tt_ads_flat_file_video_ad_info_get
   */
  listVideos(opts) {
    return this.client.searchVideos({
      advertiser_id: opts.advertiser_id,
      page: opts.page || 1,
      page_size: opts.page_size || 100,
    });
  }

  // ─── All Creative Assets ────────────────────────────────────────

  /**
   * List all creative assets (images + videos) in parallel.
   * Returns two MCP calls for the agent to execute.
   */
  listAllAssets(opts) {
    return {
      description: "Fetch images and videos in parallel",
      calls: [
        {
          type: "images",
          call: this.client.searchImages({
            advertiser_id: opts.advertiser_id,
            page: 1,
            page_size: 100,
          }),
        },
        {
          type: "videos",
          call: this.client.searchVideos({
            advertiser_id: opts.advertiser_id,
            page: 1,
            page_size: 100,
          }),
        },
      ],
    };
  }

  // ─── Identity / Creator Assets ──────────────────────────────────

  /**
   * List authorized content identities → mcp_tt_ads_flat_identity_get
   */
  listIdentities(advertiser_id) {
    return this.client.listIdentities({ advertiser_id });
  }

  // ─── Inventory Summary ──────────────────────────────────────────

  /**
   * Get structured inventory summary.
   * Makes parallel calls: images, videos, identities.
   *
   * @param {string} advertiser_id
   * @returns {{ calls: Array<{type, call: {tool, args}}>, postProcessing: object }}
   */
  getInventorySummary(advertiser_id) {
    return {
      description: "Get full inventory: images + videos + identities in parallel",
      calls: [
        {
          type: "images",
          call: this.client.searchImages({ advertiser_id, page: 1, page_size: 100 }),
        },
        {
          type: "videos",
          call: this.client.searchVideos({ advertiser_id, page: 1, page_size: 100 }),
        },
        {
          type: "identities",
          call: this.client.listIdentities({ advertiser_id }),
        },
      ],
      postProcessing: {
        description: "Count assets, filter recent 7d uploads, compute format breakdown",
        computeFields: ["total_images", "total_videos", "recent_uploads_7d", "identity_count", "format_breakdown"],
      },
    };
  }

  // ─── Launch Readiness Check ─────────────────────────────────────

  /**
   * Assess whether the account has enough creative assets for a new launch.
   *
   * @param {string} advertiser_id
   * @param {object} [requirements]
   * @param {number} [requirements.min_videos=3]
   * @param {number} [requirements.min_images=5]
   * @param {number} [requirements.min_identities=1]
   * @returns {{ calls: Array, thresholds: object }}
   */
  checkLaunchReadiness(advertiser_id, requirements = {}) {
    const minVideos = requirements.min_videos || 3;
    const minImages = requirements.min_images || 5;
    const minIdentities = requirements.min_identities || 1;

    return {
      description: "Check if creative inventory meets launch thresholds",
      calls: [
        {
          type: "images",
          call: this.client.searchImages({ advertiser_id, page: 1, page_size: 100 }),
        },
        {
          type: "videos",
          call: this.client.searchVideos({ advertiser_id, page: 1, page_size: 100 }),
        },
        {
          type: "identities",
          call: this.client.listIdentities({ advertiser_id }),
        },
      ],
      thresholds: {
        min_videos: minVideos,
        min_images: minImages,
        min_identities: minIdentities,
      },
      evaluateFn: `gaps.push(...) if counts below thresholds`,
    };
  }

  // ─── Response Processing Helpers ────────────────────────────────

  /**
   * Count recent uploads (last 7 days) from asset lists.
   */
  static countRecentUploads(images, videos) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const recentImages = (images || []).filter(
      (i) => new Date(i.create_time) >= sevenDaysAgo
    );
    const recentVideos = (videos || []).filter(
      (v) => new Date(v.create_time) >= sevenDaysAgo
    );
    return {
      images: recentImages.length,
      videos: recentVideos.length,
    };
  }

  /**
   * Compute video orientation breakdown.
   */
  static computeFormatBreakdown(videos) {
    const breakdown = {};
    for (const v of videos || []) {
      const orientation =
        v.width > v.height ? "landscape" :
        v.width < v.height ? "portrait" : "square";
      breakdown[orientation] = (breakdown[orientation] || 0) + 1;
    }
    return breakdown;
  }

  /**
   * Evaluate launch readiness from inventory counts.
   */
  static evaluateReadiness(counts, thresholds) {
    const gaps = [];
    if (counts.videos < thresholds.min_videos)
      gaps.push(`Need ${thresholds.min_videos - counts.videos} more videos (have ${counts.videos})`);
    if (counts.images < thresholds.min_images)
      gaps.push(`Need ${thresholds.min_images - counts.images} more images (have ${counts.images})`);
    if (counts.identities < thresholds.min_identities)
      gaps.push(`Need at least ${thresholds.min_identities} authorized identity (have ${counts.identities})`);
    return {
      ready: gaps.length === 0,
      gaps,
    };
  }
}

module.exports = CreativeLibrary;
