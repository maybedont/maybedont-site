---
title: Connecting Cody
weight: 7
---

[Cody](https://sourcegraph.com/cody) is Sourcegraph's AI coding assistant. This guide shows how to route Cody's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Examples overview](/docs/examples/))
- [Cody installed](https://sourcegraph.com/cody) in your IDE
- A GitHub Personal Access Token

## Configure Cody

Cody's MCP configuration varies by IDE. The general approach is to configure an MCP server in Cody's settings.

### VS Code

In VS Code with the Cody extension:

1. Open Settings (Cmd/Ctrl + ,)
2. Search for "Cody MCP"
3. Add a new MCP server configuration

```json
{
  "cody.mcp.servers": {
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

### JetBrains IDEs

For JetBrains IDEs, check the Cody plugin settings for MCP server configuration.

## Verify the Connection

After configuring, Cody should have access to GitHub tools through Maybe Don't. The tools will be prefixed with `github__`.

## What's Happening

When Cody calls a tool:

1. Cody sends the request to `localhost:8080/mcp`
2. Maybe Don't validates using CEL and AI policies
3. If allowed, Maybe Don't forwards to GitHub
4. All activity is logged to the audit log

## Troubleshooting

### Tools not appearing

- Check Cody's output/logs for MCP errors
- Verify Maybe Don't is running
- Ensure the JSON configuration is valid

### Authentication errors

- Verify your GitHub token is valid
- Check Maybe Don't's logs for pass-through auth issues
