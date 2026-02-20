---
title: GitHub Copilot
weight: 2
---

[GitHub Copilot](https://github.com/features/copilot) is GitHub's AI coding assistant, available in VS Code, JetBrains, and other IDEs. This guide shows how to route Copilot's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Agents overview](/docs/mcp-gateway/examples/))
- [GitHub Copilot](https://github.com/features/copilot) active in VS Code (v1.102+)
- A GitHub Personal Access Token

## Configure Copilot

Copilot reads MCP server configuration from `.vscode/mcp.json` in your workspace. Create this file:

```json
{
  "servers": {
    "maybe-dont": {
      "type": "http",
      "url": "http://localhost:8080/mcp",
      "headers": {
        "X-GitHub-Token": "${input:github-token}"
      }
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "github-token",
      "description": "GitHub Personal Access Token",
      "password": true
    }
  ]
}
```

VS Code will prompt you for the token when the server starts. The `password: true` flag masks the input.

### Using Environment Variables

If you prefer environment variables over interactive prompts:

```json
{
  "servers": {
    "maybe-dont": {
      "type": "http",
      "url": "http://localhost:8080/mcp",
      "headers": {
        "X-GitHub-Token": "${env:GITHUB_TOKEN}"
      }
    }
  }
}
```

Set the variable before launching VS Code:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

## Start the Server

After saving `.vscode/mcp.json`, VS Code shows a **Start** button above the server configuration. Click it to connect, or use the command palette: **MCP: List Servers**.

## Verify the Connection

In Copilot Chat, you should see GitHub tools available. The tools will be prefixed with `github__`:
- `github__create_issue`
- `github__search_code`
- `github__list_repos`
- etc.

You can also check the MCP servers panel in VS Code to confirm the connection status.

## What's Happening

When Copilot calls a tool:

1. Copilot sends the request to `localhost:8080/mcp` with `X-GitHub-Token` header
2. The gateway validates the request using CEL and AI policies
3. If allowed, the gateway forwards to GitHub with `Authorization: Bearer <token>`
4. The response flows back through the gateway to Copilot
5. Everything is logged to the audit log

## Troubleshooting

### Tools not appearing

- Check the MCP servers panel in VS Code for connection errors
- Verify the gateway is running on port 8080
- Ensure `.vscode/mcp.json` has valid JSON syntax

### "Connection refused"

Verify the gateway container is running:

```bash
docker ps | grep maybe-dont
```

Check the gateway logs for errors:

```bash
docker logs maybe-dont
```

### Authentication errors

- Verify your GitHub token is valid and has appropriate scopes
- Check the gateway's logs for pass-through auth issues
