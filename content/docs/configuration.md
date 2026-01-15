---
title: Configuration
weight: 2
---

This guide explains how to configure both the client and server portions of the MCP Security Gateway for enterprise-grade security controls.

## Overview

The MCP Security Gateway acts as a transparent middleware between MCP clients and servers, enforcing security policies and providing audit logging. Configuration is managed through YAML files with support for select environment variables and command-line overrides.

## Server Configuration

The server configuration defines how the gateway accepts connections from MCP clients. It must be in a file called `gateway-config.yaml` which is located in the `--config-path`. The path defaults to either the current directory `./` or `~/.maybe-dont/`

### Server Types

#### 1. STDIO Server
For direct process communication:

```yaml
server:
  type: stdio
```

#### 2. HTTP Server

For HTTP-based MCP communication:

```yaml
server:
  type: http
  listen_addr: "0.0.0.0:8080"
```

#### 3. SSE Server (Server-Sent Events)

```yaml
server:
  type: sse
  listen_addr: "127.0.0.1:8080"
  sse:
    tls:
      enabled: true
      cert_file: "/path/to/cert.pem"
      key_file: "/path/to/key.pem"
```

## Downstream MCP Servers Configuration

The downstream MCP servers configuration defines how the gateway connects to one or more MCP servers. You can configure multiple servers with different transport types and settings.

### Basic Configuration Structure

```yaml
downstream_mcp_servers:
  github:
    type: http # stdio, sse, or http
    url: "https://api.githubcopilot.com/mcp/"
    http:
      headers:
        Authorization: "Bearer ${GITHUB_TOKEN}"
  aws-docs:
    type: stdio
    command: "uvx"
    args: ["awslabs.aws-documentation-mcp-server@latest"]
```

### Server Types

#### 1. STDIO Server
Execute a local process as the MCP server:
```yaml
downstream_mcp_servers:
  my-local-server:
    type: stdio
    command: "./my-mcp-server"
    args: ["run", "--verbose"]
```

#### 2. HTTP Server
Connect to an HTTP-based MCP server:
```yaml
downstream_mcp_servers:
  api-server:
    type: http
    url: "https://api.example.com/mcp"
    http:
      headers:
        Authorization: "Bearer ${API_TOKEN}"
        X-Custom-Header: "value"
```

#### 3. SSE Server
Connect to an SSE-based MCP server:
```yaml
downstream_mcp_servers:
  streaming-server:
    type: sse
    url: "https://api.example.com/mcp/stream"
    sse:
      headers:
        Authorization: "Bearer ${API_TOKEN}"
        X-Custom-Header: "value"
```

### Pass-Through Authentication

The gateway supports **pass-through authentication**, which allows you to extract credentials from incoming request headers and forward them to downstream servers. This is useful when you want different clients to use their own credentials rather than sharing a single set of credentials.

**Example configuration:**

```yaml
downstream_mcp_servers:
  # Pass-through authentication example
  github-passthrough:
    type: http
    url: "https://api.githubcopilot.com/mcp/"
    auth:
      pass_through:
        enabled: true
        headers:
          - source_header: "X-GitHub-Token"  # Extract from incoming request
            target_header: "Authorization"   # Forward to downstream
            format: "Bearer {value}"         # Optional formatting (default: raw value)
```

**How it works:**
1. Client sends request with custom header (e.g., `X-GitHub-Token: ghp_abc123`)
2. Gateway extracts the value from the source header
3. Gateway formats it according to the `format` template (if specified)
4. Gateway forwards it to the downstream server in the target header

{{< callout type="warning" >}}
Pass-through authentication only works with HTTP and SSE server types. It's not available for STDIO servers.
{{< /callout >}}

## Configuration Examples

### Example 1: Local Development Setup

```yaml
server:
  type: stdio

downstream_mcp_servers:
  kubectl-ai:
    type: stdio
    command: "./kubectl-ai"
    args: ["--mcp-server"]

policy_validation:
  enabled: true

ai_validation:
  enabled: false

audit:
  path: "audit.log"
```

### Example 2: Production HTTP Setup with Multiple Servers

```yaml
server:
  type: http
  listen_addr: "0.0.0.0:8080"

downstream_mcp_servers:
  github:
    type: http
    url: "https://api.githubcopilot.com/mcp/"
    http:
      headers:
        Authorization: "Bearer ${GITHUB_TOKEN}"
  aws-docs:
    type: stdio
    command: "uvx"
    args: ["awslabs.aws-documentation-mcp-server@latest"]
  api-server:
    type: http
    url: "https://api.example.com/mcp"
    http:
      headers:
        Authorization: "Bearer ${API_TOKEN}"

policy_validation:
  enabled: true
  rules_file: "production.rules.yaml"

ai_validation:
  enabled: true
  endpoint: "https://api.openai.com/v1/chat/completions"
  model: "gpt-4o-mini"

audit:
  path: "/var/log/mcp-gateway/audit.log"
```

### Best Practices

{{< callout type="tip" >}}
1. **Use environment variables for secrets** - Never hardcode API keys or tokens in your config unless it's stored as a secret.
2. **Enable both CEL and AI validation** - Use CEL for deterministic rules and AI for complex scenarios
{{< /callout >}}
