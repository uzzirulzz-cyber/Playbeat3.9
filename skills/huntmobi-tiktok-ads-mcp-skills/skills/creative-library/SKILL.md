---
name: tiktok-creative-library
description: "Use when managing TikTok creative assets — image/video inventory lookup, identity/creator management, launch readiness gap analysis. Parallel MCP calls for images, videos, and identities."
version: 2.0.1
author: HuntMobi
license: MIT
platforms: [windows, linux, macos]

# TikTok Creative Library (MCP)

## Positioning

Creative asset inventory and launch readiness assessment via TikTok Ads MCP. Parallel calls for images, videos, and identities.

## Core Capabilities

- Image asset lookup (`listImages`, `searchImages`)
- Video asset lookup (`listVideos`, `searchVideos`)
- Full inventory summary (`getInventorySummary` — 3 parallel MCP calls)
- Identity/creator lookup (`listIdentities`)
- Launch readiness check (`checkLaunchReadiness`)

## MCP Tools Used

| Method | MCP Tool |
|--------|----------|
| listImages / searchImages | `mcp_tt_ads_flat_file_image_ad_info_get` / `file_image_ad_search` |
| listVideos / searchVideos | `mcp_tt_ads_flat_file_video_ad_info_get` / `file_video_ad_search` |
| listIdentities | `mcp_tt_ads_flat_identity_get` |
| getInventorySummary | 3 parallel calls: images + videos + identities |
| checkLaunchReadiness | Same + threshold evaluation |

## Implementation

| File | Purpose |
|------|---------|
| `src/index.js` | Parallel MCP call generator + static format/readiness helpers |
| `../../lib/mcp-client.js` | Shared MCP client adapter |
