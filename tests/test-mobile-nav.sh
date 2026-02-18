#!/usr/bin/env bash
#
# test-mobile-nav.sh — Regression test for mobile navigation breakpoints
#
# Verifies that the hamburger menu, desktop nav links, and mobile menu
# behave correctly at mobile (390px), edge (1023px), and desktop (1024px)
# breakpoints using Playwright.
#
# Prerequisites: npx playwright (install browsers with: npx playwright install chromium)
#
# Usage:
#   ./tests/test-mobile-nav.sh

set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HUGO_PORT=1414
HUGO_PID=""

# ─── Colors ──────────────────────────────────────────────────────────────

if [ -t 1 ]; then
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  BOLD='\033[1m'
  DIM='\033[2m'
  RESET='\033[0m'
else
  GREEN='' RED='' BOLD='' DIM='' RESET=''
fi

# ─── State ───────────────────────────────────────────────────────────────

PASS_COUNT=0
FAIL_COUNT=0

# ─── Helpers ─────────────────────────────────────────────────────────────

pass() { ((PASS_COUNT++)) || true; echo -e "  ${GREEN}✓${RESET} $1"; }
fail() { ((FAIL_COUNT++)) || true; echo -e "  ${RED}✗${RESET} $1"; }

cleanup() {
  if [ -n "$HUGO_PID" ] && kill -0 "$HUGO_PID" 2>/dev/null; then
    kill "$HUGO_PID" 2>/dev/null || true
    wait "$HUGO_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# ─── Start Hugo ──────────────────────────────────────────────────────────

echo -e "${BOLD}Starting Hugo server on port ${HUGO_PORT}...${RESET}"
cd "$REPO_ROOT"
hugo server --port "$HUGO_PORT" --bind 127.0.0.1 --disableLiveReload >/dev/null 2>&1 &
HUGO_PID=$!

# Wait for Hugo to be ready
for i in $(seq 1 30); do
  if curl -s "http://127.0.0.1:${HUGO_PORT}/" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$HUGO_PID" 2>/dev/null; then
    echo -e "${RED}Hugo server failed to start${RESET}"
    exit 1
  fi
  sleep 0.5
done

if ! curl -s "http://127.0.0.1:${HUGO_PORT}/" >/dev/null 2>&1; then
  echo -e "${RED}Hugo server did not become ready in time${RESET}"
  exit 1
fi

echo -e "${DIM}Hugo server ready (PID: ${HUGO_PID})${RESET}"
echo ""
echo -e "${BOLD}Running mobile nav tests...${RESET}"
echo ""

# ─── Run Playwright Tests ────────────────────────────────────────────────

TEST_OUTPUT=$(HUGO_PORT="$HUGO_PORT" node "$SCRIPT_DIR/test-mobile-nav.mjs" 2>&1) || true

# Parse and display results with colors
while IFS= read -r line; do
  if [[ "$line" == PASS:* ]]; then
    pass "${line#PASS: }"
  elif [[ "$line" == FAIL:* ]]; then
    fail "${line#FAIL: }"
  elif [[ "$line" == ---* ]]; then
    echo ""
    echo -e "${BOLD}${line}${RESET}"
  fi
done <<< "$TEST_OUTPUT"

# ─── Summary ─────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}────────────────────────────────────────${RESET}"
echo -e "${BOLD}Results: ${GREEN}${PASS_COUNT} passed${RESET}, ${RED}${FAIL_COUNT} failed${RESET}"
echo -e "${BOLD}────────────────────────────────────────${RESET}"

exit "$FAIL_COUNT"
