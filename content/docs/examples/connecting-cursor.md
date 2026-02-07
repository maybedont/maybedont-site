---
title: Connecting Cursor
weight: 2
---

[Cursor](https://cursor.sh) is an AI-powered code editor. This guide shows how to route Cursor's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Examples overview](/docs/examples/))
- [Cursor installed](https://cursor.sh)
- A GitHub Personal Access Token

## Configure Cursor

Cursor stores MCP configuration in `~/.cursor/mcp.json`. Create or edit this file:

```json
{
  "mcpServers": {
    "maybe-dont": {
      "url": "http://localhost:8080/mcp",
      "transport": "http",
      "headers": {
        "X-GitHub-Token": "ghp_your_token_here"
      }
    }
  }
}
```

Replace `ghp_your_token_here` with your actual GitHub Personal Access Token.

{{< callout type="warning" >}}
**Security note:** Storing tokens in config files isn't ideal. Check Cursor's documentation for environment variable support or credential management options.
{{< /callout >}}

## Restart Cursor

After updating the configuration, restart Cursor to pick up the changes.

## Verify the Connection

In Cursor, you should now have access to GitHub tools through Maybe Don't. The tools will be prefixed with `github__`.

## What's Happening

When Cursor calls a tool:

1. Cursor sends the request to `localhost:8080/mcp` with `X-GitHub-Token` header
2. Maybe Don't validates the request and forwards to GitHub
3. The response flows back through Maybe Don't
4. All activity is logged to the audit log

## Troubleshooting

### Tools not appearing

- Verify Maybe Don't is running: `curl http://localhost:8080/mcp`
- Check Cursor's MCP logs for connection errors
- Ensure the JSON syntax in `mcp.json` is valid

### Authentication errors

- Verify your GitHub token is valid
- Check Maybe Don't's logs for pass-through auth issues
