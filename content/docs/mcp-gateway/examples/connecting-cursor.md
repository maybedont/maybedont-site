---
title: Cursor
weight: 3
---

[Cursor](https://cursor.sh) is an AI-powered code editor. This guide shows how to route Cursor's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Agents overview](/docs/mcp-gateway/examples/))
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

Test the gateway independently:

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | head -c 200
```

If you see a JSON response with tool definitions, the gateway is working.

## What's Happening

When Cursor calls a tool:

1. Cursor sends the request to `localhost:8080/mcp` with `X-GitHub-Token` header
2. The gateway validates the request and forwards to GitHub
3. The response flows back through the gateway
4. All activity is logged to the audit log

## Troubleshooting

### Tools not appearing

- Verify the gateway is running: `curl http://localhost:8080/mcp`
- Check Cursor's MCP logs for connection errors
- Ensure the JSON syntax in `mcp.json` is valid

### Authentication errors

- Verify your GitHub token is valid
- Check the gateway's logs for pass-through auth issues
