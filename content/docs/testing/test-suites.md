---
title: Suites
weight: 2
---

This page covers suite configuration — directory layout, `suite.yaml` fields, and how suites reference your policies. For running tests, see [Runner](../test-runner/).

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
| `policies` | Yes | Paths to policy files (relative to suite directory). `../` is valid for referencing files in a parent directory. |
| `acceptance.min_match_rate` | No | Minimum pass rate, 0.0-1.0 (default: `1.0`) |
| `acceptance.strict_policy_match` | No | Whether unexpected policy triggers fail (default: `true`) |
| `execution.timeout_ms` | No | Per-test timeout in milliseconds (default: `30000`) |
| `execution.retries` | No | Number of retries for failed AI evaluations (default: `2`) |
| `execution.retry_delay_ms` | No | Delay between retries (default: `1000`) |
| `execution.rate_limits` | No | Per-provider rate limiting |
| `engines.cel.enabled` | No | Enable CEL testing (default: `true`) |
| `engines.ai.enabled` | No | Enable AI testing (default: `true`) |
| `engines.ai.model_matrix` | No | Models to test against |
