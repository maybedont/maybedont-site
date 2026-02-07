---
title: Connecting Windsurf
weight: 6
---

[Windsurf](https://codeium.com/windsurf) is Codeium's AI-powered IDE. This guide shows how to route Windsurf's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Examples overview](/docs/examples/))
- [Windsurf installed](https://codeium.com/windsurf)
- A GitHub Personal Access Token

## Configure Windsurf

Windsurf stores MCP configuration in its settings. Access the MCP settings through:

1. Open Windsurf
2. Go to Settings (Cmd/Ctrl + ,)
3. Search for "MCP" or navigate to the MCP section
4. Add a new MCP server

Configure with these values:

| Setting | Value |
|---------|-------|
| Name | `maybe-dont` |
| URL | `http://localhost:8080/mcp` |
| Transport | HTTP |

Add a custom header for authentication:

| Header | Value |
|--------|-------|
| `X-GitHub-Token` | Your GitHub PAT |

### JSON Configuration

If Windsurf supports JSON configuration, you can use:

```json
{
  "mcp": {
    "servers": {
      "maybe-dont": {
        "url": "http://localhost:8080/mcp",
        "transport": "http",
        "headers": {
          "X-GitHub-Token": "ghp_your_token_here"
        }
      }
    }
  }
}
```

## Restart Windsurf

After updating the configuration, restart Windsurf to pick up the changes.

## Verify the Connection

In Windsurf, you should now have access to GitHub tools through Maybe Don't. Look for tools prefixed with `github__`.

## What's Happening

When Windsurf calls a tool:

1. Windsurf sends the request to `localhost:8080/mcp`
2. Maybe Don't validates and forwards to GitHub
3. All activity is logged to the audit log

## Troubleshooting

### Tools not appearing

- Check Windsurf's output/logs for MCP connection errors
- Verify Maybe Don't is running on the expected port
- Ensure the MCP configuration is valid

### Authentication errors

- Verify your GitHub token is valid and has appropriate scopes
- Check that the header name is exactly `X-GitHub-Token`
