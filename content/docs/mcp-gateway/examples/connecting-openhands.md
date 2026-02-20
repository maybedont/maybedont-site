---
title: OpenHands
weight: 6
---

[OpenHands](https://github.com/All-Hands-AI/OpenHands) is an open-source AI software development agent. This guide shows how to route OpenHands' MCP connections through Maybe Don't.

{{< callout type="info" >}}
**Beyond MCP:** OpenHands can also use the [Action Validate API](/docs/api/action-validate/) for pre-execution safety checks on all action types — shell commands, file operations, and browser actions — not just MCP tool calls. The Action Validate API integrates with OpenHands' `SecurityAnalyzer` interface to evaluate every action against your policies before it runs.
{{< /callout >}}

## Prerequisites

- Maybe Don't running (see [Agents overview](/docs/mcp-gateway/examples/))
- [OpenHands installed](https://github.com/All-Hands-AI/OpenHands)
- A GitHub Personal Access Token

## Configure OpenHands

OpenHands uses TOML configuration in `config.toml`. Add the MCP server using the `shttp_servers` field (Streamable HTTP):

```toml
[mcp]
shttp_servers = [
  {url = "http://localhost:8080/mcp", api_key = ""}
]
```

{{< callout type="warning" >}}
**Custom header limitation:** OpenHands' MCP configuration supports `api_key` for authentication but does not support arbitrary custom headers like `X-GitHub-Token`. If your setup requires pass-through authentication with custom headers, you'll need to configure the gateway to accept requests without that header, or use an alternative authentication approach.
{{< /callout >}}

### Workaround for Custom Headers

If you need to pass a GitHub token through to the downstream server, consider configuring the gateway to read the token from an environment variable or config file rather than requiring it as a request header. This keeps OpenHands' configuration simple while still authenticating with the downstream GitHub MCP server.

## Start OpenHands

Start OpenHands with your configuration:

```bash
# Using the default config.toml location
openhands
```

## Verify the Connection

In OpenHands, you should see GitHub tools prefixed with `github__` in the available tools. You can also try asking OpenHands to list its available MCP tools as an end-to-end check.

## What's Happening

When OpenHands calls a tool:

1. OpenHands sends the request to `localhost:8080/mcp`
2. The gateway validates the request using CEL and AI policies
3. If allowed, the gateway forwards to GitHub
4. All activity is logged to the audit log

This is particularly useful with OpenHands since it can be quite autonomous — you want visibility into what it's doing.

## Troubleshooting

### Connection refused

Verify the gateway container is running:

```bash
docker ps | grep maybe-dont
```

Check the gateway logs for errors:

```bash
docker logs maybe-dont
```

### MCP server not loading

Check that your `config.toml` syntax is correct. OpenHands uses inline arrays for MCP server configuration:

```toml
# Correct (inline array)
shttp_servers = [{url = "http://localhost:8080/mcp"}]

# Also correct (simple string for no-auth servers)
shttp_servers = ["http://localhost:8080/mcp"]
```
