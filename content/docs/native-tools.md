---
title: Native Tools
weight: 40
---

{{< callout type="warning" >}}
**Experimental Feature**

Native tools are experimental and subject to change. They may be modified or removed in future versions. Use them for testing and exploration, not production workflows.
{{< /callout >}}

Maybe Don't exposes built-in tools that let AI agents introspect the gateway itself. These are prefixed with `maybedont__` to distinguish them from downstream tools.

## Available Tools

### maybedont__get_audit_log

Retrieve recent audit log entries.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `limit` | int | Max entries to return (default: 100, max: 500) |
| `filter` | string | Filter by action: `all`, `allow`, `deny` |

**Example response:**

```json
{
  "entries": [
    {
      "validation_started": "2025-02-04T15:30:00Z",
      "tool": { "prefixed_name": "github__create_issue" },
      "action": "allow"
    }
  ],
  "total_count": 1,
  "returned_count": 1
}
```

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
| `entries` | int | Number of entries to analyze (default: 1000, max: 2000) |
| `focus` | string | Optional focus area (e.g., "security", "performance") |

**Example response:**

```json
{
  "report": "Analysis of 847 tool calls over the past 24 hours...",
  "generated_at": "2025-02-04T15:30:00Z",
  "entries_analyzed": 847
}
```

**Configuration:**

```yaml
native_tools:
  audit_report:
    enabled: true           # default: true
    max_entries: 1000       # default: 1000, range: 10-2000
    timeout_seconds: 180    # default: 180, range: 30-300
```

{{< callout type="info" >}}
This tool requires AI validation to be configured (`validation.ai.*`). Without an AI provider, the tool will return an error.
{{< /callout >}}

---

### maybedont__list_downstream_servers

List all configured downstream MCP servers and their status.

**Parameters:** None

**Example response:**

```json
{
  "servers": [
    {
      "name": "github",
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "status": "connected",
      "tool_count": 42
    },
    {
      "name": "aws-docs",
      "type": "http",
      "url": "https://knowledge-mcp.global.api.aws",
      "status": "connected",
      "tool_count": 8
    }
  ]
}
```

**Configuration:**

```yaml
native_tools:
  list_servers:
    enabled: true    # default: true
```

---

### maybedont__list_sessions

List active client sessions.

**Parameters:** None

**Example response:**

```json
{
  "sessions": [
    {
      "session_id": "sess-abc123",
      "client_ip": "192.168.1.100",
      "created_at": "2025-02-04T14:00:00Z",
      "last_activity": "2025-02-04T15:30:00Z",
      "tool_calls": 47
    }
  ]
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

Trigger tool discovery for downstream servers that use pass-through authentication. This is useful when a session has expired and needs to reconnect.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `server` | string | Optional: specific server to discover (default: all) |

**Example response:**

```json
{
  "discovered": [
    {
      "server": "github",
      "tools": 42,
      "prompts": 0,
      "resources": 3
    }
  ]
}
```

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
- **Session list** - Shows client IPs and activity
- **Server list** - Reveals your downstream server configuration

If you're concerned about AI agents accessing this information, disable the relevant tools.
