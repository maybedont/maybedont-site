---
title: Schema
weight: 1
---

Audit log entries are JSON objects, one per line. This page documents the complete schema.

## Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `source` | string | Which request wrote the entry: `mcp` (MCP tool call), `cli` (CLI validation endpoint), `intercept` (intercept endpoint) or `action` (action validation endpoint) |
| `validation_started` | string | RFC3339Nano timestamp when validation began |
| `created_at` | string | RFC3339Nano timestamp when entry was written |
| `tool` | object | Tool call information. Present for `mcp`, `intercept` and `action` entries |
| `cli` | object | Command information. Present for `cli` entries, and for request-phase `intercept` entries whose tool is a shell tool |
| `upstream_request` | object | Incoming request metadata |
| `ai` | object | AI provider info (MCP entries, when AI validation is enabled) |
| `request_validation` | object | Request validation results |
| `response_validation` | object | Response validation results (MCP entries, and `intercept` entries for the response phase) |
| `recommended_action` | string | What validation recommended. Omitted when `action_reason` is `fail_open` |
| `action` | string | What actually happened: `allow` or `deny` |
| `action_reason` | string | Why action was taken (omitted for a normal allow) |
| `duration_ms` | int | Total time from start to entry written |
| `total_blocked_ms` | int | Time caller was blocked (MCP entries: validation plus the downstream call) |

## Tool Object

```json
{
  "tool": {
    "name": "delete_file",
    "client": "github",
    "prefixed_name": "github__delete_file",
    "params": { "path": "/tmp/test.txt" },
    "duration_ms": 234
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Original tool name |
| `client` | string | Downstream MCP server name (MCP entries) |
| `prefixed_name` | string | Full prefixed name (`client__name`) |
| `params` | object | Tool call parameters. With `audit.include_argument_values: false`, MCP entries keep the parameter names with each value set to `"[redacted]"`, and intercept and action entries omit `params` |
| `duration_ms` | int | Downstream call duration in ms (MCP entries; omitted if the call was denied) |

## CLI Object

```json
{
  "cli": {
    "command": "gh",
    "arguments": ["repo", "delete", "my-org/my-repo"],
    "working_directory": "/home/dev/project",
    "client_info": { "hostname": "dev-laptop", "username": "dev", "os": "linux" }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `command` | string | Command name |
| `arguments` | array | Command arguments. With `audit.include_argument_values: false`, only flag names are kept |
| `working_directory` | string | Working directory the client reported (may be omitted) |
| `client_info` | object | `hostname`, `username` and `os` the client reported (may be omitted) |

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
| `id` | string | Request ID. Ends in `-async` on the follow-up entry described under [Action Reasons](#action-reasons) |
| `external_id` | string | Caller-supplied correlation ID (intercept and action entries, when sent) |
| `client_id` | string | Caller identifier from the `X-Maybe-Dont-Client-ID` header (CLI, intercept and action entries). Without the header, action entries use the request's `actor` and intercept entries use `context.principal.id` |
| `session_id` | string | Session identifier (MCP session, or the one an intercept request sends) |
| `client_ip` | string | Client IP address |
| `user_agent` | string | User-Agent header |

Fields with no value are omitted.

## AI Provider Object

Present when AI validation is enabled:

```json
{
  "ai": {
    "provider": "openai",
    "model": "gpt-5",
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
        "rule": "deny-repo-delete",
        "action": "deny",
        "mode": "audit_only",
        "result": "allow",
        "evaluation_ms": 1
      },
      {
        "rule": "deny-delete-file",
        "action": "deny",
        "result": "deny",
        "evaluation_ms": 1
      }
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `action` | string | Final CEL decision: `allow`, `deny`, or `redact` (response rules). Rules in `audit_only` mode don't change it |
| `blocked_ms` | int | Time this phase blocked the request |
| `evaluation_ms` | int | Total evaluation time |
| `deciding_rule` | string | Enforced rule that caused a deny (omitted if none) |
| `reason` | string | Message from deciding rule |
| `results` | array | Per-rule results, in evaluation order |

CEL rules run in file order and stop at the first enforced rule that denies or errors, so rules after it don't appear in `results`. Rules with no expression for the request type (for example a rule with only a `cli_expression`, on an MCP call) are skipped and don't appear either.

### Per-Rule Result

The same fields appear in CEL and AI `results` arrays.

| Field | Type | Description |
|-------|------|-------------|
| `rule` | string | Rule name |
| `action` | string | Rule's configured action: `allow`, `deny`, or `redact` |
| `mode` | string | `audit_only` when the rule ran in audit-only mode, either set on the rule or inherited from the phase. Omitted for enforced rules |
| `result` | string | What the rule decided: `allow`, `deny`, `redact`, or `error` |
| `evaluation_ms` | int | Time for this rule |
| `error` | string | Present when `result` is `error`. Usually prefixed with a category such as `eval_error:` or `timeout:` |

For a CEL rule, `result` is the rule's `action` when the expression matches. When it doesn't match, a `deny` or `redact` rule's result is `allow` and an `allow` rule's result is `deny`. For an AI rule, it's what the model decided.

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
| `action` | string | Final AI decision: `allow`, `deny`, or `redact` (response rules) |
| `blocked_ms` | int | Time request was blocked |
| `evaluation_ms` | int | Total evaluation time |
| `deciding_rule` | string | Enforced rule that caused a deny (omitted if none) |
| `reason` | string | AI's explanation |
| `request_id` | string | Provider request ID (for debugging) |
| `results` | array | Per-rule results, in the order rules finished |

AI rules run in parallel, so `results` lists them in the order they finished. A rule that's still running when the phase reaches its decision can be missing from `results`.

## Action Reasons

The `action_reason` field explains why the final action was taken:

| Value | Meaning |
|-------|---------|
| `request_policy` | Request validation denied |
| `response_policy` | Response validation denied |
| `audit_mode` | A rule in `audit_only` mode would have denied, so the request was allowed |
| `fail_open` | An enforced rule couldn't reach a decision and no other rule denied, so the request was allowed. Takes precedence over `audit_mode`. See below |
| `async_completion` | Follow-up entry with AI results that finished after the response was sent (`cli`, `intercept` and `action` entries) |
| *(omitted)* | Normal allow, no special circumstances |

### Fail-open

An enforced rule that fails at runtime is logged and can't deny anything, and the other rules still run. If another enforced rule denies, the request is denied as usual. If nothing denies, the request is allowed, `action_reason` is `fail_open` and `recommended_action` is omitted, because the gateway doesn't know what the failed rule would have decided. When an `audit_only` rule would also have denied, `action_reason` is still `fail_open`. Errors from rules in `audit_only` mode are recorded in `results` but don't trigger fail-open.

- A CEL rule fails when it errors while evaluating (for example a missing key, `no such key`) or doesn't return a boolean. The gateway skips that rule and evaluates the rest, so a later `deny` rule still blocks the request. This applies to MCP tool calls, CLI commands and response rules. An expression that doesn't compile stops the gateway at startup instead.
- An AI rule fails when the provider call errors, the response can't be parsed, or the rule runs longer than `validation.max_rule_evaluation_ms`. Other AI rules still run, and an enforced deny from any of them still blocks the request.
- AI validation also fails open when waiting for enforced rules uses up `validation.max_blocking_ms`. No rule gets an `error` result in this case. The request goes ahead without waiting, and the rules still running are left out of `results`, unless the phase also has `audit_only` rules, in which case they're recorded with their eventual result. The gateway logs a warning.

A rule that fails has `result: "error"` and an `error` message in its per-rule result. Evaluation errors from CEL rules and errors from AI rules are also written to the application log at error level; a CEL rule that returns a non-boolean is only recorded in the audit entry. On MCP entries, `fail_open` reflects request validation only. A response rule that fails is recorded in `response_validation` but doesn't change `action_reason`.

MCP entries don't need a follow-up: when `audit_only` AI rules are still running, the gateway waits for them before it writes the single entry.

## Complete Example

```json
{
  "source": "mcp",
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
    "model": "gpt-5",
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
