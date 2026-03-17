# Affiliate Check Config

Configuration for affiliate-check CLI tool.

## Binary Path

```bash
A=/usr/lib/node_modules/openclaw/skills/affiliate-skills/tools/dist/affiliate-check
```

## Quick Commands

```bash
# Search
$A search "query" --recurring --limit 10
$A search --tags ai,video --sort trending

# Discovery
$A top --sort trending
$A top --sort new

# Details
$A info <program-name>
$A compare <name1> <name2> <name3>

# Server
$A status
$A stop
```

## Environment

```bash
# Set API key for unlimited access
export AFFITOR_API_KEY=afl_...

# Get free API key: https://list.affitor.com/settings → API Keys
```

## Categories to Focus

Based on research (2026-03-17):

| Priority | Category | Top Programs |
|----------|----------|--------------|
| 1 | AI Sales Tools | Copy.ai (45%), Make (35%) |
| 2 | Video/AI | HeyGen (20%), Synthesia |
| 3 | Automation | Make (35%), Phantombuster |
| 4 | Email Marketing | GetResponse (40-60%) |

## Workflow

```
1. Research programs → programs/
2. Compare options → programs/comparisons/
3. Write content → content/
4. Build landing page → landing-pages/
5. Track results → analytics/
```

---

Created: 2026-03-17
