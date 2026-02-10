---
title: Audit Log
weight: 30
---

The audit log records everything that happens through the gateway. Every tool call, every validation decision, every action taken - it's all here.

## Why It Matters

The audit log lets you:

- **See what AI agents are doing** - Every tool call is recorded with full parameters
- **Understand policy decisions** - See exactly which rules fired and why
- **Debug problems** - Trace through the request lifecycle
- **Prove compliance** - Immutable record for audits and reviews
- **Feed your SIEM** - Structured JSON ready for ingestion

## What Gets Logged

Every tool call generates an audit entry containing:

| Category | Information |
|----------|-------------|
| **Tool call** | Tool name, client, parameters, timing |
| **Validation** | CEL and AI results, deciding rules, reasons |
| **Action** | What happened (allow, deny) and why |
| **Context** | Session ID, client IP, request ID |

## Configuration

```yaml
audit:
  path: stdout                    # stdout, stderr, or filename
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
| `all` | Every tool call (default) |
| `deny_only` | Only denied requests |

For most use cases, keep `filter: all`. You want the complete picture.

### Output Options

| Value | Description |
|-------|-------------|
| `stdout` | Standard output (recommended for Docker) |
| `stderr` | Standard error |
| `filename.log` | Write to file in log directory |

## Reading the Log

Audit entries are JSON, one per line. Here's a simplified example:

```json
{
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

```bash
docker run \
  -v $(pwd)/logs:/home/maybedont/.local/state/maybe-dont \
  ghcr.io/maybedont/maybe-dont:v1.1.0 start
```

## Next Steps

{{< cards >}}
  {{< card link="log-schema" title="Schema" icon="code" subtitle="Complete field reference" >}}
  {{< card link="siem-integration" title="SIEM" icon="server" subtitle="Ingesting into your SIEM" >}}
{{< /cards >}}
