---
title: Gemini Code Assist
weight: 5
---

[Gemini Code Assist](https://cloud.google.com/gemini/docs/codeassist) is Google's AI coding assistant. This guide shows how to route Gemini's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Agents overview](/docs/mcp-gateway/examples/))
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

Test the gateway independently:

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | head -c 200
```

If you see a JSON response with tool definitions, the gateway is working.

## What's Happening

When Gemini calls a tool:

1. Gemini sends the request to `localhost:8080/mcp`
2. The gateway validates and forwards to GitHub
3. All activity is logged to the audit log

## Troubleshooting

### Tools not appearing

- Verify the gateway is running
- Check your IDE's Gemini logs for connection errors
- Ensure the JSON syntax is valid

### Authentication errors

- Verify your GitHub token is valid
- Check that the header name matches exactly: `X-GitHub-Token`

### Testing the connection

```bash
curl http://localhost:8080/mcp -X POST \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Token: $GITHUB_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```
