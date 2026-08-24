---
name: tiktok-access
description: "Use when connecting TikTok Ads MCP — verify MCP server status, create MCP client, list authorized ad accounts. Foundation module for the TikTok Ads MCP Skills Suite."
version: 2.0.1
author: HuntMobi
license: MIT
platforms: [windows, linux, macos]

# TikTok Access (MCP)

## Positioning

TikTok Access is the foundation module for the full skills suite — powered by TikTok Ads MCP. No app_id/secret needed. OAuth PKCE handles authentication — add the MCP server URL to any MCP-compatible client.

## Prerequisites

Add the TikTok Ads MCP server to your MCP client with OAuth PKCE authentication.

Server URL: `https://business-api.tiktok.com/open_mcp/tt-ads-mcp-flat`

## Core Capabilities

- MCP client factory (`createClient()`)
- Authorized advertiser listing (`getAuthorizedAdvertisers()`)
- Connection status check (`checkConnection()`)
- Zero-config: no app credentials, no token files

## Typical User Requests

- Set up TikTok MCP access
- Check MCP connection status
- List authorized ad accounts
- Get an MCP client for downstream skills

## Implementation

| File | Purpose |
|------|---------|
| `src/index.js` | MCP client factory + connection helpers |
| `../../lib/mcp-client.js` | MCP tool-call adapter (maps to 384 MCP tools) |

## Quick Start

```bash
# Verify connection in your MCP client
# Expected: tt-ads-flat ✓ enabled (384 tools)

# Run dry-run test
node test/live-test-mcp.js
```

## MCP Tools Used

| Operation | MCP Tool |
|-----------|----------|
| List advertisers | `mcp_tt_ads_flat_auth_advertiser_get` |
| Get advertiser info | `mcp_tt_ads_flat_advertiser_info_get` |
