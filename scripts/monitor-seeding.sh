#!/usr/bin/env bash
# Monitors API template seeding — logs every 60s until seed loop exits.
LOG="/Volumes/Transcend/Local Disk/Andrew/secret-millionaire-society/.seed-monitor.log"
TERM_FILE="/Users/amr/.cursor/projects/Volumes-Transcend-Local-Disk-Andrew-secret-millionaire-society/terminals/649239.txt"
DEV_TERM="/Users/amr/.cursor/projects/Volumes-Transcend-Local-Disk-Andrew-secret-millionaire-society/terminals/163579.txt"

echo "=== seed monitor started $(date) ===" >> "$LOG"

while true; do
  TS=$(date '+%Y-%m-%d %H:%M:%S')
  SEED_RUNNING=$(pgrep -f "curl -s --max-time 1200 -X POST http://localhost:3000/api/blog/seed-recurring-templates" 2>/dev/null | wc -l | tr -d ' ')
  DEV_RUNNING=$(pgrep -f "next dev" 2>/dev/null | wc -l | tr -d ' ')
  LAST_SEED=$(grep -E '"ok":true|=== pass|error|Forbidden' "$TERM_FILE" 2>/dev/null | tail -1 | cut -c1-200)
  LAST_DEV=$(grep -E "POST /api/blog/seed|error|Error" "$DEV_TERM" 2>/dev/null | tail -1 | cut -c1-200)

  {
    echo "[$TS] seed_curl=$SEED_RUNNING dev_server=$DEV_RUNNING"
    echo "  last_seed: ${LAST_SEED:-(waiting...)}"
    echo "  last_dev:  ${LAST_DEV:-(none)}"
  } >> "$LOG"

  if grep -q "exit_code:" "$TERM_FILE" 2>/dev/null; then
    echo "[$TS] seed loop finished — monitor stopping" >> "$LOG"
    break
  fi

  sleep 60
done
