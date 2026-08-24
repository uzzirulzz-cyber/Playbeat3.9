---
name: huntmobi-tiktok-ads-mcp-skills
description: "Use when working with TikTok Ads platform — account insights, campaign intelligence, creative library, keyword & targeting optimization, and benchmark analysis. All data access goes through TikTok Ads MCP (384 tools, OAuth PKCE). Covers the full advertising workflow: connect → analyze → optimize → evaluate."
version: 2.0.1
author: HuntMobi
use_case: "Ads Management"
permissions:
  - campaign_management
  - reporting_analytics
license: MIT
platforms: [windows, linux, macos]
---

# HuntMobi TikTok Ads MCP Skills

TikTok advertising orchestration skills powered by **TikTok Ads MCP** (384 tools, flat transport). All data access goes through MCP — no REST API keys, no `app_secret`, no OAuth management in application code. OAuth PKCE handles authentication transparently.

## Overview

Six skill modules covering the complete TikTok advertising lifecycle, from ad account connection through campaign optimization and benchmark evaluation. Each module is an **MCP orchestration blueprint** — it generates `{ tool, args }` objects that the AI agent executes via the `tt-ads-flat` MCP server, rather than making direct HTTP calls.

```
MCP Client (Claude Desktop / Cursor / Hermes / any MCP-compatible agent)
    ↓
MCP Server: tt-ads-flat (https://business-api.tiktok.com/open_mcp/tt-ads-mcp-flat)
    ↓
lib/mcp-client.js           — MCP tool-calling adapter
skills/
  access/                   — Connection, auth check, client factory
  account-insights/         — Spend/trend/region reporting
  campaign-intelligence/    — Campaign tree, performance, Smart+ analysis
  creative-library/         — Asset inventory, identity, launch readiness
  keyword-targeting-optimizer/ — Keywords, interests, hashtags, negative KWs
  benchmark-plus/           — Peer, baseline, before/after comparison
```

## When to Use

- **Morning checks / daily patrol**: Load `account-insights` for spend overview and anomaly detection
- **Campaign audit**: Load `campaign-intelligence` for structure tree, high-spend/low-perf detection
- **Creative inventory check**: Load `creative-library` to assess launch readiness
- **Keyword expansion**: Load `keyword-targeting-optimizer` for keyword/interests/hashtag suggestions
- **Performance review**: Load `benchmark-plus` for peer comparison and effect evaluation
- **First-time setup**: Load `access` to verify MCP connection and list authorized accounts

Don't use for: direct REST API calls (deprecated), non-TikTok ad platforms, creative production workflows.

## Prerequisites

### One-time MCP setup

Add the TikTok Ads MCP server to any MCP-compatible client with OAuth PKCE authentication.

**Server URL:** `https://business-api.tiktok.com/open_mcp/tt-ads-mcp-flat`
**Auth method:** OAuth 2.1 PKCE (browser-based)

Example — Claude Desktop (`claude_desktop_config.json`):
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

Example — Hermes Agent CLI:
```bash
hermes mcp add tt-ads-flat \
  --url "https://business-api.tiktok.com/open_mcp/tt-ads-mcp-flat" \
  --auth oauth
```

After setup, verify the server shows 384 tools connected and enabled.

### Run validation test

```bash
node test/live-test-mcp.js
# Expected: PASS=37 FAIL=0
```

## Architecture

### Shared Library

| File | Role |
|------|------|
| `lib/mcp-client.js` | MCP tool-calling adapter — maps 17 MCP tools, zero external dependencies |

### MCPClient API

All six skill modules share the same `MCPClient` instance. Key methods:

| Method | MCP Tool | Category |
|--------|----------|----------|
| `getAuthorizedAdvertisers()` | `mcp_tt_ads_flat_auth_advertiser_get` | Access |
| `getAdvertiserInfo(ids)` | `mcp_tt_ads_flat_advertiser_info_get` | Access |
| `listCampaigns(params)` | `mcp_tt_ads_flat_campaign_get` | Campaign |
| `listAdGroups(params)` | `mcp_tt_ads_flat_adgroup_get` | Campaign |
| `listAds(params)` | `mcp_tt_ads_flat_ad_get` | Campaign |
| `getReport(params)` | `mcp_tt_ads_flat_report_integrated_get` | Reporting |
| `searchImages(params)` | `mcp_tt_ads_flat_file_image_ad_search` | Creative |
| `searchVideos(params)` | `mcp_tt_ads_flat_file_video_ad_search` | Creative |
| `listIdentities(params)` | `mcp_tt_ads_flat_identity_get` | Identity |
| `suggestKeywords(params)` | `mcp_tt_ads_flat_tool_search_keyword_recommend` | Targeting — requires `regions` (defaults to `["US"]`) |
| `recommendTargeting(params)` | `mcp_tt_ads_flat_tool_targeting_category_recommend_get` | Targeting — requires `region_codes` (non-empty array) |
| `recommendHashtags(params)` | `mcp_tt_ads_flat_tool_hashtag_recommend_search` | Targeting |
| `getBlockedWords(params)` | `mcp_tt_ads_flat_blockedword_list_get` | Targeting |
| `getNegativeKeywords(params)` | `mcp_tt_ads_flat_search_ad_negative_keyword_get` | Targeting |

Every method returns `{ tool: "mcp_tt_ads_flat_...", args: { ... } }` — the AI agent executes the call, not the Node.js process.

## Module Reference

### 1. Access — Connection & Authentication

**File:** `skills/access/src/index.js`

```
access.connect()
  → { client: MCPClient, advertisersCall: { tool, args } }

access.checkConnection()
  → { status, instructions, required_server: "tt-ads-flat" }
```

No credentials needed. MCP client OAuth PKCE handles the full authentication flow.

### 2. Account Insights — Reporting & Trends

**File:** `skills/account-insights/src/index.js`

| Method | Description | Data Level |
|--------|-------------|------------|
| `getAccountPerformance(opts)` | Daily spend/impressions/clicks/CTR/CPM/CPC | AUCTION_ADVERTISER |
| `compareAccounts(opts)` | Parallel reports for multiple advertisers | AUCTION_ADVERTISER |
| `getTrendAnalysis(opts)` | Daily trend + anomaly detection (2x deviation) | AUCTION_ADVERTISER |
| `getRegionBreakdown(opts)` | Performance by country_code | AUCTION_AD |
| `getAccountContext(id)` | Advertiser name, currency, timezone | N/A |

**Static helpers** for response processing:
- `AccountInsights.aggregateMetrics(list)` → totals with `avg_daily_spend`
- `AccountInsights.detectAnomalies(trends)` → spike/drop markers
- `AccountInsights.aggregateByCountry(list)` → sorted by spend

### 3. Campaign Intelligence — Structure & Performance

**File:** `skills/campaign-intelligence/src/index.js`

Three-step MCP pipeline for campaign tree:
1. `campaign_get` → extract campaign_ids
2. `adgroup_get` → extract adgroup_ids
3. `ad_get` → build tree

| Method | Description |
|--------|-------------|
| `getFullStructure(opts)` | Campaign → adgroup → ad tree (3 sequential MCP calls) |
| `getCampaignDetails(opts)` | Campaign list with filters |
| `getPerformanceAnalysis(opts)` | Spend + efficiency by campaign_id |
| `findHighSpendLowPerformance(opts)` | P75 spend + above-median CPA filter |
| `analyzeSmartPlus(opts)` | Smart+ vs Traditional split + performance |

**Static helpers:**
- `CampaignIntelligence.buildTree(campaigns, adgroups, ads)` → nested structure
- `CampaignIntelligence.aggregateByCampaign(list)` → CTR/CVR/CPA derivation
- `CampaignIntelligence.filterHighSpendLowPerf(campaigns)` → prioritized list

### 4. Creative Library — Assets & Inventory

**File:** `skills/creative-library/src/index.js`

Parallel MCP calls for inventory (images + videos + identities simultaneously).

| Method | Description |
|--------|-------------|
| `listImages(opts)` / `searchImages(opts)` | Image asset lookup |
| `listVideos(opts)` / `searchVideos(opts)` | Video asset lookup |
| `listAllAssets(opts)` | Parallel images + videos |
| `listIdentities(advertiser_id)` | Authorized content identities |
| `getInventorySummary(advertiser_id)` | Counts, recent uploads (7d), format breakdown |
| `checkLaunchReadiness(advertiser_id, reqs)` | Gaps vs thresholds (3 videos, 5 images, 1 identity) |

**Static helpers:**
- `CreativeLibrary.countRecentUploads(images, videos)` → 7d counts
- `CreativeLibrary.computeFormatBreakdown(videos)` → landscape/portrait/square
- `CreativeLibrary.evaluateReadiness(counts, thresholds)` → ready + gaps

### 5. Keyword & Targeting Optimizer

**File:** `skills/keyword-targeting-optimizer/src/index.js`

Uses TikTok's native MCP tools for keyword/interests/hashtag/blocked word management.

**Key parameters:**

| Method | Required | Optional | Notes |
|--------|----------|----------|-------|
| `suggestKeywords(opts)` | `advertiser_id`, `keyword` | `regions` (default `["US"]`), `limit`, `language` | `keyword` is mapped to `search_queries` array |
| `suggestTargetingInterests(opts)` | `advertiser_id`, `region_codes` | `app_id` | `region_codes` only supports `["US"]` currently |
| `suggestHashtags(opts)` | `advertiser_id`, `keyword` | `limit` | Uses native MCP hashtag tool |

**Method reference:**

| Method | Description |
|--------|-------------|
| `suggestKeywords(opts)` | Keyword recommendations from seed |
| `batchSuggestKeywords(opts)` | Parallel seeds (up to 10) |
| `suggestTargetingInterests(opts)` | Interest recommendations by objective |
| `suggestHashtags(opts)` | Hashtag recommendations (native MCP tool) |
| `searchTargeting(opts)` | Targeting/location search |
| `getBlockedWords(opts)` | Blocked word list for account |
| `checkBlockedWords(opts)` | Check specific words against blocklist |
| `getNegativeKeywords(opts)` | Existing negative keywords |
| `generateNegativeKeywordList(opts)` | LOCAL recommendation list (apply via `search_ad_negative_keyword_add`) |
| `analyzeKeywordPerformance(opts)` | Ad-level keyword performance ranking |

### 6. Benchmark Plus — Comparison & Evaluation

**File:** `skills/benchmark-plus/src/index.js`

| Method | MCP Calls | Description |
|--------|-----------|-------------|
| `compareToPeers(opts)` | N parallel reports | Target vs peer account averages |
| `compareToBaseline(opts)` | 2 parallel reports | Current period vs historical baseline |
| `evaluateEffect(opts)` | 2 parallel reports | Before/after optimization assessment |
| `interpretPerformance(opts)` | 0 (pure function) | Classify metric value (excellent→poor) |

**Verdict logic:**

| CTR vs Peers | CPA vs Peers | Verdict |
|-------------|-------------|---------|
| ≥1.2x | ≤0.8x | Outperforming peers |
| ≥1.0x | ≤1.0x | In line with average |
| <0.8x or >1.2x | — | Underperforming — optimize |

**Static helpers:**
- `BenchmarkPlus.aggregate(list)` → totals
- `BenchmarkPlus.computeBenchmark(reports, metrics)` → peer averages
- `BenchmarkPlus.compareMetrics(target, benchmark, metrics)` → ratios
- `BenchmarkPlus.generatePeerVerdict(comparison)` → text verdict
- `BenchmarkPlus.generateChangeVerdict(changes)` → period-over-period verdict
- `BenchmarkPlus.computeChanges(current, baseline, metrics)` → delta analysis

## Integration Test

Run the MCP integration test to validate all tool call generation:

```bash
node test/live-test-mcp.js
```

Output (37 tests across 6 phases):

```
Phase 0: Access              2 OK
Phase 1: Advertiser Info     1 OK
Phase 2: Account Insights    4 OK
Phase 3: Campaign Intelligence 8 OK (multi-step pipelines)
Phase 4: Creative Library    8 OK (parallel calls)
Phase 5: Keyword & Targeting 7 OK
Phase 6: Benchmark Plus      5 OK
Static Helpers               2 OK
─────────────────────────────────
Results: PASS=37 FAIL=0
```

## Common Pitfalls

> **Note:** Commands below use Hermes Agent CLI as examples. Substitute `hermes mcp list` / `hermes mcp add` / `hermes mcp login` with your MCP client's equivalent operations (e.g., check `mcpServers` in `claude_desktop_config.json` for Claude Desktop).

1. **MCP tools not appearing after setup.** Verify connection (e.g., `hermes mcp list` → `tt-ads-flat ✓ enabled`). If not, ensure the server is configured and restart the session. MCP tools are discovered at session startup.

2. **"Authorization service temporarily unavailable"** on the layered endpoint (`tt-ads-mcp-layer`). Use the **flat** endpoint instead: `https://business-api.tiktok.com/open_mcp/tt-ads-mcp-flat`. The flat endpoint provides all 384 tools in one initialization.

3. **MCPClient returns `{ tool, args }` objects, not data.** This is intentional. The skills are **orchestration blueprints** — the AI agent executes the tool calls. For standalone dry-run testing, use `test/live-test-mcp.js`.

4. **Node.js scripts cannot execute MCP tools directly.** MCP tools run through the AI agent's tool loop. When using these skills, the AI agent reads the skill blueprint and calls MCP tools directly, bypassing Node.js execution.

5. **Date parameters must be strings in YYYY-MM-DD format.** The `MCPClient.getReport()` method validates this strictly. Use `daysAgo(n)` helper: `const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); }`.

6. **`data_level` must use the `AUCTION_` prefix.** TikTok MCP requires `AUCTION_ADVERTISER` (not `ADVERTISER`), `AUCTION_CAMPAIGN` (not `CAMPAIGN`), etc. The skill modules use `AUCTION_ADVERTISER` as the default for account-level reports. If you get `40002: "one or more value of the param is not acceptable"`, prefix the value with `AUCTION_`.

7. **Not all metrics are available for every account.** Default metrics in `lib/mcp-client.js` and skill modules use the safe subset: `spend`, `impressions`, `clicks`, `ctr`, `cpm`, `cpc`. If you need `conversions`, `cvr`, or `cpa`, pass them explicitly via `opts.metrics` — but be aware they may be rejected (code 40002) for accounts that don't support conversion tracking.

8. **Keyword and targeting APIs require region parameters.** `suggestKeywords()` requires `regions` (defaults to `["US"]`) — without it you get `40002: "regions" is required, but missing"`. `recommendTargeting()` requires `region_codes` as a non-empty array (e.g. `["US"]`). Currently only `["US"]` is supported for both. If `suggestKeywords` returns 0 results with valid parameters, the account may not have Search Ads enabled or lack search campaign history.

## Migration from REST Edition

| REST (v1) | MCP (v2) | Notes |
|-----------|----------|-------|
| `const client = new TikTokClient({ accessToken })` | `const client = new MCPClient()` | No token needed |
| `client.http.get('/campaign/get/', ...)` | `client.listCampaigns(...)` → `{ tool, args }` | MCP tool call object |
| `require('../../../lib/auth')` | Removed | OAuth PKCE handles authentication |
| `npm install` (axios dependency) | No deps needed | Pure Node.js built-ins |
| `TIKTOK_ACCESS_TOKEN` env var | MCP client OAuth setup | One-time browser auth |
| File-based `tokens.json` | MCP credential store | Auto-refresh |

## Verification Checklist

- [ ] `tt-ads-flat` MCP server connected and enabled (384 tools)
- [ ] `node test/live-test-mcp.js` passes all 37 tests
- [ ] `lib/mcp-client.js` can be `require()`d without errors
- [ ] All six skill modules can be instantiated: `new AccountInsights(client)`, `new CampaignIntelligence(client)`, etc.
- [ ] `access.connect()` returns a valid `MCPClient` instance
- [ ] MCP tool names follow the `mcp_tt_ads_flat_*` prefix convention
- [ ] Static helper functions produce correct output with mock data
- [ ] Date validation in `getReport()` rejects non-YYYY-MM-DD strings

## References

- `reference/api-reference.md` — Known-good parameters, error codes, data_level values, and targeting API notes.

## Version History

### v2.0.1
- Added `use_case` and `permissions` to frontmatter for TikTok platform compliance
- Removed client-specific metadata; skill now documents multi-client support (Claude Desktop, Cursor, Hermes)
- Added Claude Desktop configuration example alongside Hermes CLI in Prerequisites
- Restructured README: Quick Start first, dual Troubleshooting with concrete commands
- Added `reference/api-reference.md` with known-good parameters and error codes
- benchmark-plus SKILL.md: added When to Use triggers and Delivery Boundary
- Fixed `suggestKeywords()`: added required `regions` parameter (default `["US"]`) and corrected `keyword`→`search_queries` mapping

### v2.0.0
- Initial MCP release. Migrated from REST (TikTokClient) to MCP (MCPClient). Six skill modules, zero external dependencies, 384 MCP tools.
