---
title: Logging
weight: 1
---

There are two log streams: **application logs** (what the gateway is doing) and **audit logs** (what tool calls are happening). This page covers application logging. For audit logs, see [Audit Log](/docs/audit-log/).

## Application Log Configuration

```yaml
logger:
  level: info              # debug, info, warn, error
  path: stderr             # stderr, stdout, or filename
```

### Log Levels

| Level | Description |
|-------|-------------|
| `debug` | Verbose output for troubleshooting |
| `info` | Normal operational messages (default) |
| `warn` | Warning conditions |
| `error` | Error conditions only |

### Output Destinations

| Value | Description |
|-------|-------------|
| `stderr` | Standard error (default) |
| `stdout` | Standard output |
| `filename.log` | Write to file in log directory |

When using a filename, logs are written to the log directory (see below).

## Log Directory

Log files are written to the log directory, resolved in this order:

1. `--log-dir` CLI flag
2. `MAYBE_DONT_LOG_DIR` environment variable
3. `$XDG_STATE_HOME/maybe-dont/`
4. `$HOME/.local/state/maybe-dont/`

## Log Rotation

When writing to a file, logs are automatically rotated:

```yaml
logger:
  path: "application.log"
  rotation:
    max_size_mb: 100       # Rotate when file reaches this size (default: 100)
    max_backups: 5         # Keep this many rotated files (default: 5)
    max_age_days: 180      # Delete rotated files older than this (default: 180)
    compress: true         # Gzip rotated files (default: true)
```

Rotation settings only apply when `path` is a filename, not `stdout` or `stderr`.

## Docker Considerations

In Docker, you'll typically want logs on stdout/stderr so they're captured by your container orchestrator:

```yaml
logger:
  level: info
  path: stderr
```

If you need file-based logs in Docker, mount a volume for the log directory:

{{< codeblock lang="bash" >}}
docker run \
  -e XDG_CONFIG_HOME=/config \
  -e XDG_STATE_HOME=/state \
  -v ${XDG_CONFIG_HOME:-$HOME/.config}/maybe-dont:/config/maybe-dont \
  -v ${XDG_STATE_HOME:-$HOME/.local/state}/maybe-dont:/state/maybe-dont \
  ghcr.io/maybedont/maybe-dont:{version}
{{< /codeblock >}}

## Environment Variables

| Setting | Environment Variable |
|---------|---------------------|
| `logger.level` | `MAYBE_DONT_LOGGER_LEVEL` |
| `logger.path` | `MAYBE_DONT_LOGGER_PATH` |

## Next Steps

For audit logging (tool calls, validation decisions), see [Audit Log](/docs/audit-log/).
