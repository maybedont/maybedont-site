---
title: Reference
weight: 100
---

Complete reference for `maybe-dont.yaml`. Every option is shown with its environment variable equivalent, default value, and available choices. This file is valid YAML — you can use it as a starting point for your own configuration.

## Configuration Precedence

Values are resolved in this order, later overrides earlier:

1. **Default values** — built-in defaults
2. **Config file** — `maybe-dont.yaml`
3. **Environment variables** — `MAYBE_DONT_*`

## Config and Log Directories

The gateway follows the [XDG Base Directory](https://specifications.freedesktop.org/basedir-spec/latest/) specification:

| Directory | Resolution Order |
|-----------|-----------------|
| **Config** | `--config-dir` flag / `MAYBE_DONT_CONFIG_DIR` > `$XDG_CONFIG_HOME/maybe-dont` > `~/.config/maybe-dont` |
| **Logs** | `--log-dir` flag / `MAYBE_DONT_LOG_DIR` > `$XDG_STATE_HOME/maybe-dont` > `~/.local/state/maybe-dont` |

Run `maybe-dont config info` to see the resolved paths on your system.

## Full Configuration

```yaml
# =============================================================================
# Server
# =============================================================================

server:
  # Server transport mode
  # Env: MAYBE_DONT_SERVER_TYPE
  # Options: http, stdio, sse (deprecated — use http instead)
  # Default: http
  type: http

  # Listen address for http and sse modes (any host:port combination)
  # Env: MAYBE_DONT_SERVER_LISTEN_ADDR
  # Default: 127.0.0.1:8080
  listen_addr: "127.0.0.1:8080"

  # Idle session timeout in minutes; 0 to disable
  # Env: MAYBE_DONT_SERVER_SESSION_TIMEOUT_MINUTES
  # Default: 30
  session_timeout_minutes: 30

  # Trusted proxy CIDR blocks for X-Forwarded-For resolution.
  # When configured, the gateway uses the rightmost untrusted IP in the
  # X-Forwarded-For chain — the most secure strategy, since proxies you
  # trust cannot spoof it. When empty, the leftmost (first) IP is used.
  # Env: MAYBE_DONT_SERVER_TRUSTED_PROXIES
  # Default: (none)
  # Example: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]
  trusted_proxies: []

# =============================================================================
# Validation
# =============================================================================

validation:
  # Max cumulative time (ms) across all policy evaluations per request.
  # If total evaluation time exceeds this, remaining evaluations are skipped
  # and the request fails open.
  # Env: MAYBE_DONT_VALIDATION_MAX_BLOCKING_MS
  # Default: 90000
  max_blocking_ms: 90000

  # Max time (ms) for a single rule evaluation
  # Env: MAYBE_DONT_VALIDATION_MAX_RULE_EVALUATION_MS
  # Default: 45000
  max_rule_evaluation_ms: 45000

  # AI provider configuration
  ai:
    # AI provider
    # Env: MAYBE_DONT_VALIDATION_AI_PROVIDER
    # Options: openai, anthropic, openai_compatible
    # Default: openai
    provider: openai

    # API endpoint
    # Env: MAYBE_DONT_VALIDATION_AI_ENDPOINT
    # Default: provider-specific (openai: https://api.openai.com/v1/chat/completions,
    #   anthropic: https://api.anthropic.com/v1/messages)
    # Required for openai_compatible — set to your provider's chat completions URL
    endpoint: ""

    # Model name
    # Env: MAYBE_DONT_VALIDATION_AI_MODEL
    # Examples: gpt-4o-mini, gpt-5, claude-sonnet-4-5-20250929
    model: ""

    # API key — supports ${ENV_VAR} syntax
    # Env: MAYBE_DONT_VALIDATION_AI_API_KEY
    api_key: ""

    # Provider-specific parameters (e.g., max_tokens, temperature)
    # Passed in the request body to the AI provider
    parameters: {}

    # URL query parameters appended to the endpoint
    # Example: { "api-version": "2024-02-01" } for Azure OpenAI
    query_params: {}

    # Additional HTTP headers for the AI endpoint
    headers: {}

# =============================================================================
# Request Validation
# =============================================================================

request_validation:
  # CEL request validation
  cel:
    # Enable CEL request validation
    # Env: MAYBE_DONT_REQUEST_VALIDATION_CEL_ENABLED
    # Default: true
    enabled: true

    # Validation mode
    # Env: MAYBE_DONT_REQUEST_VALIDATION_CEL_MODE
    # Options: audit_only, enforce
    # Default: audit_only
    mode: audit_only

    # Path to CEL request rules file or directory
    # Env: MAYBE_DONT_REQUEST_VALIDATION_CEL_RULES_FILE
    rules_file: ""

  # AI request validation
  ai:
    # Enable AI request validation
    # Env: MAYBE_DONT_REQUEST_VALIDATION_AI_ENABLED
    # Default: true
    enabled: true

    # Validation mode
    # Env: MAYBE_DONT_REQUEST_VALIDATION_AI_MODE
    # Options: audit_only, enforce
    # Default: audit_only
    mode: audit_only

    # Path to AI request rules file or directory
    # Env: MAYBE_DONT_REQUEST_VALIDATION_AI_RULES_FILE
    rules_file: ""

# =============================================================================
# Response Validation
# =============================================================================

response_validation:
  # CEL response validation
  cel:
    # Enable CEL response validation
    # Env: MAYBE_DONT_RESPONSE_VALIDATION_CEL_ENABLED
    # Default: false
    enabled: false

    # Validation mode
    # Env: MAYBE_DONT_RESPONSE_VALIDATION_CEL_MODE
    # Options: audit_only, enforce
    # Default: audit_only
    mode: audit_only

    # Path to CEL response rules file or directory
    # Env: MAYBE_DONT_RESPONSE_VALIDATION_CEL_RULES_FILE
    rules_file: ""

  # AI response validation
  ai:
    # Enable AI response validation
    # Env: MAYBE_DONT_RESPONSE_VALIDATION_AI_ENABLED
    # Default: false
    enabled: false

    # Validation mode
    # Env: MAYBE_DONT_RESPONSE_VALIDATION_AI_MODE
    # Options: audit_only, enforce
    # Default: audit_only
    mode: audit_only

    # Path to AI response rules file or directory
    # Env: MAYBE_DONT_RESPONSE_VALIDATION_AI_RULES_FILE
    rules_file: ""

# =============================================================================
# CLI Request Validation
# =============================================================================

cli_request_validation:
  # Enable CLI command validation (requires http or sse mode)
  # Env: MAYBE_DONT_CLI_REQUEST_VALIDATION_ENABLED
  # Default: false
  enabled: false

  # Commands to validate — others pass through without evaluation
  # Env: MAYBE_DONT_CLI_REQUEST_VALIDATION_VALIDATE_COMMANDS
  # Default: (none)
  validate_commands: []

  # Include argument values in audit log entries.
  # When false, only argument flag names are logged — values are omitted.
  # This protects sensitive data (tokens, passwords, file contents) from
  # appearing in audit logs.
  # Env: MAYBE_DONT_CLI_REQUEST_VALIDATION_INCLUDE_ARGUMENT_VALUES
  # Default: true
  include_argument_values: true

# =============================================================================
# Audit Log
# =============================================================================

audit:
  # Output destination: stdout, stderr, or a file path
  # Env: MAYBE_DONT_AUDIT_PATH
  # Default: maybedont-audit.log
  path: maybedont-audit.log

  # Filter which entries are logged
  # Env: MAYBE_DONT_AUDIT_FILTER
  # Options: all, deny_only
  # Default: all
  filter: all

  # Log rotation settings (applies when path is a file)
  rotation:
    # Max file size in MB before rotation
    # Env: MAYBE_DONT_AUDIT_ROTATION_MAX_SIZE_MB
    # Default: 100
    max_size_mb: 100

    # Number of rotated files to keep
    # Env: MAYBE_DONT_AUDIT_ROTATION_MAX_BACKUPS
    # Default: 5
    max_backups: 5

    # Max age of rotated files in days
    # Env: MAYBE_DONT_AUDIT_ROTATION_MAX_AGE_DAYS
    # Default: 180
    max_age_days: 180

    # Gzip compress rotated files
    # Env: MAYBE_DONT_AUDIT_ROTATION_COMPRESS
    # Default: true
    compress: true

# =============================================================================
# Application Logger
# =============================================================================

logger:
  # Log level
  # Env: MAYBE_DONT_LOGGER_LEVEL
  # Options: debug, info, warn, error
  # Default: info
  level: info

  # Output destination: stdout, stderr, or a file path
  # Env: MAYBE_DONT_LOGGER_PATH
  # Default: stderr
  path: stderr

  # Log rotation settings (applies when path is a file)
  rotation:
    # Max file size in MB before rotation
    # Env: MAYBE_DONT_LOGGER_ROTATION_MAX_SIZE_MB
    # Default: 100
    max_size_mb: 100

    # Number of rotated files to keep
    # Env: MAYBE_DONT_LOGGER_ROTATION_MAX_BACKUPS
    # Default: 5
    max_backups: 5

    # Max age of rotated files in days
    # Env: MAYBE_DONT_LOGGER_ROTATION_MAX_AGE_DAYS
    # Default: 180
    max_age_days: 180

    # Gzip compress rotated files
    # Env: MAYBE_DONT_LOGGER_ROTATION_COMPRESS
    # Default: true
    compress: true

# =============================================================================
# Native Tools
# =============================================================================

native_tools:
  audit_log:
    # Enable the audit log query tool
    # Env: MAYBE_DONT_NATIVE_TOOLS_AUDIT_LOG_ENABLED
    # Default: true
    enabled: true

    # Max entries returned per query (10-500)
    # Env: MAYBE_DONT_NATIVE_TOOLS_AUDIT_LOG_MAX_ENTRIES
    # Default: 100
    max_entries: 100

  audit_report:
    # Enable the AI-powered audit report tool
    # Env: MAYBE_DONT_NATIVE_TOOLS_AUDIT_REPORT_ENABLED
    # Default: true
    enabled: true

    # Max entries included in report (10-2000)
    # Env: MAYBE_DONT_NATIVE_TOOLS_AUDIT_REPORT_MAX_ENTRIES
    # Default: 1000
    max_entries: 1000

    # AI API timeout in seconds (30-300)
    # Env: MAYBE_DONT_NATIVE_TOOLS_AUDIT_REPORT_TIMEOUT_SECONDS
    # Default: 180
    timeout_seconds: 180

    # Custom system prompt for AI-powered audit report generation.
    # Overrides the built-in prompt. Leave empty to use the default.
    # Env: MAYBE_DONT_NATIVE_TOOLS_AUDIT_REPORT_SYSTEM_PROMPT
    system_prompt: ""

  list_servers:
    # Enable the list downstream servers tool
    # Env: MAYBE_DONT_NATIVE_TOOLS_LIST_SERVERS_ENABLED
    # Default: true
    enabled: true

  list_sessions:
    # Enable the list sessions tool
    # Env: MAYBE_DONT_NATIVE_TOOLS_LIST_SESSIONS_ENABLED
    # Default: true
    enabled: true

# =============================================================================
# Downstream MCP Servers
# =============================================================================

# Each key is a server name used as the tool name prefix (e.g., "github" means
# tools are exposed as github__<tool_name>).
downstream_mcp_servers:

  # Example: stdio transport (launches a subprocess)
  example_stdio:
    # Transport type
    # Options: stdio, http, sse
    type: stdio

    # Command to launch
    command: "npx"

    # Command arguments
    args: ["-y", "@example/mcp-server"]

    # Environment variables passed to the subprocess
    env:
      NODE_ENV: "production"

    # Startup timeout in ms (default: 30000)
    startup_timeout_ms: 30000

    # MCP initialization retries (default: 5)
    initialization_retries: 5

    # Delay between retries in ms (default: 100)
    retry_delay_ms: 100

    # Delay before capability discovery in ms (default: 1000, stdio only)
    capability_discovery_delay_ms: 1000

    # Capability discovery retries (default: 3)
    capability_discovery_retries: 3

    # Delay between discovery retries in ms (default: 500)
    capability_retry_delay_ms: 500

  # Example: http transport with static auth header
  example_http:
    type: http
    url: "https://example.com/mcp"
    http:
      headers:
        Authorization: "Bearer ${TOKEN}"
    # SSE transport also supports sse.headers (same format) but SSE is
    # deprecated in the MCP spec — prefer http transport for new servers.

  # Example: http transport with pass-through authentication
  example_passthrough:
    type: http
    url: "https://api.githubcopilot.com/mcp/"
    auth:
      pass_through:
        enabled: true
        headers:
          - source_header: "X-GitHub-Token"
            target_header: "Authorization"
            format: "Bearer {value}"
```

## Environment Variable Naming

Environment variables follow the pattern `MAYBE_DONT_<YAML_PATH>` where dots and nesting become underscores, converted to uppercase:

- `server.type` &rarr; `MAYBE_DONT_SERVER_TYPE`
- `audit.rotation.max_size_mb` &rarr; `MAYBE_DONT_AUDIT_ROTATION_MAX_SIZE_MB`

Environment variables support `${VAR}` substitution syntax, just like config file values.

### Exceptions

Some environment variables don't follow the YAML path convention:

| Variable | Purpose |
|----------|---------|
| `MAYBE_DONT_CONFIG_DIR` | Override the config directory |
| `MAYBE_DONT_LOG_DIR` | Override the log directory |
| `MAYBE_DONT_CONFIG_FILE_NAME` | Override the config filename (default: `maybe-dont.yaml`) |
| `MAYBE_DONT_CLIENT_ID` | Client identifier for CLI audit attribution |
