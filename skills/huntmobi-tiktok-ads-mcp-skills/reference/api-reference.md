# TikTok Ads MCP API Reference

Quick-reference for parameters common across the six skill modules.

## Known-Good Metric Combinations

### Always safe (account-agnostic)
```json
["spend", "impressions", "clicks", "ctr", "cpm", "cpc"]
```

### With conversion tracking
```json
["spend", "impressions", "clicks", "conversions", "ctr", "cvr", "cpa", "cpm", "cpc"]
```

## data_level Values

| Value | Use case |
|-------|----------|
| `AUCTION_ADVERTISER` | Account-level reports |
| `AUCTION_CAMPAIGN` | Campaign-level reports |
| `AUCTION_ADGROUP` | Ad group performance |
| `AUCTION_AD` | Individual ad performance |

Never use without the `AUCTION_` prefix (40002 error).

## Common Error Codes

| Code | Message | Fix |
|------|---------|-----|
| 40002 | data_level not acceptable | Add `AUCTION_` prefix |
| 40002 | Invalid metric fields | Remove `conversions`/`cvr`/`cpa`, retry with safe subset |
| 40002 | regions required, but missing | Pass `regions: ["US"]` to `suggestKeywords()` |
| 40002 | region_codes required | Pass `region_codes: ["US"]` to `recommendTargeting()` |
| 40105 | Access token incorrect | Re-authenticate (e.g., `hermes mcp login tt-ads-flat`) |

## Targeting API Notes

- `tool_search_keyword_recommend`: requires `search_queries` (array) + `regions` (only `["US"]` supported)
- `tool_targeting_category_recommend_get`: requires `region_codes` (only `["US"]` supported)
- `tool_search_keyword_idea_get`: uses `keywords` parameter (not `search_queries`)
- `report_ad_benchmark_get`: dimensions limited to `AD_CATEGORY`, `LOCATION`, `PLACEMENT`, `EXTERNAL_ACTION`

## MCP Tool Name Convention

All tools prefixed `mcp_tt_ads_flat_` (e.g., `mcp_tt_ads_flat_report_integrated_get`).
