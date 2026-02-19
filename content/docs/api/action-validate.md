---
title: Action Validate
weight: 2
---

The action validation endpoint is a pre-execution safety check for agent frameworks. Before an AI agent runs an action — a shell command, file operation, or tool call — it sends the action here for policy evaluation and receives a risk level back. The agent decides what to do with the verdict.

This endpoint is designed for [OpenHands](https://github.com/All-Hands-AI/OpenHands) and any agent framework that supports pluggable security analyzers. See [Connecting OpenHands](/docs/mcp-gateway/examples/connecting-openhands/) for the full integration guide.

## Endpoint

```
POST /api/v1/action/validate
```

This endpoint is always available when the gateway is running in `http` or `sse` mode — no additional configuration is required. It uses the same [CEL](/docs/policies/cel-policies/) and [AI](/docs/policies/ai-policies/) policy engines as the MCP gateway.

## Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | Must be `application/json` |
| `X-Maybe-Dont-Client-ID` | No | Client identifier for audit attribution (takes precedence over `actor` field) |
| `X-Request-ID` | No | Per-request tracing ID (generated if missing) |

## Request Body

```json
{
  "action_type": "tool_call",
  "target": "execute_bash",
  "parameters": {
    "command": "rm -rf /tmp/workspace"
  },
  "actor": "openhands-agent",
  "external_id": "42",
  "context": {
    "thought": "I need to clean up temporary files",
    "summary": "removing temporary files from workspace"
  }
}
```

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `target` | Yes | string | Name of the tool or action being evaluated (e.g., `execute_bash`, `file_write`, `browser_action`) |
| `action_type` | No | string | Action category (e.g., `tool_call`). Informational only |
| `parameters` | No | object | Structured arguments passed to the policy engine |
| `actor` | No | string | Agent identity. Used as fallback `client_id` for audit when `X-Maybe-Dont-Client-ID` header is absent |
| `external_id` | No | string | Caller correlation ID (e.g., OpenHands action ID). Stored in the audit log |
| `context.thought` | No | string | Agent's reasoning for the action. Injected into AI policy prompts |
| `context.summary` | No | string | Concise action description. Injected into AI policy prompts |

## Response

The endpoint always returns HTTP 200, even when the action is denied. The `allowed` and `risk_level` fields carry the verdict.

```json
{
  "request_id": "abc123def456",
  "allowed": false,
  "risk_level": "high",
  "message": "Action denied by policy",
  "server_version": "v1.0.0",
  "results": [
    {
      "policy_name": "no-destructive-ops",
      "policy_type": "ai",
      "action": "deny",
      "message": "Recursive rm operations are not permitted"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `request_id` | string | Unique request identifier for audit correlation |
| `allowed` | boolean | Whether the action passed all policies |
| `risk_level` | string | Risk assessment: `high`, `medium`, `low`, or `unknown` |
| `message` | string | Human-readable summary of the decision |
| `server_version` | string | Gateway version |
| `results` | array | Per-policy evaluation results |

## Risk Levels

The `risk_level` field maps directly to [OpenHands' `SecurityRisk` enum](https://github.com/All-Hands-AI/OpenHands):

| Risk Level | Condition | OpenHands Behavior |
|------------|-----------|-------------------|
| `high` | Action denied by policy | Block the action |
| `medium` | Action would be denied, but policy is in [audit-only mode](/docs/policies/) | Warn or prompt the user |
| `low` | Action allowed, at least one engine evaluated | Proceed |
| `unknown` | No engines evaluated (no config, or all errored) | OpenHands blocks by default (safe fallback) |

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_request` | 400 | Malformed request body |
| `missing_target` | 400 | Required `target` field is empty |
| `invalid_content_type` | 400 | Wrong Content-Type header |

### Error Response Format

```json
{
  "error": "missing_target",
  "message": "Required field 'target' is empty"
}
```

## Example: curl

```bash
curl -X POST http://localhost:8080/api/v1/action/validate \
  -H "Content-Type: application/json" \
  -d '{
    "target": "execute_bash",
    "parameters": {"command": "gh pr create --title \"Feature X\""},
    "actor": "openhands-agent",
    "context": {
      "thought": "Creating a pull request for the feature",
      "summary": "create pull request"
    }
  }'
```

## How It Differs from MCP Validation

The [MCP gateway](/docs/mcp-gateway/) intercepts and proxies MCP tool calls at execution time. This endpoint is different:

- **No proxying** — it returns a verdict, and the caller decides what to do
- **All action types** — not limited to MCP tools. Covers shell commands, file operations, browser actions, and anything else the agent can do
- **Agent context** — the `context.thought` and `context.summary` fields give the AI policy engine visibility into the agent's reasoning, not just the raw action

## Audit Integration

Action validations appear in the [audit log](/docs/audit-log/) alongside MCP and CLI entries. Action entries use `"source": "action"` to distinguish them:

```json
{
  "timestamp": "2025-02-04T10:30:00Z",
  "source": "action",
  "tool": {
    "name": "execute_bash",
    "arguments": {"command": "gh pr create --title \"Feature X\""}
  },
  "upstream_request": {
    "external_id": "42"
  },
  "decision": "allow",
  "duration_ms": 850
}
```

The `external_id` field correlates audit entries back to the originating agent action, making it easy to trace decisions in OpenHands' logs.
