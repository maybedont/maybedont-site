---
title: Cursor
weight: 2
aliases:
  - /docs/mcp-gateway/examples/connecting-cursor/
---

[Cursor](https://cursor.sh) is an AI-powered code editor. This guide shows how to route Cursor's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [MCP overview](/docs/agents/mcp/))
- [Cursor installed](https://cursor.sh) (v0.48.0+ for HTTP support)
- A GitHub Personal Access Token

## Configure Cursor

Cursor stores MCP configuration in `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project-level). Create or edit the file:

```json
{
  "mcpServers": {
    "maybe-dont": {
      "url": "http://localhost:8080/mcp",
      "headers": {
        "X-GitHub-Token": "ghp_your_token_here"
      }
    }
  }
}
```

Replace `ghp_your_token_here` with your actual GitHub Personal Access Token.

{{< callout type="info" >}}
Cursor supports environment variable interpolation. For better security, use `"X-GitHub-Token": "${env:GITHUB_TOKEN}"` and set the `GITHUB_TOKEN` environment variable before launching Cursor.
{{< /callout >}}

## Restart Cursor

After updating the configuration, restart Cursor to pick up the changes.

## Verify the Connection

In Cursor, open the MCP tools panel to confirm the GitHub tools are available. You should see tools prefixed with `github__`.

You can also try asking Cursor to list its available MCP tools as an end-to-end check.

## What's Happening

When Cursor calls a tool:

1. Cursor sends the request to `localhost:8080/mcp` with `X-GitHub-Token` header
2. The gateway validates the request and forwards to GitHub
3. The response flows back through the gateway
4. All activity is logged to the audit log

## Troubleshooting

### Tools not appearing

- Verify the gateway container is running: `docker ps | grep maybe-dont`
- Check the gateway logs for tool discovery messages: `docker logs maybe-dont`
- Check Cursor's MCP logs for connection errors
- Ensure the JSON syntax in `mcp.json` is valid

### Authentication errors

- Verify your GitHub token is valid
- Check the gateway's logs for pass-through auth issues
