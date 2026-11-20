---
title: Native Tools
weight: 42
---

{{< callout type="warning" >}}
**Experimental Feature**

Native tools are experimental and subject to change. They may be modified or removed in future versions. Use them for testing and exploration, not production workflows.
{{< /callout >}}

The gateway exposes built-in tools that let AI agents introspect it. These are prefixed with `maybedont__` to distinguish them from downstream tools.

## Available Tools

### maybedont__get_audit_log

Retrieve recent MCP tool call entries from the audit log file, newest first.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `limit` | integer | Max entries to return (default: 100, capped at `native_tools.audit_log.max_entries`) |
| `time_range` | string | How far back to look: a Go duration (`1h30m`), days (`7d`), weeks (`2w`), or `all` (default: `7d`) |
| `filter` | object | Optional filters: `status` (`success` or `denied`), `tool_name` (prefix match on the prefixed tool name), `client` (downstream server name) |

**Example response:**

```json
{
  "entries": [
    {
      "audit": {
        "validation_started": "2025-02-04T15:30:00Z",
        "created_at": "2025-02-04T15:30:01Z",
        "tool": {
          "name": "create_issue",
          "client": "github",
          "prefixed_name": "github__create_issue"
        },
        "action": "allow",
        "duration_ms": 1234,
        "total_blocked_ms": 1100
      }
    }
  ],
  "total_count": 1,
  "returned_count": 1,
  "truncated": false
}
```

Each `audit` object uses the [audit log schema](/docs/audit-log/log-schema/). The tool reads the audit log file, so it returns an error when `audit.path` is `stdout` or `stderr`.

**Configuration:**

```yaml
native_tools:
  audit_log:
    enabled: true       # default: true
    max_entries: 100    # default: 100, range: 10-500
```

---

### maybedont__generate_audit_report

Generate an AI-powered analysis of recent audit log activity. This tool uses your configured AI provider to analyze patterns and identify potential issues.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `time_range` | string | How far back to analyze: a Go duration (`1h30m`), days (`7d`), weeks (`2w`), or `all` (default: `24h`) |
| `focus` | string | `security`, `usage`, `errors`, or `comprehensive` (default: `comprehensive`) |
| `include_recommendations` | boolean | Include policy improvement recommendations (default: true) |
| `include_impact_analysis` | boolean | Sort and annotate concerns by business impact (default: true) |
| `format` | string | `markdown`, `json`, or `summary` (default: `markdown`) |

**Example response** (`format: json`, trimmed):

```json
{
  "summary": "Analysis of 847 tool calls over the past 24 hours...",
  "concerns": [
    {
      "severity": "HIGH",
      "category": "security",
      "description": "Repeated attempts to delete repositories",
      "impact": { "type": "reputational", "reasoning": "..." },
      "occurrences": 3,
      "affected_tools": ["github__delete_repository"],
      "recommendation": "Add a CEL rule denying repository deletion"
    }
  ],
  "statistics": {
    "total_requests": 847,
    "success_count": 830,
    "denied_count": 12,
    "error_count": 5,
    "unique_tools": 23,
    "unique_clients": 2,
    "audit_only_denials": 9
  },
  "recommendations": ["..."],
  "metadata": {
    "generated_at": "2025-02-04T15:30:00Z",
    "time_range": "24h",
    "entries_analyzed": 847,
    "focus": "comprehensive"
  }
}
```

The `markdown` format renders the same report as Markdown, and `summary` returns only the summary text.

**Configuration:**

```yaml
native_tools:
  audit_report:
    enabled: true           # default: true
    max_entries: 1000       # default: 1000, range: 10-2000
    timeout_seconds: 180    # default: 180, range: 30-300
```

{{< callout type="info" >}}
This tool requires an AI provider and API key (`validation.ai.*`). While it's enabled, the gateway won't start without `validation.ai.api_key`. If you don't have a key, set `native_tools.audit_report.enabled: false`.
{{< /callout >}}

---

### maybedont__list_downstream_servers

List all configured downstream MCP servers and the tools discovered for each.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `include_tools` | boolean | Include the tool names for each server (default: false) |

**Example response:**

```json
{
  "retrieved_at": "2025-02-04T15:30:00Z",
  "servers": [
    {
      "name": "aws-docs",
      "type": "http",
      "url": "https://knowledge-mcp.global.api.aws",
      "tools_discovered": true,
      "tools_count": 8
    },
    {
      "name": "github",
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "tools_discovered": true,
      "tools_count": 42
    }
  ],
  "total_servers": 2,
  "total_tools": 50
}
```

Stdio servers report `command` instead of `url`. A pass-through server shows `tools_count: 0` until its tools are discovered for the current session.

**Configuration:**

```yaml
native_tools:
  list_servers:
    enabled: true    # default: true
```

---

### maybedont__list_sessions

List upstream client sessions connected to the gateway. By default only sessions with an active connection are listed; disconnected sessions are only counted.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `include_disconnected` | boolean | Also list sessions with no active connection (default: false) |

**Example response:**

```json
{
  "sessions": [
    {
      "session_id": "mcp-session-3f2a9c1e",
      "client_ip": "192.168.1.100",
      "user_agent": "claude-code/2.0.0",
      "connected": true,
      "downstream_clients": [
        { "name": "github", "tool_count": 42 }
      ]
    }
  ],
  "connected_count": 1,
  "disconnected_count": 0,
  "total_sessions": 1
}
```

**Configuration:**

```yaml
native_tools:
  list_sessions:
    enabled: true    # default: true
```

---

### maybedont__discover_tools

Connect to downstream servers that use [pass-through authentication](/docs/mcp-gateway/downstream-servers/) and discover their tools for the current session. Other downstream servers don't need it; the gateway connects them automatically. Pass-through servers are also connected automatically when a request carries their pass-through headers, so you only need this tool to discover their tools explicitly, for example after a session expires.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `client` | string | Optional: a specific downstream server to discover, such as `github` (default: all pass-through servers) |

**Example response:**

```json
{
  "discovered_clients": [
    {
      "client_name": "github",
      "tool_count": 42,
      "tools": ["create_issue", "get_file_contents", "..."]
    }
  ],
  "already_connected": ["gitlab"],
  "errors": [
    { "client_name": "jira", "error": "..." }
  ]
}
```

`already_connected` and `errors` are omitted when empty.

This tool is always enabled and cannot be disabled.

## Disabling Native Tools

To disable all native tools:

```yaml
native_tools:
  audit_log:
    enabled: false
  audit_report:
    enabled: false
  list_servers:
    enabled: false
  list_sessions:
    enabled: false
```

The `maybedont__discover_tools` tool cannot be disabled as it's required for pass-through authentication to function.

## Security Considerations

Native tools expose information about your gateway configuration and activity. Consider:

- **Audit log access** - Contains tool names and parameters
- **Session list** - Shows client IPs, user agents, and connected downstream servers
- **Server list** - Reveals your downstream server configuration

If you're concerned about AI agents accessing this information, disable the relevant tools.
