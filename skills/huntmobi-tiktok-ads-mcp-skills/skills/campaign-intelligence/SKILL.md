---
name: tiktok-campaign-intelligence
description: "Use when analyzing TikTok campaign/adgroup/ad structures — full campaign tree, performance analysis, high-spend/low-performance detection, Smart+ vs traditional split. Multi-step MCP pipeline."
version: 2.0.1
author: HuntMobi
license: MIT
platforms: [windows, linux, macos]

# TikTok Campaign Intelligence (MCP)

## Positioning

Campaign/adgroup/ad-level structure analysis via TikTok Ads MCP. Multi-step MCP pipeline: campaigns → adgroups → ads tree.

## Core Capabilities

- Full campaign tree (`getFullStructure` — 3-step MCP pipeline)
- Campaign detail lookup (`getCampaignDetails`)
- Performance analysis with efficiency metrics (`getPerformanceAnalysis`)
- High-spend/low-performance detection (`findHighSpendLowPerformance`)
- Smart+ vs traditional analysis (`analyzeSmartPlus`)

## MCP Tools Used

| Method | MCP Tool(s) |
|--------|------------|
| getFullStructure | `campaign_get` → `adgroup_get` → `ad_get` (sequential) |
| getCampaignDetails | `mcp_tt_ads_flat_campaign_get` |
| getPerformanceAnalysis | `mcp_tt_ads_flat_report_integrated_get` (data_level=AUCTION_CAMPAIGN) |
| findHighSpendLowPerformance | `mcp_tt_ads_flat_report_integrated_get` + filters (P75 spend, median CPA) |
| analyzeSmartPlus | `campaign_get` + `report_integrated_get` (by special_type) |

## Implementation

| File | Purpose |
|------|---------|
| `src/index.js` | MCP pipeline orchestrator + static analysis helpers |
| `../../lib/mcp-client.js` | Shared MCP client adapter |
