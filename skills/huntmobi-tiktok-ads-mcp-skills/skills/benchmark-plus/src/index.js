/**
 * TikTok Benchmark Plus — Implementation (MCP edition)
 *
 * Provides: benchmark-enhanced comparison, relative performance
 * interpretation, effect evaluation, and recommendation framing.
 *
 * Key MCP tools used:
 *   mcp_tt_ads_flat_report_integrated_get
 */

const { MCPClient } = require("../../../lib/mcp-client");

class BenchmarkPlus {
  /**
   * @param {MCPClient} client
   */
  constructor(client) {
    if (!client) throw new Error("MCPClient instance is required");
    this.client = client;
  }

  // ─── Peer Benchmark Comparison ──────────────────────────────────

  /**
   * Compare target account against peer accounts (cross-account benchmark).
   * Makes parallel report calls for target + all peers.
   *
   * @param {object} opts
   * @param {string} opts.advertiser_id - Target account
   * @param {string[]} opts.peer_ids - Peer accounts for benchmark
   * @param {string} opts.start_date
   * @param {string} opts.end_date
   * @param {string[]} [opts.metrics]
   * @returns {{ calls: Array<{account, call: {tool, args}}>, compareFn: string }}
   */
  compareToPeers(opts) {
    const metrics = opts.metrics || ["spend", "impressions", "clicks", "ctr", "cpm", "cpc"];

    const allIds = [opts.advertiser_id, ...opts.peer_ids];
    return {
      description: "Parallel reports for target + peers, then compare",
      calls: allIds.map((id) => ({
        account: id,
        role: id === opts.advertiser_id ? "target" : "peer",
        call: this.client.getReport({
          advertiser_id: id,
          service_type: "AUCTION",
          report_type: "BASIC",
          data_level: "AUCTION_ADVERTISER",
          dimensions: ["stat_time_day"],
          metrics,
          start_date: opts.start_date,
          end_date: opts.end_date,
        }),
      })),
      compareFn: "Aggregate target vs peer average → compute ratio per metric → generate verdict",
      metrics,
    };
  }

  // ─── Historical Baseline Comparison ─────────────────────────────

  /**
   * Compare current period vs historical baseline.
   * Makes 2 parallel report calls (current + baseline).
   *
   * @param {object} opts
   * @param {string} opts.advertiser_id
   * @param {string} opts.current_start
   * @param {string} opts.current_end
   * @param {string} opts.baseline_start
   * @param {string} opts.baseline_end
   * @param {string[]} [opts.metrics]
   * @returns {{ calls: Array<{period, call: {tool, args}}>, compareFn: string }}
   */
  compareToBaseline(opts) {
    const metrics = opts.metrics || ["spend", "impressions", "clicks", "ctr", "cpm", "cpc"];

    return {
      description: "Parallel reports: current period vs baseline period",
      calls: [
        {
          period: "current",
          call: this.client.getReport({
            advertiser_id: opts.advertiser_id,
            service_type: "AUCTION",
            report_type: "BASIC",
            data_level: "AUCTION_ADVERTISER",
            dimensions: ["stat_time_day"],
            metrics,
            start_date: opts.current_start,
            end_date: opts.current_end,
          }),
        },
        {
          period: "baseline",
          call: this.client.getReport({
            advertiser_id: opts.advertiser_id,
            service_type: "AUCTION",
            report_type: "BASIC",
            data_level: "AUCTION_ADVERTISER",
            dimensions: ["stat_time_day"],
            metrics,
            start_date: opts.baseline_start,
            end_date: opts.baseline_end,
          }),
        },
      ],
      compareFn: `For each metric: delta = current - baseline, delta_pct = (delta/baseline)*100, direction = up|down|flat`,
      metrics,
    };
  }

  // ─── Effect Evaluation (Before/After) ───────────────────────────

  /**
   * Evaluate effect of an optimization by comparing before vs after periods.
   * Delegates to compareToBaseline with after=current, before=baseline.
   *
   * @param {object} opts
   * @param {string} opts.advertiser_id
   * @param {string} opts.before_start
   * @param {string} opts.before_end
   * @param {string} opts.after_start
   * @param {string} opts.after_end
   * @param {string} [opts.action_description]
   * @returns {{ calls: Array, action: string, recommendationLogic: string }}
   */
  evaluateEffect(opts) {
    return {
      description: "Before/after comparison for effect evaluation",
      action: opts.action_description || "Optimization",
      calls: [
        {
          period: "before",
          call: this.client.getReport({
            advertiser_id: opts.advertiser_id,
            service_type: "AUCTION",
            report_type: "BASIC",
            data_level: "AUCTION_ADVERTISER",
            dimensions: ["stat_time_day"],
            metrics: ["spend", "impressions", "clicks", "ctr", "cpm", "cpc"],
            start_date: opts.before_start,
            end_date: opts.before_end,
          }),
        },
        {
          period: "after",
          call: this.client.getReport({
            advertiser_id: opts.advertiser_id,
            service_type: "AUCTION",
            report_type: "BASIC",
            data_level: "AUCTION_ADVERTISER",
            dimensions: ["stat_time_day"],
            metrics: ["spend", "impressions", "clicks", "ctr", "cpm", "cpc"],
            start_date: opts.after_start,
            end_date: opts.after_end,
          }),
        },
      ],
      recommendationLogic: `
        if spend↑ && cpa↓ && ctr↑ → "Positive: scale up"
        if spend↓ && cpa↓ → "Efficiency gain but volume dropped: increase budget"
        if spend↑ && cpa↑ → "Spend up but efficiency declined: review strategy"
        else → "Mixed: segment analysis needed"
      `,
    };
  }

  // ─── Relative Performance Interpretation ────────────────────────

  /**
   * Classify a metric value against a benchmark range.
   * Pure function — no API call needed.
   *
   * @param {object} opts
   * @param {number} opts.value - The metric value to evaluate
   * @param {number} opts.benchmark_avg - Benchmark average
   * @param {number} [opts.benchmark_p25] - 25th percentile
   * @param {number} [opts.benchmark_p75] - 75th percentile
   * @param {string} [opts.metric_name="metric"]
   * @param {string} [opts.direction="higher_is_better"] - "higher_is_better" | "lower_is_better"
   * @returns {{ rating: string, percentile: string, ratio: string, interpretation: string }}
   */
  interpretPerformance(opts) {
    const {
      value, benchmark_avg, benchmark_p25, benchmark_p75,
      metric_name = "metric", direction = "higher_is_better",
    } = opts;

    const ratio = benchmark_avg > 0 ? value / benchmark_avg : 0;
    let rating, percentile;

    if (ratio >= 1.5) {
      rating = direction === "higher_is_better" ? "excellent" : "poor";
      percentile = "top_10";
    } else if (ratio >= 1.2) {
      rating = direction === "higher_is_better" ? "good" : "below_avg";
      percentile = "top_25";
    } else if (ratio >= 0.8) {
      rating = "average";
      percentile = "median";
    } else if (ratio >= 0.5) {
      rating = direction === "higher_is_better" ? "below_avg" : "good";
      percentile = "bottom_25";
    } else {
      rating = direction === "higher_is_better" ? "poor" : "excellent";
      percentile = "bottom_10";
    }

    return {
      rating,
      percentile,
      ratio: ratio.toFixed(2),
      interpretation: `${metric_name}: ${value} vs benchmark ${benchmark_avg} → ${rating} (${(ratio * 100).toFixed(0)}% of benchmark)`,
    };
  }

  // ─── Response Processing Helpers ────────────────────────────────

  /**
   * Aggregate daily report list into totals.
   */
  static aggregate(list) {
    const totals = {};
    for (const item of list) {
      for (const [key, val] of Object.entries(item.metrics || {})) {
        totals[key] = (totals[key] || 0) + parseFloat(val || 0);
      }
    }
    return totals;
  }

  /**
   * Compute peer benchmark averages.
   */
  static computeBenchmark(peerReports, metrics) {
    const sums = {};
    let count = 0;
    for (const report of peerReports) {
      if (!report?.list?.length) continue;
      count++;
      const agg = BenchmarkPlus.aggregate(report.list);
      for (const m of metrics) {
        sums[m] = (sums[m] || 0) + (agg[m] || 0);
      }
    }
    const avg = {};
    for (const m of metrics) {
      avg[m] = count > 0 ? sums[m] / count : 0;
    }
    return avg;
  }

  /**
   * Compare target metrics against benchmark.
   */
  static compareMetrics(target, benchmark, metrics) {
    const result = {};
    for (const m of metrics) {
      const t = parseFloat(target[m]) || 0;
      const b = parseFloat(benchmark[m]) || 0;
      result[m] = {
        target: t.toFixed(2),
        benchmark: b.toFixed(2),
        ratio: b > 0 ? (t / b).toFixed(2) : "N/A",
        delta_pct: b > 0 ? (((t - b) / b) * 100).toFixed(1) + "%" : "N/A",
      };
    }
    return result;
  }

  /**
   * Generate verdict from peer comparison.
   */
  static generatePeerVerdict(comparison) {
    const ctrRatio = parseFloat(comparison.ctr?.ratio) || 0;
    const cpaRatio = parseFloat(comparison.cpa?.ratio) || 0;

    if (ctrRatio >= 1.2 && cpaRatio <= 0.8) return "Outperforming peers on both efficiency and engagement.";
    if (ctrRatio >= 1.0 && cpaRatio <= 1.0) return "Performance in line with peer average.";
    if (ctrRatio < 0.8 || cpaRatio > 1.2) return "Underperforming peers. Optimization recommended.";
    return "Mixed performance vs peers. Some metrics strong, others need improvement.";
  }

  /**
   * Generate verdict from period-over-period change.
   */
  static generateChangeVerdict(changes) {
    const improving = Object.values(changes).filter((c) => c.direction === "up").length;
    const declining = Object.values(changes).filter((c) => c.direction === "down").length;
    if (improving > declining * 2) return "Strong improvement vs baseline.";
    if (declining > improving * 2) return "Significant decline vs baseline. Investigation needed.";
    return "Mixed change vs baseline. Review individual metrics.";
  }

  /**
   * Compute period-over-period changes.
   */
  static computeChanges(current, baseline, metrics) {
    const changes = {};
    for (const m of metrics) {
      const cur = parseFloat(current[m]) || 0;
      const base = parseFloat(baseline[m]) || 0;
      const delta = cur - base;
      changes[m] = {
        current: cur.toFixed(2),
        baseline: base.toFixed(2),
        delta: delta.toFixed(2),
        delta_pct: base > 0 ? ((delta / base) * 100).toFixed(1) + "%" : "N/A",
        direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
      };
    }
    return changes;
  }
}

module.exports = BenchmarkPlus;
