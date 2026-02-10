---
title: Suites & Running
weight: 2
---

This page covers suite configuration, the test runner CLI, and CI/CD integration.

## Suite Directory Structure

```
my-test-suite/
├── suite.yaml                    # Suite configuration
└── cases/
    ├── github-delete-tests.yaml  # Test cases grouped by policy
    ├── credential-tests.yaml
    └── response-redaction.yaml
```

## Suite Configuration

Full annotated `suite.yaml`:

```yaml
version: "v1"
bundle_id: "my-policies"
description: "Tests for production policy set"

providers:
  openai:
    api_key: "${OPENAI_API_KEY}"
  anthropic:
    api_key: "${ANTHROPIC_API_KEY}"

policies:
  cel_request_rules: "../cel_request_rules.yaml"
  ai_request_rules: "../ai_request_rules.yaml"
  cel_response_rules: "../cel_response_rules.yaml"
  ai_response_rules: "../ai_response_rules.yaml"

acceptance:
  min_match_rate: 1.0
  strict_policy_match: true

execution:
  timeout_ms: 30000
  retries: 2
  retry_delay_ms: 1000
  rate_limits:
    openai:
      requests_per_minute: 60
    anthropic:
      requests_per_minute: 30

engines:
  cel:
    enabled: true
  ai:
    enabled: true
    model_matrix:
      - provider: openai
        model: gpt-4o-mini
        enabled: true
      - provider: anthropic
        model: claude-sonnet-4-5-20250929
        enabled: true
```

### Configuration Fields

| Field | Required | Description |
|-------|----------|-------------|
| `version` | Yes | Schema version (`"v1"`) |
| `bundle_id` | Yes | Unique identifier for this test suite |
| `description` | No | Human-readable description |
| `providers` | Yes | AI provider credentials |
| `policies` | Yes | Paths to policy files (relative to suite directory) |
| `acceptance.min_match_rate` | No | Minimum pass rate, 0.0-1.0 (default: `1.0`) |
| `acceptance.strict_policy_match` | No | Whether unexpected policy triggers fail (default: `true`) |
| `execution.timeout_ms` | No | Per-test timeout in milliseconds (default: `30000`) |
| `execution.retries` | No | Number of retries for failed AI evaluations (default: `2`) |
| `execution.retry_delay_ms` | No | Delay between retries (default: `1000`) |
| `execution.rate_limits` | No | Per-provider rate limiting |
| `engines.cel.enabled` | No | Enable CEL testing (default: `true`) |
| `engines.ai.enabled` | No | Enable AI testing (default: `true`) |
| `engines.ai.model_matrix` | No | Models to test against |

## Running Tests

### Basic Commands

```bash
# Run all tests
maybe-dont test policies --suite-dir ./suite

# CEL only (fast, no API calls)
maybe-dont test policies --suite-dir ./suite --engine cel

# Single AI model
maybe-dont test policies --suite-dir ./suite --model openai:gpt-4o-mini

# Full model matrix comparison
maybe-dont test policies --suite-dir ./suite --matrix

# Filter by tags
maybe-dont test policies --suite-dir ./suite --tags "credentials,deny"

# Validate suite without running (check for schema errors)
maybe-dont test policies --suite-dir ./suite --validate-only

# Show cached results without re-running
maybe-dont test policies --suite-dir ./suite --summary-only
```

### Incremental Execution

For large test suites or rate-limited APIs:

| Flag | Description |
|------|-------------|
| `--incremental` | Skip unchanged tests, persist state |
| `--full` | Run all tests but persist state for next incremental run |
| `--retry-failed` | Re-run failed/errored tests even if cached |
| `--wait` | Run continuously until all tests complete (respects rate limits) |
| `--max-tests N` | Limit tests per invocation (exit code 5 if more remain) |

State is persisted to `~/.local/state/maybe-dont/policy-test-state.json` by default.

```bash
# Run up to 10 tests per invocation (rate-limit friendly)
maybe-dont test policies --suite-dir ./suite --incremental --max-tests 10

# Keep running until everything passes
maybe-dont test policies --suite-dir ./suite --incremental --wait

# Re-run only the tests that failed last time
maybe-dont test policies --suite-dir ./suite --incremental --retry-failed
```

## Output Formats

| Format | Flag | Description |
|--------|------|-------------|
| Text (default) | | Pass/fail/error/skip per test to stdout |
| JSON | `--output results.json` | Structured results with per-model breakdowns |
| JUnit XML | `--format junit --output results.xml` | For CI test reporting |
| Quiet | `--quiet` | Suppress stdout (useful with `--output`) |

```bash
# JSON output for programmatic use
maybe-dont test policies --suite-dir ./suite --output results.json

# JUnit XML for CI integration
maybe-dont test policies --suite-dir ./suite --format junit --output results.xml

# Quiet mode with file output
maybe-dont test policies --suite-dir ./suite --quiet --output results.json
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All tests passed, thresholds met |
| 1 | Test failure (thresholds not met) |
| 2 | Schema validation error |
| 3 | Policy integrity error (referenced policy doesn't exist) |
| 4 | Path resolution error |
| 5 | More tests remain (with `--max-tests`) |

## Model Comparison

When using `--matrix`, the runner outputs a comparison table showing pass/fail/match rate per model:

```
Model Matrix Results
─────────────────────────────────────────────────────
Model                           Pass  Fail  Match %
─────────────────────────────────────────────────────
openai:gpt-4o-mini              18    2     90.0%
openai:gpt-4o                   20    0     100.0%
anthropic:claude-sonnet-4-5     19    1     95.0%
─────────────────────────────────────────────────────
```

Use this to find the model that meets your accuracy bar at the best cost.

## CI/CD Integration

### Fast Feedback on Every Commit

Run CEL tests on every push — they're instant and free:

```yaml
# GitHub Actions example
- name: Test CEL policies
  run: maybe-dont test policies --suite-dir ./suite --engine cel
```

### Nightly Model Accuracy

Run the full model matrix on a schedule:

```yaml
- name: Test AI policies (matrix)
  run: maybe-dont test policies --suite-dir ./suite --matrix --format junit --output results.xml
```

### Rate-Limit-Friendly CI

For large test suites with rate-limited APIs:

```yaml
- name: Test policies (incremental)
  run: maybe-dont test policies --suite-dir ./suite --incremental --max-tests 50
```

### CI Best Practices

- Use `--engine cel` for fast feedback on every commit
- Use `--matrix` in a nightly or weekly job for model accuracy tracking
- Use `--format junit` for CI test reporting integration
- Use `--incremental --max-tests N` for rate-limit-friendly CI runs
- Set `min_match_rate` appropriately — 1.0 for CEL, 0.95+ for AI is a reasonable starting point
