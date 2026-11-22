---
title: Downstream Servers
weight: 1
---

Downstream MCP servers are the services you want to proxy through the gateway. You can configure multiple servers, and all their tools will be exposed to connecting AI agents (with prefixed names to avoid collisions).

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

{{< callout type="warning" >}}
SSE transport is **deprecated** in the MCP specification, replaced by Streamable HTTP. Use `type: http` for new configurations. SSE support remains for backward compatibility with older MCP servers that haven't migrated yet.
{{< /callout >}}

For MCP servers that still use SSE streaming:

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

For MCP servers that run as local processes. The gateway spawns the process and communicates via stdin/stdout. This is the most common transport for MCP servers installed locally — tools like filesystem access, database connectors, and custom scripts typically use STDIO.

```yaml
downstream_mcp_servers:
  local-mcp:
    type: stdio
    command: "/usr/local/bin/mcp-server"
    args:
      - "--verbose"
    env:
      GITHUB_TOKEN: "${GITHUB_TOKEN}"
      LOG_LEVEL: "debug"
```

The spawned process doesn't inherit the gateway's environment, which can hold API keys and other credentials. It gets only `PATH`, `HOME`, `USER`, `LOGNAME`, `SHELL`, `TERM`, `TMPDIR`, `LANG` and `LC_ALL` from the gateway (`APPDATA`, `USERPROFILE`, `SYSTEMROOT` and similar on Windows), plus whatever you list under `env`. To pass a variable through from the gateway's environment, reference it with `${VAR}`, as `GITHUB_TOKEN` does above. Variable names are used exactly as written, and the gateway warns at startup if a value is empty, which usually means the referenced variable isn't set.

Proxy and certificate settings aren't inherited, because proxy URLs can contain credentials. If `npx` or `uvx` needs them to download packages, pass them through explicitly, for example `HTTPS_PROXY: "${HTTPS_PROXY}"` or `NODE_EXTRA_CA_CERTS: "${NODE_EXTRA_CA_CERTS}"`.

`env` is only valid on `stdio` servers. The gateway refuses to start if it's set on an `http` or `sse` server.

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
2. The gateway extracts the value
3. The gateway sends `Authorization: Bearer ghp_abc123` to the downstream server

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
- `aws-docs__aws___search_documentation`
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

## Redirects

HTTP and SSE servers can only redirect the gateway to the same host and port. Path changes such as `/mcp` to `/mcp/` work, and so does an upgrade from `http://` to `https://` on the same host. A redirect to a different host, a different port, or from `https://` down to `http://` is refused, and the connection fails with an error naming both addresses.

Following a redirect sends the headers you configured, including pass-through credentials, to the new host. It can also point the gateway at addresses that only the gateway can reach, such as a cloud metadata service. If you trust a server and it needs to redirect to another host, allow it for that server only:

```yaml
downstream_mcp_servers:
  vendor:
    type: http
    url: "https://old.vendor.example/mcp"
    allow_cross_origin_redirects: true   # default: false
```

The simpler fix is usually to set `url` to the address the server redirects to.

## Connection Errors

When the gateway can't connect to a downstream server or a request to it fails, the agent gets a fixed message. The raw error can contain the server's URL, credentials or local command paths, so it only goes to the gateway log, with URLs stripped of userinfo, query strings and fragments. Check the gateway log for the cause.

At startup the gateway connects once to every server that doesn't use pass-through authentication to discover its tools. If that fails, including the 4xx below, the gateway logs `Probe client creation failed` at error level and still starts. That server's tools aren't registered, and `maybedont__list_downstream_servers` shows `tools_discovered: false` for it, so check the gateway log.

Agents see the messages below when the gateway connects a server for a session: pass-through servers, `maybedont__discover_tools`, and the first tool call, prompt or resource read on a server. These messages apply to `maybedont__discover_tools` and to tool calls, prompts and resources on a downstream server:

| Message | Meaning |
|---------|---------|
| `failed to connect to downstream server '<name>'; see the gateway log for details` | The gateway couldn't connect to the server |
| `call to downstream server '<name>' failed; see the gateway log for details` | The server was connected, but sending the request or reading the response failed |
| `...: authorization required; check the pass-through credentials your client sends` | The server answered 401 and uses [pass-through authentication](#pass-through-authentication). Fix the credentials your client sends |
| `...: authorization required; check the headers configured for this server` | The server answered 401. Fix the headers configured for it |

An error the downstream server returns itself, as a JSON-RPC error response, still reaches the agent.

### Initialize rejected with a 4xx status

An `http` server that answers the MCP initialize request with a 4xx status other than 401 fails with:

```
rejected the MCP initialize request with a 4xx status; check its credentials (headers or pass-through auth) and URL; only servers that use the old SSE transport need `type: sse`
```

This usually means a bad token or a wrong URL. GitHub's MCP server, for example, answers an invalid token with 400. Check the token and `url` before switching to `type: sse`. The agent sees this message after `failed to connect to downstream server '<name>': `, and the gateway log entry includes the same text with the underlying error.

## Environment Variable Configuration

You can configure downstream servers entirely via environment variables:

```bash
# STDIO server with an environment variable for its process
export MAYBE_DONT_DOWNSTREAM_MCP_SERVERS_LOCAL_TYPE=stdio
export MAYBE_DONT_DOWNSTREAM_MCP_SERVERS_LOCAL_COMMAND=/usr/local/bin/mcp-server
export MAYBE_DONT_DOWNSTREAM_MCP_SERVERS_LOCAL_ENV_GITHUB_TOKEN=ghp_xxx

# Basic HTTP client
export MAYBE_DONT_DOWNSTREAM_MCP_SERVERS_GITHUB_TYPE=http
export MAYBE_DONT_DOWNSTREAM_MCP_SERVERS_GITHUB_URL=https://api.githubcopilot.com/mcp/

# Pass-through auth (compact format)
export MAYBE_DONT_DOWNSTREAM_MCP_SERVERS_GITHUB_AUTH_PASS_THROUGH_ENABLED=true
export MAYBE_DONT_DOWNSTREAM_MCP_SERVERS_GITHUB_AUTH_PASS_THROUGH_HEADERS=X-Token:Authorization:Bearer\ {value}

# Allow redirects to other hosts (default: false)
export MAYBE_DONT_DOWNSTREAM_MCP_SERVERS_GITHUB_ALLOW_CROSS_ORIGIN_REDIRECTS=true
```

{{< callout type="info" >}}
**Naming note:** Underscores in environment variable names are converted to hyphens in the server name. `AWS_DOCS` becomes `aws-docs`.
{{< /callout >}}
