---
title: Connecting Gemini Code Assist
weight: 4
---

[Gemini Code Assist](https://cloud.google.com/gemini/docs/codeassist) is Google's AI coding assistant. This guide shows how to route Gemini's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Examples overview](/docs/examples/))
- Gemini Code Assist set up in your IDE
- A GitHub Personal Access Token

## Configure Gemini Code Assist

Gemini Code Assist's MCP configuration varies by IDE. Check your IDE's Gemini extension settings for MCP server configuration.

The general pattern is to add an MCP server with:

| Setting | Value |
|---------|-------|
| URL | `http://localhost:8080/mcp` |
| Transport | HTTP |
| Headers | `X-GitHub-Token: <your-token>` |

### VS Code Example

In VS Code with Gemini Code Assist, check the extension settings for MCP configuration options. You'll typically find a JSON configuration section:

```json
{
  "gemini.mcp.servers": {
    "maybe-dont": {
      "url": "http://localhost:8080/mcp",
      "headers": {
        "X-GitHub-Token": "ghp_your_token_here"
      }
    }
  }
}
```

### JetBrains IDEs

For JetBrains IDEs (IntelliJ, PyCharm, etc.), check the Gemini plugin settings for MCP server configuration.

## Verify the Connection

After configuring, Gemini should show GitHub tools available. Look for tools prefixed with `github__`.

## What's Happening

When Gemini calls a tool:

1. Gemini sends the request to `localhost:8080/mcp`
2. Maybe Don't validates and forwards to GitHub
3. All activity is logged to the audit log

## Troubleshooting

### Tools not appearing

- Verify Maybe Don't is running
- Check your IDE's Gemini logs for connection errors
- Ensure the MCP configuration syntax is correct for your IDE

### Authentication errors

- Verify your GitHub token is valid
- Check that the header name matches exactly: `X-GitHub-Token`
