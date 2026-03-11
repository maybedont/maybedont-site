---
title: Gemini Code Assist
weight: 3
aliases:
  - /docs/mcp-gateway/examples/connecting-gemini/
---

[Gemini Code Assist](https://cloud.google.com/gemini/docs/codeassist) is Google's AI coding assistant. This guide shows how to route Gemini's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [MCP overview](/docs/agents/mcp/))
- Gemini Code Assist set up in your IDE
- A GitHub Personal Access Token

## Configure Gemini Code Assist

Gemini Code Assist stores MCP configuration in `~/.gemini/settings.json`. Create or edit this file:

```json
{
  "mcpServers": {
    "maybe-dont": {
      "httpUrl": "http://localhost:8080/mcp",
      "headers": {
        "X-GitHub-Token": "ghp_your_token_here"
      }
    }
  }
}
```

Replace `ghp_your_token_here` with your actual GitHub Personal Access Token.

{{< callout type="info" >}}
Use `httpUrl` for HTTP streaming (Streamable HTTP) servers. Use `url` instead if the server uses SSE transport (typically indicated by `/sse` in the endpoint path).
{{< /callout >}}

You can also use a per-workspace config at `.gemini/settings.json` in your project root.

### JetBrains IDEs

For JetBrains IDEs (IntelliJ, PyCharm, etc.), create or edit the `mcp.json` file in the IDE's configuration directory. The format is the same:

```json
{
  "mcpServers": {
    "maybe-dont": {
      "httpUrl": "http://localhost:8080/mcp",
      "headers": {
        "X-GitHub-Token": "ghp_your_token_here"
      }
    }
  }
}
```

## Verify the Connection

After configuring, Gemini should show GitHub tools available. Look for tools prefixed with `github__`.

You can also try asking Gemini to list its available MCP tools as an end-to-end check.

## What's Happening

When Gemini calls a tool:

1. Gemini sends the request to `localhost:8080/mcp`
2. The gateway validates and forwards to GitHub
3. All activity is logged to the audit log

## Troubleshooting

### Tools not appearing

- Verify the gateway container is running: `docker ps | grep maybe-dont`
- Check the gateway logs for tool discovery messages: `docker logs maybe-dont`
- Check your IDE's Gemini logs for connection errors
- Ensure the JSON syntax is valid

### Authentication errors

- Verify your GitHub token is valid
- Check that the header name matches exactly: `X-GitHub-Token`
