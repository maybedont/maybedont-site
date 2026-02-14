#!/usr/bin/env bash
#
# test-get-started.sh — Integration test for the get-started documentation
#
# Validates installation and startup steps in an isolated /tmp environment.
# Nothing touches ~/.config, ~/.local, or ~/.cache.
#
# Usage:
#   ./tests/test-get-started.sh           # Run all tests
#   ./tests/test-get-started.sh binary    # Binary download only
#   ./tests/test-get-started.sh docker    # Docker only
#   ./tests/test-get-started.sh homebrew  # Homebrew only

set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Read version from the site's single source of truth
VERSION=$(grep '^version:' "$REPO_ROOT/data/product.yaml" | awk '{print $2}')
VERSION_NUM="${VERSION#v}"

DOCKER_IMAGE="ghcr.io/maybedont/maybe-dont:${VERSION}"
DOWNLOAD_BASE="https://github.com/maybedont/releases/releases/download/${VERSION}"

STARTUP_TIMEOUT=15
PORT_TIMEOUT=10

# ─── State ───────────────────────────────────────────────────────────────

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

TEST_DIR=""
GATEWAY_PID=""
DOCKER_CONTAINERS=()

# ─── Colors ──────────────────────────────────────────────────────────────

if [ -t 1 ]; then
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  YELLOW='\033[1;33m'
  BOLD='\033[1m'
  DIM='\033[2m'
  RESET='\033[0m'
else
  GREEN='' RED='' YELLOW='' BOLD='' DIM='' RESET=''
fi

# ─── Output helpers ──────────────────────────────────────────────────────

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf "  ${GREEN}[PASS]${RESET} %s\n" "$1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf "  ${RED}[FAIL]${RESET} %s\n" "$1"
  if [ -n "${2:-}" ]; then
    printf "         ${DIM}%s${RESET}\n" "$2"
  fi
}

skip() {
  SKIP_COUNT=$((SKIP_COUNT + 1))
  printf "  ${YELLOW}[SKIP]${RESET} %s\n" "$1"
}

section() {
  printf "\n${BOLD}=== %s ===${RESET}\n" "$1"
}

info() {
  printf "  ${DIM}%s${RESET}\n" "$1"
}

# ─── Platform detection ──────────────────────────────────────────────────

detect_platform() {
  local os arch
  case "$(uname -s)" in
    Darwin) os="darwin" ;;
    Linux)  os="linux" ;;
    *)      printf "${RED}Unsupported OS: %s${RESET}\n" "$(uname -s)"; exit 1 ;;
  esac
  case "$(uname -m)" in
    arm64|aarch64) arch="arm64" ;;
    x86_64)        arch="x86_64" ;;
    i386|i686)     arch="i386" ;;
    *)             printf "${RED}Unsupported arch: %s${RESET}\n" "$(uname -m)"; exit 1 ;;
  esac
  echo "${os} ${arch}"
}

# ─── Helpers ─────────────────────────────────────────────────────────────

wait_for_port() {
  local port=$1 timeout=${2:-$PORT_TIMEOUT}
  local attempts=$((timeout * 2))
  local i=0
  while ! nc -z 127.0.0.1 "$port" 2>/dev/null; do
    sleep 0.5
    i=$((i + 1))
    if [ "$i" -ge "$attempts" ]; then
      return 1
    fi
  done
  return 0
}

wait_for_file() {
  local file=$1 timeout=${2:-$STARTUP_TIMEOUT}
  local attempts=$((timeout * 2))
  local i=0
  while [ ! -f "$file" ]; do
    sleep 0.5
    i=$((i + 1))
    if [ "$i" -ge "$attempts" ]; then
      return 1
    fi
  done
  return 0
}

check_port_free() {
  if nc -z 127.0.0.1 "$1" 2>/dev/null; then
    fail "Port $1 already in use — cannot start gateway"
    return 1
  fi
  return 0
}

stop_gateway() {
  if [ -n "$GATEWAY_PID" ] && kill -0 "$GATEWAY_PID" 2>/dev/null; then
    kill "$GATEWAY_PID" 2>/dev/null || true
    wait "$GATEWAY_PID" 2>/dev/null || true
  fi
  GATEWAY_PID=""
}

stop_docker_containers() {
  for cid in "${DOCKER_CONTAINERS[@]:-}"; do
    [ -n "$cid" ] && docker rm -f "$cid" >/dev/null 2>&1 || true
  done
  DOCKER_CONTAINERS=()
}

# Patch the bootstrapped config for testing:
#   1. Add a dummy downstream MCP server (required by gateway)
#   2. Switch server type from stdio to http with listen_addr
#   3. Disable AI validation (CEL-only, no API key needed)
#
# Uses exact string matches against the known default config. If the default
# config format changes, these will fail — which is a useful signal that the
# get-started docs may also need updating.
patch_config() {
  local config_file=$1
  python3 -c "
import re, sys

path = sys.argv[1]
with open(path) as f:
    text = f.read()

# 1. Replace downstream_mcp_servers comment block with a dummy HTTP server.
#    HTTP type uses lazy initialization so the gateway starts without blocking.
text = re.sub(
    r'(downstream_mcp_servers:)\n(  #[^\n]*\n)*',
    r'\1\n  test-dummy:\n    type: http\n    url: \"http://localhost:19999\"\n\n',
    text,
    count=1
)

# 2. Switch server to HTTP mode
text = text.replace(
    'type: stdio  # stdio, http, sse',
    'type: http'
)
text = text.replace(
    '# listen_addr: \"127.0.0.1:8080\"  # Required for http/sse',
    'listen_addr: \"127.0.0.1:8080\"'
)

# 3. Disable AI validation in all sections
text = re.sub(r'(  ai:\n\s+enabled:) true', r'\1 false', text)

# 4. Disable audit_report native tool (requires AI API key even when ai.enabled=false)
text = text.replace(
    'audit_report:\n    enabled: true',
    'audit_report:\n    enabled: false'
)

with open(path, 'w') as f:
    f.write(text)
" "$config_file"
}

assert_config_files_exist() {
  local config_dir=$1
  local expected=(
    maybe-dont.yaml
    cel_request_rules.yaml
    ai_request_rules.yaml
    cel_response_rules.yaml
    ai_response_rules.yaml
  )
  local missing=()
  for f in "${expected[@]}"; do
    if [ ! -f "$config_dir/$f" ]; then
      missing+=("$f")
    fi
  done
  if [ ${#missing[@]} -eq 0 ]; then
    pass "Bootstrap created all config files"
  else
    fail "Missing config files: ${missing[*]}"
  fi
}

# Run the standard gateway test sequence: start, curl, audit log, stop.
# Expects XDG env vars and the binary path (or "maybe-dont" for PATH lookup).
run_gateway_tests() {
  local label=$1 binary=$2 config_dir=$3 state_dir=$4 cache_dir=$5 log_file=$6

  check_port_free 8080 || return

  info "Starting gateway ($label)..."
  OPENAI_API_KEY="" XDG_CONFIG_HOME="$config_dir" XDG_STATE_HOME="$state_dir" XDG_CACHE_HOME="$cache_dir" \
    "$binary" gateway start > "$log_file" 2>&1 &
  GATEWAY_PID=$!

  if wait_for_port 8080 "$PORT_TIMEOUT"; then
    sleep 0.5  # let HTTP handler fully initialize
    pass "Gateway started on port 8080 ($label)"
  else
    fail "Gateway did not start ($label)" "Port 8080 not listening within ${PORT_TIMEOUT}s"
    [ -f "$log_file" ] && info "Log tail: $(tail -3 "$log_file")"
    stop_gateway
    return
  fi

  # MCP session: initialize, then tools/list
  # The gateway requires a proper MCP session (initialize → notifications/initialized → request).
  local headers_file="$log_file.headers"

  # Step 1: Initialize session
  local init_response
  init_response=$(curl -s -D "$headers_file" -X POST http://localhost:8080/mcp \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}')

  local session_id
  session_id=$(grep -i 'mcp-session-id' "$headers_file" 2>/dev/null | awk '{print $2}' | tr -d '\r\n' || true)

  if [ -n "$session_id" ]; then
    pass "MCP session initialized ($label)"
  else
    fail "MCP initialize did not return session ID ($label)" "${init_response:0:200}"
    stop_gateway
    return
  fi

  # Step 2: Send initialized notification
  curl -s -X POST http://localhost:8080/mcp \
    -H "Content-Type: application/json" \
    -H "Mcp-Session-Id: $session_id" \
    -d '{"jsonrpc":"2.0","method":"notifications/initialized"}' >/dev/null 2>&1
  sleep 0.5

  # Step 3: tools/list — matches the verification step in the docs
  local response
  response=$(curl -s -X POST http://localhost:8080/mcp \
    -H "Content-Type: application/json" \
    -H "Mcp-Session-Id: $session_id" \
    -d '{"jsonrpc":"2.0","method":"tools/list","id":2}')
  if echo "$response" | grep -q '"tools"'; then
    pass "/mcp tools/list returns tools ($label)"
  else
    fail "/mcp tools/list unexpected response ($label)" "${response:0:200}"
  fi

  # State directory should exist (audit log writes here when proxied calls occur)
  if [ -d "$state_dir/maybe-dont" ]; then
    pass "State directory exists ($label)"
  else
    fail "State directory missing ($label)" "Expected at: $state_dir/maybe-dont"
  fi

  stop_gateway
}

# ─── Cleanup ─────────────────────────────────────────────────────────────

cleanup() {
  stop_gateway
  stop_docker_containers
  if [ -n "$TEST_DIR" ] && [ -d "$TEST_DIR" ]; then
    rm -rf "$TEST_DIR"
  fi
}
trap cleanup EXIT INT TERM

# ─── Test: Binary Download ───────────────────────────────────────────────

test_binary() {
  section "Binary Download Tests"

  local test_dir="$TEST_DIR/binary"
  local config_dir="$test_dir/xdg-config"
  local state_dir="$test_dir/xdg-state"
  local cache_dir="$test_dir/xdg-cache"
  local bin_dir="$test_dir/bin"
  mkdir -p "$config_dir" "$state_dir" "$cache_dir" "$bin_dir"

  # Detect platform and build download URL
  read -r os arch <<< "$(detect_platform)"
  local filename="maybe-dont_${VERSION_NUM}_${os}_${arch}.tar.gz"
  local url="${DOWNLOAD_BASE}/${filename}"
  local sha_url="${url}.sha256"

  # Download
  info "Downloading ${filename}..."
  local http_code
  http_code=$(curl -sL -w "%{http_code}" -o "$bin_dir/$filename" "$url")
  if [ "$http_code" = "200" ]; then
    pass "Downloaded $filename"
  else
    fail "Download failed (HTTP $http_code)" "$url"
    return
  fi

  # Verify SHA256
  local expected_sha actual_sha
  expected_sha=$(curl -sL "$sha_url" | awk '{print $1}')
  actual_sha=$(shasum -a 256 "$bin_dir/$filename" | awk '{print $1}')
  if [ -n "$expected_sha" ] && [ "$expected_sha" = "$actual_sha" ]; then
    pass "SHA256 checksum verified"
  else
    fail "SHA256 mismatch" "expected=${expected_sha:-empty} actual=$actual_sha"
    return
  fi

  # Extract — archive contains a subdirectory, so strip it
  tar -xzf "$bin_dir/$filename" -C "$bin_dir" --strip-components=1
  if [ -x "$bin_dir/maybe-dont" ]; then
    pass "Binary extracted and executable"
  else
    fail "Binary not found or not executable after extraction"
    return
  fi

  # ── First Run (bootstrap defaults) ──
  info "Bootstrapping defaults..."
  XDG_CONFIG_HOME="$config_dir" XDG_STATE_HOME="$state_dir" XDG_CACHE_HOME="$cache_dir" \
    "$bin_dir/maybe-dont" gateway start > "$test_dir/bootstrap.log" 2>&1 &
  GATEWAY_PID=$!

  if wait_for_file "$config_dir/maybe-dont/maybe-dont.yaml" "$STARTUP_TIMEOUT"; then
    sleep 1  # let remaining files finish writing
    stop_gateway
    assert_config_files_exist "$config_dir/maybe-dont"
  else
    stop_gateway
    fail "Bootstrap timed out — config files not created within ${STARTUP_TIMEOUT}s"
    [ -f "$test_dir/bootstrap.log" ] && info "Log tail: $(tail -3 "$test_dir/bootstrap.log")"
    return
  fi

  # ── gateway config info ──
  local config_info
  config_info=$(XDG_CONFIG_HOME="$config_dir" XDG_STATE_HOME="$state_dir" XDG_CACHE_HOME="$cache_dir" \
    "$bin_dir/maybe-dont" gateway config info 2>&1) || true
  if echo "$config_info" | grep -q "$config_dir"; then
    pass "gateway config info shows correct paths"
  else
    fail "gateway config info unexpected output" "$config_info"
  fi

  # ── Configure (disable AI → CEL-only) ──
  patch_config "$config_dir/maybe-dont/maybe-dont.yaml"
  if grep -q "enabled: false" "$config_dir/maybe-dont/maybe-dont.yaml" \
     && grep -q "type: http" "$config_dir/maybe-dont/maybe-dont.yaml" \
     && grep -q "test-dummy:" "$config_dir/maybe-dont/maybe-dont.yaml"; then
    pass "Config patched (HTTP mode, dummy downstream, AI disabled)"
  else
    fail "Config patch failed — check patch_config against default config format"
    return
  fi

  # ── Start / Verify ──
  run_gateway_tests "binary" "$bin_dir/maybe-dont" "$config_dir" "$state_dir" "$cache_dir" "$test_dir/gateway.log"
}

# ─── Test: Docker ────────────────────────────────────────────────────────

test_docker() {
  section "Docker Tests"

  if ! command -v docker &>/dev/null; then
    skip "Docker not installed"
    return
  fi
  if ! docker info &>/dev/null 2>&1; then
    skip "Docker daemon not running"
    return
  fi

  local test_dir="$TEST_DIR/docker"
  local config_dir="$test_dir/xdg-config"
  local state_dir="$test_dir/xdg-state"
  mkdir -p "$config_dir/maybe-dont" "$state_dir/maybe-dont"

  # ── Pull image ──
  info "Pulling ${DOCKER_IMAGE}..."
  if docker pull "$DOCKER_IMAGE" >/dev/null 2>&1; then
    pass "Pulled Docker image"
  else
    fail "Docker pull failed" "$DOCKER_IMAGE"
    return
  fi

  # ── First Run (bootstrap defaults) ──
  # Matches the documented "First Run > Docker" command, but with our temp dirs.
  info "Bootstrapping defaults via Docker..."
  local bootstrap_cid
  bootstrap_cid=$(docker run -d \
    --name "maybedont-test-bootstrap-$$" \
    -e XDG_CONFIG_HOME=/config \
    -e XDG_STATE_HOME=/state \
    -v "$config_dir/maybe-dont:/config/maybe-dont" \
    -v "$state_dir/maybe-dont:/state/maybe-dont" \
    "$DOCKER_IMAGE")
  DOCKER_CONTAINERS+=("$bootstrap_cid")

  if wait_for_file "$config_dir/maybe-dont/maybe-dont.yaml" "$STARTUP_TIMEOUT"; then
    sleep 1
    docker stop "$bootstrap_cid" >/dev/null 2>&1 || true
    assert_config_files_exist "$config_dir/maybe-dont"
  else
    info "Container logs:"
    docker logs "$bootstrap_cid" 2>&1 | tail -5 | while read -r line; do info "  $line"; done
    docker stop "$bootstrap_cid" >/dev/null 2>&1 || true
    fail "Docker bootstrap timed out — config files not created within ${STARTUP_TIMEOUT}s"
    return
  fi

  # ── Configure (disable AI → CEL-only) ──
  patch_config "$config_dir/maybe-dont/maybe-dont.yaml"
  if grep -q "enabled: false" "$config_dir/maybe-dont/maybe-dont.yaml" \
     && grep -q "type: http" "$config_dir/maybe-dont/maybe-dont.yaml" \
     && grep -q "test-dummy:" "$config_dir/maybe-dont/maybe-dont.yaml"; then
    pass "Config patched (HTTP mode, dummy downstream, AI disabled)"
  else
    fail "Config patch failed — check patch_config against default config format"
    return
  fi

  # ── Start gateway ──
  check_port_free 8080 || return

  info "Starting gateway via Docker..."
  local run_cid
  run_cid=$(docker run -d \
    --name "maybedont-test-run-$$" \
    -e OPENAI_API_KEY="" \
    -e XDG_CONFIG_HOME=/config \
    -e XDG_STATE_HOME=/state \
    -e MAYBE_DONT_SERVER_LISTEN_ADDR=0.0.0.0:8080 \
    -v "$config_dir/maybe-dont:/config/maybe-dont" \
    -v "$state_dir/maybe-dont:/state/maybe-dont" \
    -p 8080:8080 \
    "$DOCKER_IMAGE")
  DOCKER_CONTAINERS+=("$run_cid")

  if wait_for_port 8080 "$PORT_TIMEOUT"; then
    sleep 0.5  # let HTTP handler fully initialize
    pass "Gateway started on port 8080 (Docker)"
  else
    fail "Docker gateway did not start — port 8080 not listening within ${PORT_TIMEOUT}s"
    info "Container logs:"
    docker logs "$run_cid" 2>&1 | tail -5 | while read -r line; do info "  $line"; done
    return
  fi

  # ── Verify (MCP session flow) ──
  local headers_file="$test_dir/docker-headers.txt"
  local init_response
  init_response=$(curl -s -D "$headers_file" -X POST http://localhost:8080/mcp \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}},"id":1}')

  local session_id
  session_id=$(grep -i 'mcp-session-id' "$headers_file" 2>/dev/null | awk '{print $2}' | tr -d '\r\n' || true)

  if [ -n "$session_id" ]; then
    pass "MCP session initialized (Docker)"
  else
    fail "MCP initialize did not return session ID (Docker)" "${init_response:0:200}"
    docker stop "$run_cid" >/dev/null 2>&1 || true
    return
  fi

  curl -s -X POST http://localhost:8080/mcp \
    -H "Content-Type: application/json" \
    -H "Mcp-Session-Id: $session_id" \
    -d '{"jsonrpc":"2.0","method":"notifications/initialized"}' >/dev/null 2>&1
  sleep 0.5

  local response
  response=$(curl -s -X POST http://localhost:8080/mcp \
    -H "Content-Type: application/json" \
    -H "Mcp-Session-Id: $session_id" \
    -d '{"jsonrpc":"2.0","method":"tools/list","id":2}')
  if echo "$response" | grep -q '"tools"'; then
    pass "/mcp tools/list returns tools (Docker)"
  else
    fail "/mcp tools/list unexpected response (Docker)" "${response:0:200}"
  fi

  if [ -d "$state_dir/maybe-dont" ]; then
    pass "State directory exists (Docker)"
  else
    fail "State directory missing (Docker)" "Expected at: $state_dir/maybe-dont"
  fi

  docker stop "$run_cid" >/dev/null 2>&1 || true
}

# ─── Test: Homebrew ──────────────────────────────────────────────────────

test_homebrew() {
  section "Homebrew Tests"

  if ! command -v maybe-dont &>/dev/null; then
    skip "maybe-dont not on PATH (install via: brew install maybedont/tap/maybe-dont)"
    return
  fi

  local installed_path
  installed_path=$(command -v maybe-dont)
  info "Using: $installed_path"

  local test_dir="$TEST_DIR/homebrew"
  local config_dir="$test_dir/xdg-config"
  local state_dir="$test_dir/xdg-state"
  local cache_dir="$test_dir/xdg-cache"
  mkdir -p "$config_dir" "$state_dir" "$cache_dir"

  # ── First Run (bootstrap defaults) ──
  info "Bootstrapping defaults..."
  XDG_CONFIG_HOME="$config_dir" XDG_STATE_HOME="$state_dir" XDG_CACHE_HOME="$cache_dir" \
    maybe-dont gateway start > "$test_dir/bootstrap.log" 2>&1 &
  GATEWAY_PID=$!

  if wait_for_file "$config_dir/maybe-dont/maybe-dont.yaml" "$STARTUP_TIMEOUT"; then
    sleep 1
    stop_gateway
    assert_config_files_exist "$config_dir/maybe-dont"
  else
    stop_gateway
    fail "Bootstrap timed out — config files not created within ${STARTUP_TIMEOUT}s"
    [ -f "$test_dir/bootstrap.log" ] && info "Log tail: $(tail -3 "$test_dir/bootstrap.log")"
    return
  fi

  # ── gateway config info ──
  local config_info
  config_info=$(XDG_CONFIG_HOME="$config_dir" XDG_STATE_HOME="$state_dir" XDG_CACHE_HOME="$cache_dir" \
    maybe-dont gateway config info 2>&1) || true
  if echo "$config_info" | grep -q "$config_dir"; then
    pass "gateway config info shows correct paths"
  else
    fail "gateway config info unexpected output" "$config_info"
  fi

  # ── Configure (disable AI → CEL-only) ──
  patch_config "$config_dir/maybe-dont/maybe-dont.yaml"
  if grep -q "enabled: false" "$config_dir/maybe-dont/maybe-dont.yaml" \
     && grep -q "type: http" "$config_dir/maybe-dont/maybe-dont.yaml" \
     && grep -q "test-dummy:" "$config_dir/maybe-dont/maybe-dont.yaml"; then
    pass "Config patched (HTTP mode, dummy downstream, AI disabled)"
  else
    fail "Config patch failed — check patch_config against default config format"
    return
  fi

  # ── Start / Verify ──
  run_gateway_tests "homebrew" "maybe-dont" "$config_dir" "$state_dir" "$cache_dir" "$test_dir/gateway.log"
}

# ─── Main ────────────────────────────────────────────────────────────────

main() {
  local tests_to_run="${1:-all}"

  printf "${BOLD}Get-Started Integration Test${RESET}\n"
  printf "Version: %s\n" "$VERSION"
  read -r os arch <<< "$(detect_platform)"
  printf "Platform: %s/%s\n" "$os" "$arch"

  TEST_DIR=$(mktemp -d "${TMPDIR:-/tmp}/maybedont-test-XXXXXX")
  TEST_DIR=$(cd "$TEST_DIR" && pwd -P)  # normalize (TMPDIR may have trailing slash)
  printf "Test dir: %s\n" "$TEST_DIR"

  case "$tests_to_run" in
    binary)   test_binary ;;
    docker)   test_docker ;;
    homebrew) test_homebrew ;;
    all)
      test_binary
      test_docker
      test_homebrew
      ;;
    *)
      printf "Usage: %s [binary|docker|homebrew|all]\n" "$0"
      exit 1
      ;;
  esac

  # Summary
  local total=$((PASS_COUNT + FAIL_COUNT + SKIP_COUNT))
  printf "\n${BOLD}=== Summary ===${RESET}\n"
  printf "  ${GREEN}%d passed${RESET}" "$PASS_COUNT"
  [ "$FAIL_COUNT" -gt 0 ] && printf ", ${RED}%d failed${RESET}" "$FAIL_COUNT"
  [ "$SKIP_COUNT" -gt 0 ] && printf ", ${YELLOW}%d skipped${RESET}" "$SKIP_COUNT"
  printf " (of %d)\n\n" "$total"

  [ "$FAIL_COUNT" -gt 0 ] && exit 1
  exit 0
}

main "$@"
