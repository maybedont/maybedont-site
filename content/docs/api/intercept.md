---
title: Intercept
weight: 3
---

The intercept endpoint is the integration point for agent hook scripts — [Claude Code hooks](https://docs.anthropic.com/en/docs/claude-code/hooks), Gemini CLI hooks, and any agent framework that supports pre/post-execution interceptors. It accepts a tool call event, evaluates it against the same policy engines used by the MCP gateway, and returns a structured verdict the hook script can act on. This aligns with [SEP-1763](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1763) and the [experimental-ext-interceptors](https://github.com/modelcontextprotocol/experimental-ext-interceptors) proposal for standardized tool-call interception.

## Endpoint

```
POST /api/v1/intercept
```

This endpoint is available when the gateway is running in `http` or `sse` mode and `intercept.enabled` is `true` (the default). It uses the same [CEL](/docs/policies/cel-policies/) and [AI](/docs/policies/ai-policies/) policy engines as the [MCP gateway](/docs/mcp-gateway/).

## Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | Must be `application/json` |
| `X-Maybe-Dont-Client-ID` | No | Client identifier for audit attribution |
| `X-Request-ID` | No | Per-request tracing ID (generated if missing) |

## Request Body

```json
{
  "event": "tools/call",
  "phase": "request",
  "payload": {
    "name": "Bash",
    "arguments": {
      "command": "rm -rf /"
    }
  },
  "context": {
    "sessionId": "session-abc123",
    "traceId": "trace-def456",
    "principal": {
      "type": "agent",
      "id": "claude-code-v1"
    }
  }
}
```

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `event` | Yes | string | The event type (e.g., `tools/call`) |
| `phase` | Yes | string | `request` to validate before execution, `response` to validate after |
| `payload.name` | Yes | string | Name of the tool being called (e.g., `Bash`, `Read`, `Write`) |
| `payload.arguments` | No | object | Structured arguments passed to the tool |
| `payload.result` | No | any | Tool output. Required when `phase` is `response` |
| `context.sessionId` | No | string | Session identifier for audit correlation |
| `context.traceId` | No | string | Trace identifier for distributed tracing |
| `context.principal` | No | object | Identity of the actor. Has `type` and `id` fields |

### Response Phase

When validating after execution (`"phase": "response"`), include the tool's output in `payload.result`:

```json
{
  "event": "tools/call",
  "phase": "response",
  "payload": {
    "name": "Bash",
    "arguments": {
      "command": "cat /etc/passwd"
    },
    "result": {
      "content": [
        {"type": "text", "text": "root:x:0:0:root:/root:/bin/bash\n..."}
      ]
    }
  }
}
```

## Response: Valid

```json
{
  "interceptor": "maybe-dont",
  "type": "validation",
  "phase": "request",
  "valid": true,
  "severity": "info",
  "messages": [],
  "durationMs": 12,
  "info": {
    "request_id": "req-abc123",
    "server_version": "1.4.0",
    "results": []
  }
}
```

## Response: Invalid

```json
{
  "interceptor": "maybe-dont",
  "type": "validation",
  "phase": "request",
  "valid": false,
  "severity": "error",
  "messages": [
    {
      "message": "Destructive command detected",
      "severity": "error"
    }
  ],
  "durationMs": 42,
  "info": {
    "request_id": "req-abc123",
    "server_version": "1.4.0",
    "results": [
      {
        "policy_name": "no-destructive-ops",
        "policy_type": "ai",
        "action": "deny",
        "message": "Recursive rm operations are not permitted"
      }
    ]
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `interceptor` | string | Always `"maybe-dont"`. Identifies the interceptor to the calling agent |
| `type` | string | Always `"validation"`. Reserved for future response types |
| `phase` | string | Echoes the request phase (`request` or `response`) |
| `valid` | boolean | Whether the tool call passed all policies |
| `severity` | string | Overall severity: `info` when valid, `error` when denied |
| `messages` | array | Per-policy messages with individual severity levels |
| `durationMs` | integer | Total evaluation time in milliseconds |
| `info.request_id` | string | Unique request identifier for audit correlation |
| `info.server_version` | string | Gateway version |
| `info.results` | array | Per-policy evaluation results |

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `intercept_disabled` | 400 | Intercept endpoint not enabled in gateway config |
| `invalid_request` | 400 | Malformed request body |
| `missing_event` | 400 | Required `event` field is empty |
| `missing_phase` | 400 | Required `phase` field is empty |
| `unsupported_event` | 400 | Event type is not supported (only `tools/call`) |
| `invalid_phase` | 400 | Phase must be `request` or `response` |
| `missing_payload_name` | 400 | Required `payload.name` field is empty |
| `response_phase_missing_result` | 400 | `payload.result` is required for response phase |
| `invalid_content_type` | 415 | Wrong Content-Type header |

### Error Response Format

```json
{
  "error": "invalid_request",
  "message": "Request body must be valid JSON"
}
```

## Example: curl

```bash
curl -X POST http://localhost:8080/api/v1/intercept \
  -H "Content-Type: application/json" \
  -H "X-Maybe-Dont-Client-ID: developer@example.com" \
  -d '{
    "event": "tools/call",
    "phase": "request",
    "payload": {
      "name": "Bash",
      "arguments": {"command": "gh pr create --title \"Feature X\""}
    },
    "context": {
      "sessionId": "session-abc123",
      "principal": {"type": "user", "id": "developer@example.com"}
    }
  }'
```

## Configuration

The intercept endpoint is enabled by default. To disable it:

```yaml
intercept:
  enabled: false
```

Or via environment variable:

```bash
MAYBE_DONT_INTERCEPT_ENABLED=false
```

The `shell_tool_names` list tells the gateway which tool names contain CLI commands in their arguments (e.g., `Bash`, `execute_command`). When the gateway receives one of these tools, it extracts the command string and evaluates it against CLI policies. Override the defaults to match the tool names used by your agent:

```yaml
intercept:
  shell_tool_names:
    - Bash
    - shell
    - run_terminal_command
```

## Audit Integration

Intercept validations appear in the [audit log](/docs/audit-log/) alongside MCP, CLI, and action entries. Intercept entries use `"source": "intercept"` to distinguish them. The `phase` field maps to `request_validation` or `response_validation` in the audit record:

```json
{
  "timestamp": "2025-06-01T10:30:00Z",
  "source": "intercept",
  "phase": "request_validation",
  "tool": {
    "name": "Bash",
    "arguments": {"command": "gh pr create --title \"Feature X\""}
  },
  "context": {
    "sessionId": "session-abc123",
    "principal": {"type": "user", "id": "developer@example.com"}
  },
  "decision": "allow",
  "duration_ms": 12
}
```

The `context` fields from the request are preserved in the audit entry, making it straightforward to correlate intercept decisions with specific agent sessions and users.

{{< callout type="info" >}}
This endpoint is designed for agent hook scripts that intercept tool calls before or after execution. For MCP-native integrations, the [MCP gateway](/docs/mcp-gateway/) handles interception automatically. For non-hook CLI wrappers, see [CLI Validate](/docs/api/cli-validate/).
{{< /callout >}}
