---
title: Cody
weight: 7
---

[Cody](https://sourcegraph.com/cody) is Sourcegraph's AI coding assistant. This guide covers connecting Cody to Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Agents overview](/docs/mcp-gateway/examples/))
- [Cody installed](https://sourcegraph.com/cody) in VS Code
- A GitHub Personal Access Token

## HTTP Transport Limitation

Cody currently supports **stdio MCP servers only** — it cannot connect directly to an HTTP MCP server. This means you cannot point Cody at `http://localhost:8080/mcp` the way you can with Cursor, GitHub Copilot, or Claude Code.

## Workaround: stdio-to-HTTP Bridge

To connect Cody to the gateway, you need a bridge that translates between stdio and HTTP. Tools like [`mcp-remote`](https://github.com/geelen/mcp-remote) or [`supergateway`](https://github.com/nichochar/supergateway) can do this.

### Example with mcp-remote

In VS Code `settings.json`:

```json
{
  "cody.mcpServers": {
    "maybe-dont": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8080/mcp",
        "--header",
        "X-GitHub-Token: ${GITHUB_TOKEN}"
      ],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

This starts `mcp-remote` as a local stdio process that proxies requests to the gateway over HTTP.

{{< callout type="info" >}}
The `cody.mcpServers` key is used for MCP server configuration in VS Code with Cody. This requires a recent version of the Cody extension.
{{< /callout >}}

## Verify the Connection

In VS Code, check Cody's MCP tools panel for tools prefixed with `github__`.

Test the gateway independently:

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | head -c 200
```

If you see a JSON response with tool definitions, the gateway is working.

## What's Happening

When Cody calls a tool:

1. Cody communicates with `mcp-remote` over stdio
2. `mcp-remote` forwards the request to `localhost:8080/mcp` over HTTP
3. The gateway validates using CEL and AI policies
4. If allowed, the gateway forwards to GitHub
5. All activity is logged to the audit log

## Troubleshooting

### mcp-remote not found

Make sure you have `npx` available (comes with Node.js):

```bash
npx --version
```

### Tools not appearing

- Check Cody's output/logs for MCP errors
- Verify the gateway is running
- Test the connection directly:

```bash
curl http://localhost:8080/mcp -X POST \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Token: $GITHUB_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Authentication errors

- Verify your GitHub token is valid
- Check the gateway's logs for pass-through auth issues
