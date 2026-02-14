# Get-Started Integration Test

**Date:** 2026-02-13
**Location:** `tests/test-get-started.sh`

## Purpose

A repeatable integration test that validates the get-started documentation by running through the documented installation and startup steps in an isolated environment. Nothing touches `~/.config`, `~/.local`, or `~/.cache`.

## Isolation Strategy

- `mktemp -d` creates `/tmp/maybedont-test-XXXXXX/`
- Subdirectories: `config/`, `state/`, `cache/`, `bin/`
- Environment variables scoped to the script:
  - `XDG_CONFIG_HOME=$TMPDIR/config`
  - `XDG_STATE_HOME=$TMPDIR/state`
  - `XDG_CACHE_HOME=$TMPDIR/cache`
- Docker tests volume-mount the same subdirs
- `trap` on EXIT cleans up temp dir, background processes, and Docker containers

## Test Paths

### 1. Binary (Package Download)

Mirrors the "Packages" install tab and "Package" first-run/start tabs.

| Step | Doc Section | Assertions |
|------|-------------|------------|
| Detect platform | Packages tab | Resolves to valid os/arch combo |
| Download binary | Packages tab | HTTP 200, file exists |
| Verify SHA256 | Packages tab (sha256 links) | Checksum matches |
| Extract archive | Packages tab | `maybe-dont` binary is executable |
| Bootstrap defaults | First Run > Package | Exit code 0, config files created: `maybe-dont.yaml`, `cel_request_rules.yaml`, `ai_request_rules.yaml`, `cel_response_rules.yaml`, `ai_response_rules.yaml` |
| `gateway config info` | First Run > Package | Output contains temp dir paths |
| Patch config | Configure (CEL-only callout) | Set `request_validation.ai.enabled: false` |
| Start gateway | Start > Package | Process starts, PID exists |
| Wait for ready | — | Port 8080 accepting connections (retry loop, ~10s timeout) |
| Curl /mcp | Verify | HTTP response contains JSON-RPC |
| Check audit log | Verify | Log file exists in state dir, has entries |
| Stop gateway | — | Process terminated cleanly |

### 2. Docker

Mirrors the "Docker" install tab and "Docker" first-run/start tabs.

| Step | Doc Section | Assertions |
|------|-------------|------------|
| Pull image | Docker install tab | `docker pull` succeeds |
| Bootstrap defaults | First Run > Docker | Config files created on host in temp dir |
| Patch config | Configure (CEL-only callout) | Same as binary |
| Start gateway | Start > Docker | Container starts, port 8080 mapped |
| Wait for ready | — | Port 8080 accepting connections |
| Curl /mcp | Verify | HTTP response contains JSON-RPC |
| Check audit log | Verify | Log file exists on host in state dir |
| Stop container | — | Container removed |

### 3. Homebrew (Opportunistic)

- If `maybe-dont` is on PATH: runs the same test sequence as binary (bootstrap, config info, start, curl, audit log) using the installed binary
- If not on PATH: skips with informational message
- Does NOT test `brew install` itself

## Configuration for Tests

Since we skip AI validation, the patched config sets:

```yaml
request_validation:
  ai:
    enabled: false
```

No API keys or downstream servers needed.

## Output Format

```
=== Binary Download Tests ===
  [PASS] Downloaded maybe-dont_1.1.0_darwin_arm64.tar.gz
  [PASS] SHA256 checksum verified
  [PASS] Binary is executable
  [PASS] Bootstrap created config files
  [PASS] gateway config info shows correct paths
  [PASS] Gateway started on port 8080
  [PASS] /mcp endpoint returns JSON-RPC response
  [PASS] Audit log has entries

=== Docker Tests ===
  ...

=== Summary ===
16/16 tests passed
```

- Green/red coloring when output is a terminal
- Exit code 0 = all pass, 1 = any failure

## Version Source

Reads version from `data/product.yaml` in the repo root (same source of truth as the site). The script resolves the repo root relative to its own location.

## CLAUDE.md Addition

Add a note linking get-started doc changes to this test script so future edits trigger a review of whether the test needs updating.

## Not In Scope

- AI validation testing (would need API key)
- Actual MCP proxying to downstream servers (would need tokens)
- `brew install` itself
- Windows (script is bash)
