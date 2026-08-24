---
name: tiktok-account-insights
description: "Use when analyzing TikTok ad account performance — daily spend/impressions/clicks, trend analysis with anomaly detection, multi-account comparison, region breakdowns. Powered by TikTok Ads MCP."
version: 2.0.1
author: HuntMobi
license: MIT
platforms: [windows, linux, macos]

# TikTok Account Insights (MCP)

## Positioning

Account-level reporting module powered by TikTok Ads MCP. Covers spend, exposure, click, efficiency, and trend analysis via `mcp_tt_ads_flat_report_integrated_get`.

## Core Capabilities

- Single-account performance overview (`getAccountPerformance`)
- Multi-account comparison (`compareAccounts`)
- Daily trend analysis with anomaly detection (`getTrendAnalysis`)
- Region-based breakdowns (`getRegionBreakdown`)
- Static helper functions for response processing

## MCP Tools Used

| Method | MCP Tool | Key Params |
|--------|----------|------------|
| getAccountPerformance | `mcp_tt_ads_flat_report_integrated_get` | data_level=AUCTION_ADVERTISER, dimensions=[stat_time_day] |
| compareAccounts | `mcp_tt_ads_flat_report_integrated_get` | Parallel calls per advertiser |
| getTrendAnalysis | `mcp_tt_ads_flat_report_integrated_get` | Same as above + anomaly detection config |
| getRegionBreakdown | `mcp_tt_ads_flat_report_integrated_get` | dimensions=[country_code, stat_time_day] |
| getAccountContext | `mcp_tt_ads_flat_advertiser_info_get` | advertiser_ids=[id] |

## Implementation

| File | Purpose |
|------|---------|
| `src/index.js` | MCP tool-call generator + static data processing helpers |
| `../../lib/mcp-client.js` | Shared MCP client adapter |
