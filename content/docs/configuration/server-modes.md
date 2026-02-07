---
title: Server Modes
weight: 2
---

Maybe Don't can listen for connections in three different modes, depending on how you want clients to connect.

## STDIO Mode (Default)

In STDIO mode, Maybe Don't communicates via standard input/output. This is useful when an AI agent spawns Maybe Don't as a subprocess.

```yaml
server:
  type: stdio
```

No additional configuration needed. The agent starts Maybe Don't and communicates directly through stdin/stdout.

**Use case:** Direct integration where the AI agent manages the Maybe Don't process lifecycle.

## HTTP Mode

In HTTP mode, Maybe Don't listens on a network port and accepts HTTP requests. This is the most common mode for production deployments.

```yaml
server:
  type: http
  listen_addr: "0.0.0.0:8080"
```

Clients connect to `http://<host>:8080/mcp` to interact with the gateway.

**Use case:** Network-accessible gateway that multiple clients can connect to.

### Listen Address

The `listen_addr` field accepts:

| Value | Description |
|-------|-------------|
| `0.0.0.0:8080` | Listen on all interfaces, port 8080 |
| `127.0.0.1:8080` | Listen only on localhost |
| `:8080` | Listen on all interfaces (shorthand) |

{{< callout type="warning" >}}
If you're running in Docker, use `0.0.0.0` to make the port accessible outside the container. Using `127.0.0.1` will only allow connections from inside the container.
{{< /callout >}}

## SSE Mode

Server-Sent Events mode provides streaming HTTP connections. Some MCP clients prefer this transport for real-time updates.

```yaml
server:
  type: sse
  listen_addr: "0.0.0.0:8080"
```

**Use case:** Clients that require streaming responses or long-lived connections.

### TLS Configuration

SSE mode supports TLS for encrypted connections:

```yaml
server:
  type: sse
  listen_addr: "0.0.0.0:8443"
  sse:
    tls:
      enabled: true
      cert_file: "/path/to/cert.pem"
      key_file: "/path/to/key.pem"
```

{{< callout type="info" >}}
TLS is only available for SSE mode. For HTTP mode with TLS, use a reverse proxy like nginx or Traefik in front of Maybe Don't.
{{< /callout >}}

## Session Timeout

For HTTP and SSE modes, Maybe Don't tracks client sessions. Inactive sessions are cleaned up after a configurable timeout:

```yaml
server:
  type: http
  listen_addr: "0.0.0.0:8080"
  session_timeout_minutes: 30  # Default: 30
```

Set to `0` to disable session timeout (not recommended for production).

## Trusted Proxies

If Maybe Don't runs behind a load balancer or reverse proxy, configure trusted proxies to correctly identify client IPs:

```yaml
server:
  type: http
  listen_addr: "0.0.0.0:8080"
  trusted_proxies:
    - "10.0.0.0/8"
    - "172.16.0.0/12"
    - "192.168.0.0/16"
```

When configured, Maybe Don't uses the rightmost IP in `X-Forwarded-For` that isn't a trusted proxy as the client IP. This is the most secure approach for proxy chains.

## Choosing a Mode

| Mode | When to Use |
|------|-------------|
| **stdio** | AI agent spawns Maybe Don't as subprocess |
| **http** | Network deployment, multiple clients, Docker/Kubernetes |
| **sse** | Clients requiring streaming, real-time updates |

For most deployments, **HTTP mode** is the right choice. It's simple, well-understood, and works with any HTTP-capable client.
