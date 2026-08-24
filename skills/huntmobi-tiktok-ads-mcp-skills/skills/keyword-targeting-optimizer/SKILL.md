---
name: tiktok-keyword-targeting-optimizer
description: "Use when optimizing TikTok ad keyword & targeting — keyword/interests/hashtag recommendations, blocked word management, negative keywords. Uses TikTok Ads MCP native targeting tools."
version: 2.0.1
author: HuntMobi
license: MIT
platforms: [windows, linux, macos]

# TikTok Keyword & Targeting Optimizer (MCP)

## Positioning

Keyword, targeting, hashtag, and negative keyword management via TikTok Ads MCP native tools.

## Core Capabilities

- Keyword recommendations (`suggestKeywords`, `batchSuggestKeywords`)
- Interest targeting (`suggestTargetingInterests`)
- Hashtag recommendations (`suggestHashtags` — native MCP tool)
- Targeting search (`searchTargeting`)
- Blocked word management (`getBlockedWords`, `checkBlockedWords`)
- Negative keywords (`getNegativeKeywords`, `generateNegativeKeywordList`)

## MCP Tools Used

| Method | MCP Tool |
|--------|----------|
| suggestKeywords | `mcp_tt_ads_flat_tool_search_keyword_recommend` |
| suggestTargetingInterests | `mcp_tt_ads_flat_tool_targeting_category_recommend_get` |
| suggestHashtags | `mcp_tt_ads_flat_tool_hashtag_recommend_search` |
| searchTargeting | `mcp_tt_ads_flat_targeting_search` |
| getBlockedWords | `mcp_tt_ads_flat_blockedword_list_get` |
| getNegativeKeywords | `mcp_tt_ads_flat_search_ad_negative_keyword_get` |
| applyNegativeKeywords | `mcp_tt_ads_flat_search_ad_negative_keyword_add` / `update` |

## Implementation

| File | Purpose |
|------|---------|
| `src/index.js` | MCP call generator + static suggestion/ranking helpers |
| `../../lib/mcp-client.js` | Shared MCP client adapter |
