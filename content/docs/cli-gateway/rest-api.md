---
title: Validate API
weight: 1
---

The gateway exposes a REST endpoint for CLI command validation when `cli_request_validation.enabled` is `true`. This endpoint requires the gateway to be running in `http` or `sse` mode (not `stdio`), since it needs a network listener.

## Endpoint

```
POST /api/v1/cli/validate
```

## Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | Must be `application/json` |
| `X-Maybe-Dont-Client-ID` | No | Client identifier for audit attribution |
| `X-Request-ID` | No | Per-request tracing ID (generated if missing) |

## Request Body

```json
{
  "command": "gh",
  "arguments": ["pr", "comment", "123", "--body", "Looks good!"],
  "working_directory": "/home/user/project",
  "client_info": {
    "hostname": "dev-workstation-1",
    "username": "developer",
    "os": "darwin",
    "arch": "arm64",
    "shell": "/bin/zsh",
    "cli_version": "1.0.0"
  }
}
```

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `command` | Yes | string | The command name (e.g., `gh`, `aws`, `kubectl`) |
| `arguments` | No | string[] | Command arguments |
| `working_directory` | No | string | Working directory for the command |
| `client_info` | No | object | Client environment details |
| `client_info.hostname` | No | string | Client hostname |
| `client_info.username` | No | string | Client username |
| `client_info.os` | No | string | Client OS |
| `client_info.arch` | No | string | Client architecture |
| `client_info.shell` | No | string | Client shell |
| `client_info.cli_version` | No | string | `maybe-dont` CLI version |

## Response: Allowed

```json
{
  "allowed": true,
  "request_id": "req-abc123",
  "duration_ms": 1250,
  "policies_evaluated": 3
}
```

## Response: Denied

```json
{
  "allowed": false,
  "request_id": "req-abc123",
  "duration_ms": 850,
  "policies_evaluated": 3,
  "denial": {
    "policy_name": "deny-destructive-github",
    "engine": "cel",
    "message": "Destructive GitHub operations are blocked"
  }
}
```

## Response: No Validation Required

Returned when the command is not in the `validate_commands` list:

```json
{
  "allowed": true,
  "request_id": "req-abc123",
  "duration_ms": 0,
  "policies_evaluated": 0,
  "note": "Command not in validate_commands list"
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `cli_validation_disabled` | 400 | CLI validation not enabled in gateway config |
| `invalid_request` | 400 | Malformed request body |
| `missing_command` | 400 | Required `command` field is empty |
| `invalid_content_type` | 400 | Wrong Content-Type header |
| `policy_evaluation_error` | 500 | CEL or AI engine failed during evaluation |
| `internal_error` | 500 | Unexpected server error |

### Error Response Format

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Request body must be valid JSON"
  },
  "request_id": "req-abc123"
}
```

## Example: curl

```bash
curl -X POST http://localhost:8080/api/v1/cli/validate \
  -H "Content-Type: application/json" \
  -H "X-Maybe-Dont-Client-ID: developer@example.com" \
  -d '{
    "command": "gh",
    "arguments": ["pr", "create", "--title", "Feature X"],
    "working_directory": "/home/user/project"
  }'
```

{{< callout type="info" >}}
This endpoint exists for non-MCP integrations. The `maybe-dont cli` command uses it under the hood, but you can also call it directly from custom tooling or CI/CD pipelines.
{{< /callout >}}
