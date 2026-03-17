#!/bin/bash
# Dashboard API - Output stats as JSON

# Gateway auth token
TOKEN="ab0a4c9aa1d286661ce7ecc9a4f0f76e50e3143e99b365ab"

# Get sessions count
SESSIONS_MAIN=$(cat /root/.openclaw/agents/main/sessions/sessions.json 2>/dev/null | jq 'keys | length' 2>/dev/null || echo 0)
SESSIONS_MEXX=$(cat /root/.openclaw/agents/mexx_01/sessions/sessions.json 2>/dev/null | jq 'keys | length' 2>/dev/null || echo 0)
TOTAL_SESSIONS=$((SESSIONS_MAIN + SESSIONS_MEXX))

# Get tokens used (approximate from last session)
TOKENS_MAIN=$(cat /root/.openclaw/agents/main/sessions/sessions.json 2>/dev/null | jq '[.[] | .totalTokens // 0] | add // 0' 2>/dev/null || echo 0)
TOKENS_MEXX=$(cat /root/.openclaw/agents/mexx_01/sessions/sessions.json 2>/dev/null | jq '[.[] | .totalTokens // 0] | add // 0' 2>/dev/null || echo 0)
TOTAL_TOKENS=$((TOKENS_MAIN + TOKENS_MEXX))

# Calculate cost (GLM-5: $0 input, $0 output - free)
# But track usage anyway
COST="0.00"

# Get gateway uptime
GATEWAY_PID=$(pgrep -f "openclaw-gateway" | head -1)
if [ -n "$GATEWAY_PID" ]; then
    UPTIME_SEC=$(ps -o etimes= -p "$GATEWAY_PID" 2>/dev/null | tr -d ' ')
    if [ "$UPTIME_SEC" -gt 3600 ]; then
        UPTIME="$((UPTIME_SEC / 3600))h"
    elif [ "$UPTIME_SEC" -gt 60 ]; then
        UPTIME="$((UPTIME_SEC / 60))m"
    else
        UPTIME="${UPTIME_SEC}s"
    fi
    STATUS="online"
else
    UPTIME="0s"
    STATUS="offline"
fi

# Get last activity
LAST_ACTIVITY=$(cat /root/.openclaw/agents/mexx_01/sessions/sessions.json 2>/dev/null | jq -r '[.[] | .updatedAt // 0] | max // 0' 2>/dev/null || echo 0)

# Get recent activities (last 10 messages)
RECENT=$(ls -t /root/.openclaw/agents/mexx_01/sessions/*.jsonl 2>/dev/null | head -1 | xargs tail -5 2>/dev/null | jq -s '[.[] | select(.type == "message") | {role: .message.role, content: (.message.content[0].text // .message.content // "") | .[0:100], time: .timestamp}] | reverse' 2>/dev/null || echo "[]")

# Output JSON
cat << EOF
{
  "status": "$STATUS",
  "sessions": $TOTAL_SESSIONS,
  "tokens": $TOTAL_TOKENS,
  "cost": "$COST",
  "uptime": "$UPTIME",
  "lastActivity": $LAST_ACTIVITY,
  "recentMessages": $RECENT,
  "agents": {
    "main": {
      "sessions": $SESSIONS_MAIN,
      "tokens": $TOKENS_MAIN
    },
    "mexx_01": {
      "sessions": $SESSIONS_MEXX,
      "tokens": $TOKENS_MEXX
    }
  },
  "timestamp": $(date +%s)000
}
EOF
