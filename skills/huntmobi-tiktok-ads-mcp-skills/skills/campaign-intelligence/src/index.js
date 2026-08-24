/**
 * TikTok Campaign Intelligence — Implementation (MCP edition)
 *
 * Provides: campaign/adgroup/ad structure lookup, performance analysis,
 * high-spend low-performance identification, Smart+ analysis.
 *
 * Key MCP tools used:
 *   mcp_tt_ads_flat_campaign_get
 *   mcp_tt_ads_flat_adgroup_get
 *   mcp_tt_ads_flat_ad_get
 *   mcp_tt_ads_flat_report_integrated_get
 */

const { MCPClient } = require("../../../lib/mcp-client");

class CampaignIntelligence {
  /**
   * @param {MCPClient} client
   */
  constructor(client) {
    if (!client) throw new Error("MCPClient instance is required");
    this.client = client;
  }

  // ─── Campaign Structure (full tree) ─────────────────────────────

  /**
   * Get full campaign → adgroup → ad tree structure.
   * Makes 3 MCP calls (campaigns, adgroups, ads) and returns a tree blueprint.
   *
   * The Hermes agent executes the calls sequentially:
   *   1. mcp_tt_ads_flat_campaign_get → extract campaign_ids
   *   2. mcp_tt_ads_flat_adgroup_get   → extract adgroup_ids
   *   3. mcp_tt_ads_flat_ad_get        → build tree
   *
   * @param {object} opts
   * @param {string} opts.advertiser_id
   * @returns {{ steps: Array<{order, description, call: {tool, args}}> }}
   */
  getFullStructure(opts) {
    return {
      description: "3-step MCP pipeline: campaigns → adgroups → ads",
      steps: [
        {
          order: 1,
          description: "Fetch all campaigns",
          call: this.client.listCampaigns({
            advertiser_id: opts.advertiser_id,
            page: 1,
            page_size: 100,
          }),
        },
        {
          order: 2,
          description: "Fetch adgroups (requires campaign_ids from step 1)",
          dependsOn: "step1.campaign_ids",
          call: this.client.listAdGroups({
            advertiser_id: opts.advertiser_id,
            page: 1,
            page_size: 100,
          }),
        },
        {
          order: 3,
          description: "Fetch ads (requires adgroup_ids from step 2)",
          dependsOn: "step2.adgroup_ids",
          call: this.client.listAds({
            advertiser_id: opts.advertiser_id,
            page: 1,
            page_size: 100,
          }),
        },
      ],
    };
  }

  // ─── Campaign Detail ────────────────────────────────────────────

  /**
   * Get detailed info for campaigns.
   * → mcp_tt_ads_flat_campaign_get
   */
  getCampaignDetails(opts) {
    return this.client.listCampaigns({
      advertiser_id: opts.advertiser_id,
      campaign_ids: opts.campaign_ids,
      page: 1,
      page_size: 100,
    });
  }

  // ─── Performance Analysis ───────────────────────────────────────

  /**
   * Analyze campaign-level performance.
   * → mcp_tt_ads_flat_report_integrated_get (data_level: AUCTION_CAMPAIGN)
   */
  getPerformanceAnalysis(opts) {
    return {
      call: this.client.getReport({
        advertiser_id: opts.advertiser_id,
        service_type: "AUCTION",
        report_type: "BASIC",
        data_level: "AUCTION_CAMPAIGN",
        dimensions: ["campaign_id", "stat_time_day"],
        metrics: [
          "spend", "impressions", "clicks", "conversions",
          "ctr", "cvr", "cpa", "cpm", "cpc",
        ],
        start_date: opts.start_date,
        end_date: opts.end_date,
        order_field: "spend",
        order_type: "DESC",
      }),
      postProcessing: {
        description: "Aggregate by campaign_id, derive CTR/CVR/CPA efficiency metrics",
        aggregateBy: "campaign_id",
        derivedMetrics: ["ctr", "cvr", "cpa"],
      },
    };
  }

  // ─── High Spend Low Performance ─────────────────────────────────

  /**
   * Identify campaigns with high spend but poor performance.
   * Algorithm: spend > P75 AND CPA > median.
   *
   * @param {object} opts (same as getPerformanceAnalysis)
   * @returns {{ call: {tool, args}, filters: object }}
   */
  findHighSpendLowPerformance(opts) {
    return {
      call: this.client.getReport({
        advertiser_id: opts.advertiser_id,
        service_type: "AUCTION",
        report_type: "BASIC",
        data_level: "AUCTION_CAMPAIGN",
        dimensions: ["campaign_id", "stat_time_day"],
        metrics: ["spend", "impressions", "clicks", "conversions", "ctr", "cpa"],
        start_date: opts.start_date,
        end_date: opts.end_date,
        order_field: "spend",
        order_type: "DESC",
      }),
      filters: {
        description: "Campaigns in top 25% spend with CPA above median",
        spendPercentileThreshold: 75,
        cpaComparison: "above_median",
      },
    };
  }

  // ─── Smart+ Analysis ────────────────────────────────────────────

  /**
   * Analyze Smart+ campaigns vs traditional campaigns.
   * Uses campaign_get to identify Smart+ (special_type field),
   * then fetches performance for both groups.
   *
   * @param {object} opts
   * @param {string} opts.advertiser_id
   * @param {string} opts.start_date
   * @param {string} opts.end_date
   * @returns {{ steps: Array<{order, description, call: {tool, args}}> }}
   */
  analyzeSmartPlus(opts) {
    return {
      description: "2-step: list campaigns → get report for Smart+ vs Traditional",
      steps: [
        {
          order: 1,
          description: "List all active/paused campaigns to identify Smart+ vs Traditional",
          call: this.client.listCampaigns({
            advertiser_id: opts.advertiser_id,
            page: 1,
            page_size: 100,
          }),
          filterLogic: "Split by campaign.special_type or campaign_type === 'SMART'",
        },
        {
          order: 2,
          description: "Fetch performance report (filter by campaign_ids from step 1)",
          call: this.client.getReport({
            advertiser_id: opts.advertiser_id,
            service_type: "AUCTION",
            report_type: "BASIC",
            data_level: "AUCTION_CAMPAIGN",
            dimensions: ["campaign_id", "stat_time_day"],
            metrics: ["spend", "impressions", "clicks", "conversions", "cpa"],
            start_date: opts.start_date,
            end_date: opts.end_date,
          }),
        },
      ],
    };
  }

  // ─── Response Processing Helpers ────────────────────────────────

  /**
   * Build campaign→adgroup→ad tree from flat API responses.
   */
  static buildTree(campaigns, adgroups, ads) {
    const adgroupMap = {};
    for (const ag of adgroups) {
      const cid = ag.campaign_id;
      if (!adgroupMap[cid]) adgroupMap[cid] = [];
      adgroupMap[cid].push(ag);
    }

    const adMap = {};
    for (const ad of ads) {
      const agid = ad.adgroup_id;
      if (!adMap[agid]) adMap[agid] = [];
      adMap[agid].push(ad);
    }

    return campaigns.map((c) => ({
      campaign: c,
      adgroups: (adgroupMap[c.campaign_id] || []).map((ag) => ({
        ...ag,
        ads: adMap[ag.adgroup_id] || [],
      })),
    }));
  }

  /**
   * Aggregate report by campaign ID, compute efficiency metrics.
   */
  static aggregateByCampaign(list) {
    const byCampaign = {};
    for (const item of list) {
      const cid = item.dimensions?.campaign_id;
      if (!cid) continue;
      if (!byCampaign[cid]) byCampaign[cid] = { spend: 0, impressions: 0, clicks: 0, conversions: 0 };
      byCampaign[cid].spend += parseFloat(item.metrics?.spend || 0);
      byCampaign[cid].impressions += parseFloat(item.metrics?.impressions || 0);
      byCampaign[cid].clicks += parseFloat(item.metrics?.clicks || 0);
      byCampaign[cid].conversions += parseFloat(item.metrics?.conversions || 0);
    }

    return Object.entries(byCampaign).map(([campaign_id, m]) => ({
      campaign_id,
      spend: m.spend,
      impressions: m.impressions,
      clicks: m.clicks,
      conversions: m.conversions,
      ctr: m.impressions > 0 ? (m.clicks / m.impressions * 100).toFixed(2) + "%" : "0%",
      cvr: m.clicks > 0 ? (m.conversions / m.clicks * 100).toFixed(2) + "%" : "0%",
      cpa: m.conversions > 0 ? (m.spend / m.conversions).toFixed(2) : "N/A",
    }));
  }

  /**
   * Filter high-spend low-performance campaigns.
   */
  static filterHighSpendLowPerf(campaigns) {
    if (campaigns.length === 0) return [];
    const spends = campaigns.map((i) => i.spend).sort((a, b) => a - b);
    const cpas = campaigns.filter((i) => i.cpa !== "N/A").map((i) => parseFloat(i.cpa)).sort((a, b) => a - b);
    const spendP75 = spends[Math.floor(spends.length * 0.75)] || 0;
    const cpaMedian = cpas.length ? cpas[Math.floor(cpas.length / 2)] : 0;

    return campaigns
      .filter((i) => i.spend >= spendP75 && i.cpa !== "N/A" && parseFloat(i.cpa) > cpaMedian)
      .map((i) => ({
        campaign_id: i.campaign_id,
        spend: i.spend.toFixed(2),
        cpa: i.cpa,
        ctr: i.ctr,
        cvr: i.cvr,
        issue: `High spend ($${i.spend.toFixed(2)}) with CPA $${i.cpa} above median ($${cpaMedian.toFixed(2)})`,
      }));
  }
}

module.exports = CampaignIntelligence;
