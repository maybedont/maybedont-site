---
title: Schema
weight: 1
---

Audit log entries are JSON objects, one per line. This page documents the complete schema.

## Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `validation_started` | string | RFC3339Nano timestamp when validation began |
| `created_at` | string | RFC3339Nano timestamp when entry was written |
| `tool` | object | Tool call information |
| `upstream_request` | object | Incoming request metadata |
| `ai` | object | AI provider info (when AI validation enabled) |
| `request_validation` | object | Request validation results |
| `response_validation` | object | Response validation results |
| `recommended_action` | string | What validation recommended |
| `action` | string | What actually happened: `allow` or `deny` |
| `action_reason` | string | Why action was taken |
| `duration_ms` | int | Total time from start to entry written |
| `total_blocked_ms` | int | Time caller was blocked |

## Tool Object

```json
{
  "tool": {
    "name": "delete_file",
    "client": "github",
    "prefixed_name": "github__delete_file",
    "params": { "path": "/tmp/test.txt" },
    "called_at": "2025-02-04T15:30:00.500Z",
    "duration_ms": 234
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Original tool name |
| `client` | string | Downstream MCP server name |
| `prefixed_name` | string | Full prefixed name (`client__name`) |
| `params` | object | Tool call parameters (may be omitted) |
| `called_at` | string | When downstream tool was invoked (omitted if denied) |
| `duration_ms` | int | Downstream call duration (omitted if denied) |

## Upstream Request Object

```json
{
  "upstream_request": {
    "id": "req-abc123",
    "session_id": "sess-xyz789",
    "client_ip": "192.168.1.100",
    "user_agent": "claude-code/1.0"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Request ID |
| `session_id` | string | Session identifier |
| `client_ip` | string | Client IP address |
| `user_agent` | string | User-Agent header |

## AI Provider Object

Present when AI validation is enabled:

```json
{
  "ai": {
    "provider": "openai",
    "model": "gpt-5.1",
    "endpoint_host": "api.openai.com",
    "endpoint_path": "/v1/chat/completions"
  }
}
```

## Validation Objects

Both `request_validation` and `response_validation` share the same structure. Each contains a `cel` and/or `ai` object with per-engine results:

```json
{
  "request_validation": {
    "cel": {},
    "ai": {}
  }
}
```

### CEL Results

```json
{
  "cel": {
    "action": "deny",
    "blocked_ms": 2,
    "evaluation_ms": 2,
    "deciding_rule": "deny-delete-file",
    "reason": "File deletion is not allowed",
    "results": [
      {
        "rule": "deny-delete-file",
        "action": "deny",
        "result": "deny",
        "evaluation_ms": 1
      },
      {
        "rule": "allow-read-only",
        "action": "deny",
        "mode": "audit_only",
        "result": "allow",
        "evaluation_ms": 1
      }
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `action` | string | Final CEL decision: `allow`, `deny`, or `redact` |
| `blocked_ms` | int | Time this phase blocked the request |
| `evaluation_ms` | int | Total evaluation time |
| `deciding_rule` | string | Rule that caused the decision |
| `reason` | string | Message from deciding rule |
| `results` | array | Per-rule results |

### Per-Rule Result

| Field | Type | Description |
|-------|------|-------------|
| `rule` | string | Rule name |
| `action` | string | Rule's configured action |
| `mode` | string | Present if `audit_only` |
| `result` | string | Effective decision |
| `evaluation_ms` | int | Time for this rule |
| `error` | string | Present if evaluation failed |

### AI Results

```json
{
  "ai": {
    "action": "deny",
    "blocked_ms": 1500,
    "evaluation_ms": 2300,
    "deciding_rule": "check-mass-deletion",
    "reason": "Wildcard deletion blocked",
    "request_id": "chatcmpl-abc123",
    "results": [
      {
        "rule": "check-mass-deletion",
        "action": "deny",
        "result": "deny",
        "evaluation_ms": 1500
      },
      {
        "rule": "check-system-dirs",
        "action": "deny",
        "result": "allow",
        "evaluation_ms": 800
      }
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `action` | string | Final AI decision |
| `blocked_ms` | int | Time request was blocked |
| `evaluation_ms` | int | Total evaluation time |
| `deciding_rule` | string | Rule that caused decision |
| `reason` | string | AI's explanation |
| `request_id` | string | Provider request ID (for debugging) |
| `results` | array | Per-rule results |

## Action Reasons

The `action_reason` field explains why the final action was taken:

| Value | Meaning |
|-------|---------|
| `request_policy` | Request validation denied |
| `response_policy` | Response validation denied |
| `audit_mode` | Would deny, but running in audit_only mode |
| `fail_open` | Validation timed out, allowing request |
| *(empty)* | Normal allow, no special circumstances |

## Complete Example

```json
{
  "validation_started": "2025-02-04T15:30:00.000000000Z",
  "created_at": "2025-02-04T15:30:02.345678000Z",
  "tool": {
    "name": "delete_file",
    "client": "github",
    "prefixed_name": "github__delete_file",
    "params": {
      "path": "/tmp/*.txt"
    }
  },
  "upstream_request": {
    "id": "req-abc123",
    "session_id": "sess-xyz789",
    "client_ip": "192.168.1.100",
    "user_agent": "claude-code/1.0"
  },
  "ai": {
    "provider": "openai",
    "model": "gpt-5.1",
    "endpoint_host": "api.openai.com"
  },
  "request_validation": {
    "cel": {
      "action": "deny",
      "blocked_ms": 1,
      "evaluation_ms": 1,
      "deciding_rule": "deny-delete-file",
      "reason": "File deletion is not allowed",
      "results": [
        {
          "rule": "deny-delete-file",
          "action": "deny",
          "result": "deny",
          "evaluation_ms": 1
        }
      ]
    },
    "ai": {
      "action": "deny",
      "blocked_ms": 0,
      "evaluation_ms": 1200,
      "deciding_rule": "check-mass-deletion",
      "reason": "Wildcard deletion blocked",
      "results": [
        {
          "rule": "check-mass-deletion",
          "action": "deny",
          "result": "deny",
          "evaluation_ms": 1200
        }
      ]
    }
  },
  "recommended_action": "deny",
  "action": "deny",
  "action_reason": "request_policy",
  "duration_ms": 2345,
  "total_blocked_ms": 1
}
```

## Parsing Tips

Since entries are newline-delimited JSON, you can use standard tools:

```bash
# Count denies
cat audit.log | jq -r 'select(.action == "deny")' | wc -l

# Find slow validations
cat audit.log | jq -r 'select(.duration_ms > 5000)'

# Extract tool names
cat audit.log | jq -r '.tool.prefixed_name' | sort | uniq -c
```
