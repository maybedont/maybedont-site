---
title: Downstream Servers
weight: 1
---

Downstream MCP servers are the services you want to proxy through Maybe Don't. You can configure multiple servers, and all their tools will be exposed to connecting AI agents (with prefixed names to avoid collisions).

## Basic Structure

```yaml
downstream_mcp_servers:
  server-name:
    type: http  # or stdio, sse
    # ... transport-specific options
```

The server name (e.g., `github`, `aws-docs`) becomes a prefix for all tools from that server. A tool called `create_issue` from the `github` server becomes `github__create_issue`.

## Transport Types

### HTTP

For MCP servers accessible over HTTP:

```yaml
downstream_mcp_servers:
  github:
    type: http
    url: "https://api.githubcopilot.com/mcp/"
    http:
      headers:
        Authorization: "Bearer ${GITHUB_TOKEN}"
```

### SSE (Server-Sent Events)

For MCP servers using SSE streaming:

```yaml
downstream_mcp_servers:
  streaming-server:
    type: sse
    url: "https://api.example.com/mcp/stream"
    sse:
      headers:
        Authorization: "Bearer ${API_TOKEN}"
```

### STDIO

For local processes that communicate via stdin/stdout:

```yaml
downstream_mcp_servers:
  local-mcp:
    type: stdio
    command: "/usr/local/bin/mcp-server"
    args:
      - "--verbose"
      - "--port=8080"
```

## Pass-Through Authentication

Instead of embedding credentials in your config, you can pass them through from the connecting client. This is useful when different users should use their own credentials.

```yaml
downstream_mcp_servers:
  github:
    type: http
    url: "https://api.githubcopilot.com/mcp/"
    auth:
      pass_through:
        enabled: true
        headers:
          - source_header: "X-GitHub-Token"    # Header from incoming request
            target_header: "Authorization"      # Header sent to downstream
            format: "Bearer {value}"            # Optional formatting
```

**How it works:**

1. Client sends request with `X-GitHub-Token: ghp_abc123`
2. Maybe Don't extracts the value
3. Maybe Don't sends `Authorization: Bearer ghp_abc123` to the downstream server

{{< callout type="warning" >}}
Pass-through authentication only works with HTTP and SSE transports. STDIO servers don't have HTTP headers to pass through.
{{< /callout >}}

## Multiple Servers

You can configure as many downstream servers as you need:

```yaml
downstream_mcp_servers:
  github:
    type: http
    url: "https://api.githubcopilot.com/mcp/"
    auth:
      pass_through:
        enabled: true
        headers:
          - source_header: "X-GitHub-Token"
            target_header: "Authorization"
            format: "Bearer {value}"

  aws-docs:
    type: http
    url: "https://knowledge-mcp.global.api.aws"

  local-tools:
    type: stdio
    command: "./my-custom-mcp"
    args: ["--mode=production"]
```

All tools from all servers are available to connecting clients. Tools are prefixed with the server name:
- `github__create_issue`
- `aws-docs__search_documentation`
- `local-tools__my_custom_tool`

## Initialization Settings

For STDIO servers that take time to start, you can tune initialization behavior:

```yaml
downstream_mcp_servers:
  slow-server:
    type: stdio
    command: "./slow-starting-mcp"
    startup_timeout_ms: 60000        # Max time to wait for startup (default: 30000)
    initialization_retries: 5        # Retry attempts (default: 5)
    retry_delay_ms: 200              # Delay between retries (default: 100)
    capability_discovery_delay_ms: 2000  # Delay before discovering tools (default: 1000 for stdio)
```

## Environment Variable Configuration

You can configure downstream servers entirely via environment variables:

```bash
# Basic HTTP client
export MAYBE_DONT_DOWNSTREAM_MCP_SERVERS_GITHUB_TYPE=http
export MAYBE_DONT_DOWNSTREAM_MCP_SERVERS_GITHUB_URL=https://api.githubcopilot.com/mcp/

# Pass-through auth (compact format)
export MAYBE_DONT_DOWNSTREAM_MCP_SERVERS_GITHUB_AUTH_PASS_THROUGH_ENABLED=true
export MAYBE_DONT_DOWNSTREAM_MCP_SERVERS_GITHUB_AUTH_PASS_THROUGH_HEADERS=X-Token:Authorization:Bearer\ {value}
```

{{< callout type="info" >}}
**Naming note:** Underscores in environment variable names are converted to hyphens in the server name. `AWS_DOCS` becomes `aws-docs`.
{{< /callout >}}
