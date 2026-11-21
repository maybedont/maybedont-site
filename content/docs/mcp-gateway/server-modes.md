---
title: Server Configuration
linkTitle: Server
weight: 2
---

The gateway supports three transport modes. Choose the one that fits your deployment.

## Choosing a Mode

| Mode | When to Use |
|------|-------------|
| **http** (default) | Network deployment, multiple clients, Docker/Kubernetes |
| **stdio** | AI agent spawns the gateway as a subprocess (e.g., Claude Code, Cursor) |
| **sse** | Legacy clients that require SSE transport (deprecated) |

HTTP supports Streamable HTTP (the current MCP transport standard), works with any HTTP-capable client, and enables the [CLI gateway](/docs/cli-gateway/) REST endpoint. Use STDIO only when your agent spawns the gateway as a subprocess.

## HTTP Mode

In HTTP mode, the gateway listens on a network port and accepts HTTP requests. This is the default.

```yaml
server:
  type: http
  listen_addr: "0.0.0.0:8080"
```

Clients connect to `http://<host>:8080/mcp` to interact with the gateway.

**Use case:** Network-accessible gateway serving multiple clients, container deployments, or anywhere you need the REST endpoint.

### Listen Address

The `listen_addr` field accepts any `host:port` combination. Common values:

| Value | Description |
|-------|-------------|
| `0.0.0.0:8080` | All interfaces, port 8080 |
| `127.0.0.1:8080` | Localhost only |
| `:8080` | All interfaces (shorthand) |

{{< callout type="warning" >}}
If you're running in Docker, use `0.0.0.0` to make the port accessible outside the container. Using `127.0.0.1` only allows connections from inside the container.
{{< /callout >}}

## STDIO Mode

In STDIO mode, the gateway communicates via standard input/output. The AI agent spawns it as a subprocess and talks to it over stdin/stdout — the standard MCP transport for local tools.

```yaml
server:
  type: stdio
```

No additional configuration needed. The agent starts the process and communicates directly through stdin/stdout.

**Use case:** Single-user, local setups where the AI agent manages the process lifecycle. This is the simplest mode and requires no network configuration.

## SSE Mode

{{< callout type="warning" >}}
SSE transport is **deprecated** in the MCP specification, replaced by Streamable HTTP (`type: http`). Use HTTP mode for new deployments. SSE mode remains available for clients that haven't migrated yet.
{{< /callout >}}

Server-Sent Events mode provides streaming HTTP connections.

```yaml
server:
  type: sse
  listen_addr: "0.0.0.0:8080"
```

**Use case:** Legacy clients that require SSE transport specifically.

### TLS

The gateway serves plain HTTP in every mode and has no TLS settings of its own. To serve it over HTTPS, terminate TLS in a reverse proxy in front of the gateway and have the proxy forward to the gateway's `listen_addr`. If the proxy sets `X-Forwarded-For`, also configure [trusted proxies](#trusted-proxies) so the gateway picks the right client IP.

{{< callout type="warning" >}}
Earlier versions accepted a `server.sse.tls` block but never used it, so the gateway kept serving plain HTTP. Starting with 1.9.0 the gateway refuses to start if `server.sse.tls` is set. Remove it from your config and put a reverse proxy in front of the gateway instead.
{{< /callout >}}

## Session Timeout

For HTTP and SSE modes, the gateway tracks client sessions. Inactive sessions are cleaned up after a configurable timeout:

```yaml
server:
  session_timeout_minutes: 30   # default
```

Set to `0` to disable session timeout (not recommended for production).

## Trusted Proxies

If the gateway runs behind a load balancer or reverse proxy, configure trusted proxies to correctly identify client IPs:

```yaml
server:
  trusted_proxies:
    - "10.0.0.0/8"
    - "172.16.0.0/12"
    - "192.168.0.0/16"
```

When configured, the gateway uses the rightmost IP in `X-Forwarded-For` that isn't a trusted proxy as the client IP.
