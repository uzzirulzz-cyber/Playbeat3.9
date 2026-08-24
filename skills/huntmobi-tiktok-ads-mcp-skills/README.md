# HuntMobi TikTok Ads MCP Skills

A suite of AI agent skills for TikTok advertising — automated campaign analysis, creative inventory checks, keyword optimization, and performance benchmarking. Powered by TikTok Ads MCP (384 tools, OAuth PKCE).

## Quick Start

### 1. Connect TikTok MCP

Add the TikTok Ads MCP server to any MCP-compatible client:

```
MCP Server URL: https://business-api.tiktok.com/open_mcp/tt-ads-mcp-flat
Auth Method: OAuth 2.1 PKCE (browser-based authorization)
```

**Claude Desktop** — add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "tt-ads-flat": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-oauth"],
      "env": {
        "MCP_SERVER_URL": "https://business-api.tiktok.com/open_mcp/tt-ads-mcp-flat"
      }
    }
  }
}
```

**Hermes Agent** — CLI setup:
```bash
hermes mcp add tt-ads-flat \
  --url "https://business-api.tiktok.com/open_mcp/tt-ads-mcp-flat" \
  --auth oauth
```

### 2. Verify Connection

Check that `tt-ads-flat` shows as connected with 384 tools in your MCP client.

### 3. Use the Skills

Once connected, the AI agent can execute all six skill modules automatically. Example prompts:

- "Show me last 7 days of account performance"
- "Find underperforming campaigns with high spend"
- "Check if my creative library is launch-ready"
- "Suggest keywords and targeting interests for my gaming campaign"
- "Compare my account against peer accounts"

## Target Platforms

Any MCP-compatible AI agent client, including:

| Platform | Support |
|----------|---------|
| Claude Desktop | ✅ MCP-compatible |
| Cursor / Continue | ✅ MCP-compatible |
| Hermes Agent | ✅ MCP-compatible |
| Any MCP client | ✅ Standard protocol |

## Prerequisites

- **TikTok for Business account** with advertising access
- **MCP-compatible AI agent client** (any client supporting the Model Context Protocol)
- **TikTok Ads MCP server** connected via OAuth PKCE (one-time browser authorization)
- No REST API keys, `app_secret`, or manual token management required

## Configuration

| Parameter | Default | Notes |
|-----------|---------|-------|
| `data_level` | `AUCTION_ADVERTISER` | Must use `AUCTION_` prefix |
| `metrics` | `spend, impressions, clicks, ctr, cpm, cpc` | Safe subset; add `conversions, cvr, cpa` for conversion-tracked accounts |
| `regions` (keyword) | `["US"]` | Only `["US"]` supported currently |
| `region_codes` (targeting) | required | Only `["US"]` supported currently |

## Common Issues & Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| MCP tools not appearing | Server not connected | Verify connection (e.g., `hermes mcp list`); reconnect if missing |
| `40002: data_level not acceptable` | Missing `AUCTION_` prefix | Use `AUCTION_ADVERTISER` not `ADVERTISER` |
| `40002: Invalid metric fields` | Account lacks conversion tracking | Retry with safe metric subset |
| `40002: regions required` | Missing region parameter | Add `regions: ["US"]` to keyword calls |
| `40002: region_codes required` | Missing region parameter | Add `region_codes: ["US"]` to targeting calls |
| Authorization failed | Token expired | Re-authenticate (e.g., `hermes mcp login tt-ads-flat`) |

## Limitations & Known Issues

- **Keyword search**: `tool_search_keyword_recommend` may return 0 results for accounts without Search Ads enabled or lacking search campaign history.
- **Industry benchmarks**: Peer comparison uses cross-account `report_integrated_get` aggregation, not TikTok's native `report_ad_benchmark_get` API. True industry percentile data requires future integration.
- **Identity inventory**: Some account types may return 0 identities; this is account-configuration dependent.
- **Region support**: Keyword and targeting recommendation APIs currently only support `["US"]` regions.

## Architecture

```
MCP Client (Claude Desktop / Cursor / Hermes / any MCP-compatible agent)
    ↓
TikTok Ads MCP Server (tt-ads-flat, 384 tools)
    ↓
lib/mcp-client.js           — MCP tool adapter (17 mapped tools, zero dependencies)
skills/
  access/                   — Connection check, authorized account listing
  account-insights/         — Spend reporting, trend analysis, region breakdown
  campaign-intelligence/    — Campaign tree, performance audit, Smart+ analysis
  creative-library/         — Image/video inventory, identity lookup, launch readiness
  keyword-targeting-optimizer/ — Keyword suggestions, interests, hashtags, blocked words
  benchmark-plus/           — Peer comparison, historical baseline, effect evaluation
```

## Contact

Maintained by HuntMobi. For issues, feedback, or contributions:
- GitHub: https://github.com/huntmobi/tiktok-ads-mcp-skills
