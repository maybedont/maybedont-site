---
title: Configuration Reference
weight: 100
---

This page lists all configuration options, their environment variable equivalents, and default values.

## Configuration Precedence

Values are resolved in this order (later overrides earlier):

1. **Config file** (`maybe-dont.yaml`)
2. **Environment variables** (`MAYBE_DONT_*`)
3. **CLI flags** (`--config-dir`, etc.)

## Server Configuration

| YAML Path | Environment Variable | Type | Default | Description |
|-----------|---------------------|------|---------|-------------|
| `server.type` | `MAYBE_DONT_SERVER_TYPE` | string | `stdio` | Server mode: `stdio`, `http`, `sse` |
| `server.listen_addr` | `MAYBE_DONT_SERVER_LISTEN_ADDR` | string | `127.0.0.1:8080` | Listen address for http/sse modes |
| `server.session_timeout_minutes` | `MAYBE_DONT_SERVER_SESSION_TIMEOUT_MINUTES` | int | `30` | Idle session timeout (0 to disable) |
| `server.trusted_proxies` | `MAYBE_DONT_SERVER_TRUSTED_PROXIES` | []string | `[]` | CIDR blocks for trusted proxies |

### SSE TLS Configuration

| YAML Path | Environment Variable | Type | Default | Description |
|-----------|---------------------|------|---------|-------------|
| `server.sse.tls.enabled` | `MAYBE_DONT_SERVER_SSE_TLS_ENABLED` | bool | `false` | Enable TLS for SSE |
| `server.sse.tls.cert_file` | `MAYBE_DONT_SERVER_SSE_TLS_CERT_FILE` | string | | Path to TLS certificate |
| `server.sse.tls.key_file` | `MAYBE_DONT_SERVER_SSE_TLS_KEY_FILE` | string | | Path to TLS private key |

## Validation Configuration

| YAML Path | Environment Variable | Type | Default | Description |
|-----------|---------------------|------|---------|-------------|
| `validation.max_blocking_ms` | `MAYBE_DONT_VALIDATION_MAX_BLOCKING_MS` | int | `90000` | Max cumulative blocking time for all validations |
| `validation.max_rule_evaluation_ms` | `MAYBE_DONT_VALIDATION_MAX_RULE_EVALUATION_MS` | int | `45000` | Max time for single rule evaluation |

### AI Provider Configuration

| YAML Path | Environment Variable | Type | Default | Description |
|-----------|---------------------|------|---------|-------------|
| `validation.ai.provider` | `MAYBE_DONT_VALIDATION_AI_PROVIDER` | string | `openai` | AI provider: `openai`, `openai_compatible`, `anthropic` |
| `validation.ai.endpoint` | `MAYBE_DONT_VALIDATION_AI_ENDPOINT` | string | | API endpoint (required for `openai_compatible`) |
| `validation.ai.model` | `MAYBE_DONT_VALIDATION_AI_MODEL` | string | | Model name (e.g., `gpt-4o-mini`) |
| `validation.ai.api_key` | `MAYBE_DONT_VALIDATION_AI_API_KEY` | string | | API key for AI provider |

## Request Validation

### CEL Request Validation

| YAML Path | Environment Variable | Type | Default | Description |
|-----------|---------------------|------|---------|-------------|
| `request_validation.cel.enabled` | `MAYBE_DONT_REQUEST_VALIDATION_CEL_ENABLED` | bool | `true` | Enable CEL request validation |
| `request_validation.cel.mode` | `MAYBE_DONT_REQUEST_VALIDATION_CEL_MODE` | string | `audit_only` | Mode: `audit_only` or empty (enforce) |
| `request_validation.cel.rules_file` | `MAYBE_DONT_REQUEST_VALIDATION_CEL_RULES_FILE` | string | | Path to CEL rules file |

### AI Request Validation

| YAML Path | Environment Variable | Type | Default | Description |
|-----------|---------------------|------|---------|-------------|
| `request_validation.ai.enabled` | `MAYBE_DONT_REQUEST_VALIDATION_AI_ENABLED` | bool | `true` | Enable AI request validation |
| `request_validation.ai.mode` | `MAYBE_DONT_REQUEST_VALIDATION_AI_MODE` | string | `audit_only` | Mode: `audit_only` or empty (enforce) |
| `request_validation.ai.rules_file` | `MAYBE_DONT_REQUEST_VALIDATION_AI_RULES_FILE` | string | | Path to AI rules file |

## Response Validation

### CEL Response Validation

| YAML Path | Environment Variable | Type | Default | Description |
|-----------|---------------------|------|---------|-------------|
| `response_validation.cel.enabled` | `MAYBE_DONT_RESPONSE_VALIDATION_CEL_ENABLED` | bool | `false` | Enable CEL response validation |
| `response_validation.cel.mode` | `MAYBE_DONT_RESPONSE_VALIDATION_CEL_MODE` | string | `audit_only` | Mode: `audit_only` or empty (enforce) |
| `response_validation.cel.rules_file` | `MAYBE_DONT_RESPONSE_VALIDATION_CEL_RULES_FILE` | string | | Path to CEL response rules file |

### AI Response Validation

| YAML Path | Environment Variable | Type | Default | Description |
|-----------|---------------------|------|---------|-------------|
| `response_validation.ai.enabled` | `MAYBE_DONT_RESPONSE_VALIDATION_AI_ENABLED` | bool | `false` | Enable AI response validation |
| `response_validation.ai.mode` | `MAYBE_DONT_RESPONSE_VALIDATION_AI_MODE` | string | `audit_only` | Mode: `audit_only` or empty (enforce) |
| `response_validation.ai.rules_file` | `MAYBE_DONT_RESPONSE_VALIDATION_AI_RULES_FILE` | string | | Path to AI response rules file |

## Audit Configuration

| YAML Path | Environment Variable | Type | Default | Description |
|-----------|---------------------|------|---------|-------------|
| `audit.path` | `MAYBE_DONT_AUDIT_PATH` | string | `maybedont-audit.log` | Output: `stdout`, `stderr`, or filename |
| `audit.filter` | `MAYBE_DONT_AUDIT_FILTER` | string | `all` | Filter: `all` or `deny_only` |
| `audit.rotation.max_size_mb` | `MAYBE_DONT_AUDIT_ROTATION_MAX_SIZE_MB` | int | `100` | Max file size before rotation |
| `audit.rotation.max_backups` | `MAYBE_DONT_AUDIT_ROTATION_MAX_BACKUPS` | int | `5` | Number of rotated files to keep |
| `audit.rotation.max_age_days` | `MAYBE_DONT_AUDIT_ROTATION_MAX_AGE_DAYS` | int | `180` | Max age of rotated files |
| `audit.rotation.compress` | `MAYBE_DONT_AUDIT_ROTATION_COMPRESS` | bool | `true` | Gzip rotated files |

## Logger Configuration

| YAML Path | Environment Variable | Type | Default | Description |
|-----------|---------------------|------|---------|-------------|
| `logger.level` | `MAYBE_DONT_LOGGER_LEVEL` | string | `info` | Log level: `debug`, `info`, `warn`, `error` |
| `logger.path` | `MAYBE_DONT_LOGGER_PATH` | string | `stderr` | Output: `stdout`, `stderr`, or filename |
| `logger.rotation.max_size_mb` | `MAYBE_DONT_LOGGER_ROTATION_MAX_SIZE_MB` | int | `100` | Max file size before rotation |
| `logger.rotation.max_backups` | `MAYBE_DONT_LOGGER_ROTATION_MAX_BACKUPS` | int | `5` | Number of rotated files to keep |
| `logger.rotation.max_age_days` | `MAYBE_DONT_LOGGER_ROTATION_MAX_AGE_DAYS` | int | `180` | Max age of rotated files |
| `logger.rotation.compress` | `MAYBE_DONT_LOGGER_ROTATION_COMPRESS` | bool | `true` | Gzip rotated files |

## Native Tools Configuration

| YAML Path | Environment Variable | Type | Default | Description |
|-----------|---------------------|------|---------|-------------|
| `native_tools.audit_log.enabled` | `MAYBE_DONT_NATIVE_TOOLS_AUDIT_LOG_ENABLED` | bool | `true` | Enable audit log tool |
| `native_tools.audit_log.max_entries` | `MAYBE_DONT_NATIVE_TOOLS_AUDIT_LOG_MAX_ENTRIES` | int | `100` | Max entries returned (10-500) |
| `native_tools.audit_report.enabled` | `MAYBE_DONT_NATIVE_TOOLS_AUDIT_REPORT_ENABLED` | bool | `true` | Enable audit report tool |
| `native_tools.audit_report.max_entries` | `MAYBE_DONT_NATIVE_TOOLS_AUDIT_REPORT_MAX_ENTRIES` | int | `1000` | Max entries for report (10-2000) |
| `native_tools.audit_report.timeout_seconds` | `MAYBE_DONT_NATIVE_TOOLS_AUDIT_REPORT_TIMEOUT_SECONDS` | int | `180` | AI API timeout (30-300) |
| `native_tools.list_servers.enabled` | `MAYBE_DONT_NATIVE_TOOLS_LIST_SERVERS_ENABLED` | bool | `true` | Enable list servers tool |
| `native_tools.list_sessions.enabled` | `MAYBE_DONT_NATIVE_TOOLS_LIST_SESSIONS_ENABLED` | bool | `true` | Enable list sessions tool |

## Downstream MCP Server Configuration

Each server under `downstream_mcp_servers` supports these fields:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Transport: `stdio`, `http`, `sse` |
| `url` | string | Server URL (http/sse only) |
| `command` | string | Command to run (stdio only) |
| `args` | []string | Command arguments (stdio only) |
| `startup_timeout_ms` | int | Startup timeout, default 30000 |
| `initialization_retries` | int | Retry attempts, default 5 |
| `retry_delay_ms` | int | Retry delay, default 100 |
| `capability_discovery_delay_ms` | int | Discovery delay, default 1000 (stdio) |
| `capability_discovery_retries` | int | Discovery retries, default 3 |
| `capability_retry_delay_ms` | int | Discovery retry delay, default 500 |

### HTTP/SSE Headers

```yaml
downstream_mcp_servers:
  example:
    type: http
    url: "https://example.com/mcp"
    http:
      headers:
        Authorization: "Bearer ${TOKEN}"
```

### Pass-Through Authentication

```yaml
downstream_mcp_servers:
  example:
    type: http
    url: "https://example.com/mcp"
    auth:
      pass_through:
        enabled: true
        headers:
          - source_header: "X-Client-Token"
            target_header: "Authorization"
            format: "Bearer {value}"
```
