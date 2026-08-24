/**
 * TikTok Account Insights — Implementation (MCP edition)
 *
 * Provides: account-level reporting, trends, multi-account comparison,
 * region breakdowns. All data comes from MCP tools under tt-ads-flat.
 *
 * Key MCP tools used:
 *   mcp_tt_ads_flat_report_integrated_get
 *   mcp_tt_ads_flat_advertiser_info_get
 */

const { MCPClient } = require("../../../lib/mcp-client");

class AccountInsights {
  /**
   * @param {MCPClient} client
   */
  constructor(client) {
    if (!client) throw new Error("MCPClient instance is required");
    this.client = client;
  }

  // ─── Single Account Performance ─────────────────────────────────

  /**
   * Get performance overview for a single advertiser account.
   * → mcp_tt_ads_flat_report_integrated_get (data_level: AUCTION_ADVERTISER)
   *
   * @param {object} opts
   * @param {string} opts.advertiser_id
   * @param {string} opts.start_date - YYYY-MM-DD
   * @param {string} opts.end_date - YYYY-MM-DD
   * @param {string[]} [opts.metrics]
   * @returns {{ tool: string, args: object }}
   */
  getAccountPerformance(opts) {
    return this.client.getReport({
      advertiser_id: opts.advertiser_id,
      service_type: "AUCTION",
      report_type: "BASIC",
      data_level: "AUCTION_ADVERTISER",
      dimensions: ["stat_time_day"],
      metrics: opts.metrics || [
        "spend", "impressions", "clicks", "ctr", "cpm", "cpc",
      ],
      start_date: opts.start_date,
      end_date: opts.end_date,
      order_field: "stat_time_day",
      order_type: "ASC",
    });
  }

  // ─── Multi-Account Comparison ───────────────────────────────────

  /**
   * Compare performance across multiple advertiser accounts.
   * Makes parallel MCP report calls for each advertiser.
   *
   * @param {object} opts
   * @param {string[]} opts.advertiser_ids
   * @param {string} opts.start_date
   * @param {string} opts.end_date
   * @param {string[]} [opts.metrics]
   * @returns {Array<{advertiser_id, call: {tool, args}}>}
   */
  compareAccounts(opts) {
    return opts.advertiser_ids.map((id) => ({
      advertiser_id: id,
      call: this.client.getReport({
        advertiser_id: id,
        service_type: "AUCTION",
        report_type: "BASIC",
        data_level: "AUCTION_ADVERTISER",
        dimensions: ["stat_time_day"],
        metrics: opts.metrics || [
          "spend", "impressions", "clicks", "ctr", "cpm", "cpc",
        ],
        start_date: opts.start_date,
        end_date: opts.end_date,
      }),
    }));
  }

  // ─── Trend Analysis ─────────────────────────────────────────────

  /**
   * Get daily trend data with anomaly detection.
   * → mcp_tt_ads_flat_report_integrated_get (data_level: AUCTION_ADVERTISER, daily breakdown)
   *
   * @param {object} opts
   * @param {string} opts.advertiser_id
   * @param {string} opts.start_date
   * @param {string} opts.end_date
   * @param {string[]} [opts.metrics]
   * @returns {{ call: {tool, args}, anomalyConfig: object }}
   */
  getTrendAnalysis(opts) {
    return {
      call: this.client.getReport({
        advertiser_id: opts.advertiser_id,
        service_type: "AUCTION",
        report_type: "BASIC",
        data_level: "AUCTION_ADVERTISER",
        dimensions: ["stat_time_day"],
        metrics: opts.metrics || [
          "spend", "impressions", "clicks", "ctr", "cpm", "cpc",
        ],
        start_date: opts.start_date,
        end_date: opts.end_date,
        order_field: "stat_time_day",
        order_type: "ASC",
      }),
      anomalyConfig: {
        description: "Detect anomalies where daily spend deviates >2x from average",
        threshold_multiplier: 2.0,
        min_data_points: 3,
      },
    };
  }

  // ─── Region Breakdown ───────────────────────────────────────────

  /**
   * Get performance breakdown by country/region.
   * → mcp_tt_ads_flat_report_integrated_get (dimensions: country_code, stat_time_day)
   */
  getRegionBreakdown(opts) {
    return this.client.getReport({
      advertiser_id: opts.advertiser_id,
      service_type: "AUCTION",
      report_type: "BASIC",
      data_level: "AUCTION_AD",
      dimensions: ["country_code", "stat_time_day"],
      metrics: opts.metrics || [
        "spend", "impressions", "clicks", "ctr", "cpm", "cpc",
      ],
      start_date: opts.start_date,
      end_date: opts.end_date,
    });
  }

  // ─── Business Center Context ────────────────────────────────────

  /**
   * Get advertiser account info for context.
   * → mcp_tt_ads_flat_advertiser_info_get
   */
  getAccountContext(advertiser_id) {
    return this.client.getAdvertiserInfo([advertiser_id]);
  }

  // ─── Response Processing Helpers (pure functions) ───────────────

  /**
   * Aggregate daily metrics from report response.
   * Pure function — call after the Hermes agent gets MCP response.
   */
  static aggregateMetrics(list) {
    const totals = {};
    let count = 0;
    for (const item of list) {
      count++;
      for (const [key, val] of Object.entries(item.metrics || {})) {
        const num = parseFloat(val) || 0;
        totals[key] = (totals[key] || 0) + num;
      }
    }
    if (count > 0 && totals.spend > 0) {
      totals.avg_daily_spend = totals.spend / count;
    }
    return totals;
  }

  /**
   * Detect spend anomalies from trend data.
   */
  static detectAnomalies(trends) {
    if (trends.length < 3) return [];
    const spends = trends.map((t) => parseFloat(t.metrics?.spend) || 0);
    const avg = spends.reduce((a, b) => a + b, 0) / spends.length;
    const threshold = avg * 2;
    return trends
      .filter((t) => {
        const spend = parseFloat(t.metrics?.spend) || 0;
        return spend > threshold || (avg > 0 && spend < avg * 0.3);
      })
      .map((t) => ({
        date: t.date || t.dimensions?.stat_time_day,
        spend: parseFloat(t.metrics?.spend),
        avg_spend: avg.toFixed(2),
        type: parseFloat(t.metrics?.spend) > threshold ? "spike" : "drop",
      }));
  }

  /**
   * Aggregate report by country and sort by spend.
   */
  static aggregateByCountry(list) {
    const byCountry = {};
    for (const item of list) {
      const cc = item.dimensions?.country_code;
      if (!cc) continue;
      if (!byCountry[cc]) byCountry[cc] = {};
      for (const [key, val] of Object.entries(item.metrics || {})) {
        byCountry[cc][key] = (byCountry[cc][key] || 0) + parseFloat(val || 0);
      }
    }
    const regions = Object.entries(byCountry).map(([country_code, metrics]) => ({
      country_code,
      metrics,
    }));
    const sorted_by_spend = [...regions].sort(
      (a, b) => (b.metrics.spend || 0) - (a.metrics.spend || 0)
    );
    return { regions, sorted_by_spend };
  }
}

module.exports = AccountInsights;
