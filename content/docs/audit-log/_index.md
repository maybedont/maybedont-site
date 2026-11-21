---
title: Audit Log
weight: 30
---

The audit log records the tool calls and commands the gateway validates: what was called, what each policy decided, and what the gateway did about it.

## Why It Matters

The audit log lets you:

- **See what AI agents are doing** - Each downstream tool call is recorded with its parameters
- **Understand policy decisions** - See exactly which rules fired and why
- **Debug problems** - Trace through the request lifecycle
- **Prove compliance** - Immutable record for audits and reviews
- **Feed your SIEM** - Structured JSON ready for ingestion

## What Gets Logged

These requests each write an audit entry. The entry's `source` field says which kind it is:

| Source | Request |
|--------|---------|
| `mcp` | A call to a downstream MCP server's tool through the gateway, whether it was allowed or denied |
| `cli` | A command sent to the [CLI validation endpoint](/docs/api/cli-validate/) |
| `intercept` | A tool call or command sent to the [intercept endpoint](/docs/api/intercept/) by an agent hook |
| `action` | An action sent to the [action validation endpoint](/docs/api/action-validate/) |

Some MCP requests pass through without an audit entry:

- Calls to the gateway's own [`maybedont__` tools](/docs/native-tools/). These aren't audited by design.
- `prompts/get` and `resources/read` requests. The gateway forwards them to the downstream server without evaluating policies.
- Allowed tool calls that never get a result from the downstream server, for example because the server is unreachable or the session has expired.

An MCP entry contains:

| Category | Information |
|----------|-------------|
| **Tool call** | Tool name, client, parameters, timing |
| **Validation** | CEL and AI results, deciding rules, reasons |
| **Action** | What happened (allow, deny) and why |
| **Context** | Session ID, client IP, request ID |

## Configuration

```yaml
audit:
  path: maybedont-audit.log       # default; stdout, stderr, or a filename
  filter: all                     # all or deny_only
  rotation:
    max_size_mb: 100              # Max file size before rotation
    max_backups: 5                # Rotated files to keep
    max_age_days: 180             # Max age before deletion
    compress: true                # Gzip rotated files
```

### Filter Options

| Value | What's Logged |
|-------|---------------|
| `all` | Every entry (default) |
| `deny_only` | Only denied requests |

For most use cases, keep `filter: all`. You want the complete picture.

### Output Options

| Value | Description |
|-------|-------------|
| `maybedont-audit.log` | Write to this file in the log directory (default) |
| `filename.log` | Write to another file in the log directory |
| `stdout` | Standard output (recommended for Docker) |
| `stderr` | Standard error |

The log directory is `~/.local/state/maybe-dont/` by default, or `$XDG_STATE_HOME/maybe-dont` if set. Run `maybe-dont gateway config info` to print it. A filename must be a relative path inside the log directory. The [`maybedont__get_audit_log`](/docs/native-tools/#maybedont__get_audit_log) tool reads this file, so it doesn't work when the audit log goes to `stdout` or `stderr`.

## Reading the Log

Audit entries are JSON, one per line. Here's a simplified example:

```json
{
  "source": "mcp",
  "validation_started": "2025-02-04T15:30:00.000Z",
  "created_at": "2025-02-04T15:30:01.234Z",
  "tool": {
    "name": "delete_file",
    "client": "github",
    "prefixed_name": "github__delete_file"
  },
  "request_validation": {
    "cel": {
      "action": "deny",
      "deciding_rule": "deny-delete-file",
      "reason": "File deletion is not allowed"
    }
  },
  "action": "deny",
  "action_reason": "request_policy"
}
```

For the complete schema with all fields, see [Schema](/docs/audit-log/log-schema/).

## Docker Considerations

In containerized environments, send audit logs to stdout:

```yaml
audit:
  path: stdout
```

This integrates with Docker's logging drivers and your container orchestrator's log aggregation.

If you need file-based logs in Docker, mount a volume:

{{< codeblock lang="bash" >}}
docker run \
  -e XDG_CONFIG_HOME=/config \
  -e XDG_STATE_HOME=/state \
  -v ${XDG_CONFIG_HOME:-$HOME/.config}/maybe-dont:/config/maybe-dont \
  -v ${XDG_STATE_HOME:-$HOME/.local/state}/maybe-dont:/state/maybe-dont \
  ghcr.io/maybedont/maybe-dont:{version}
{{< /codeblock >}}

## Next Steps

{{< cards >}}
  {{< card link="log-schema" title="Schema" icon="code" subtitle="Complete field reference" >}}
  {{< card link="siem-integration" title="SIEM" icon="server" subtitle="Ingesting into your SIEM" >}}
{{< /cards >}}
