---
name: tiktok-benchmark-plus
description: "Use when benchmarking TikTok ad performance — peer comparison, historical baseline analysis, before/after effect evaluation, relative performance interpretation. Multi-account MCP report aggregation."
version: 2.0.1
author: HuntMobi
license: MIT
platforms: [windows, linux, macos]

# TikTok Benchmark Plus (MCP)

## Positioning

Benchmark-enhanced comparison and effect evaluation via TikTok Ads MCP. Computes relative performance against peers, baseline, and before/after periods.

## When to Use

Trigger when the user asks any of the following (or similar):

- "How does this account compare to others?"
- "Is this CTR / CPA / CPM good or bad?"
- "Do a peer comparison / industry benchmark / 行业对比"
- "How has performance changed vs last week / last month?"
- "Evaluate the effect of that optimization / bid change"
- "Give me a benchmark-based readout"

## Core Capabilities

- Peer comparison (`compareToPeers` — parallel multi-account reports)
- Historical baseline (`compareToBaseline` — 2-period parallel reports)
- Effect evaluation (`evaluateEffect` — before/after comparison)
- Relative performance interpretation (`interpretPerformance` — pure function)
- Static computation helpers (aggregate, benchmark, verdict)

## Delivery Boundary

- Benchmark outputs depend on available account data and scenario suitability.
- Peer comparison requires the user to provide peer advertiser IDs.
- This module is an enhancement, not a guaranteed baseline capability.
- True industry-benchmark data (e.g. category percentiles) requires TikTok's native `report_ad_benchmark_get` MCP tool (not yet integrated — future roadmap).

## MCP Tools Used

| Method | MCP Tool(s) |
|--------|------------|
| compareToPeers | `mcp_tt_ads_flat_report_integrated_get` × N (target + peers) |
| compareToBaseline | `mcp_tt_ads_flat_report_integrated_get` × 2 (current + baseline) |
| evaluateEffect | `mcp_tt_ads_flat_report_integrated_get` × 2 (before + after) |
| interpretPerformance | Pure function, no MCP call |

## Verdict Logic

| Condition | Verdict |
|-----------|---------|
| CTR ↑20% + CPA ↓20% | Outperforming peers |
| Within ±20% | In line with average |
| CTR ↓20% or CPA ↑20% | Underperforming, optimize |

## Implementation

| File | Purpose |
|------|---------|
| `src/index.js` | Parallel MCP call orchestrator + static analysis functions |
| `../../lib/mcp-client.js` | Shared MCP client adapter |
