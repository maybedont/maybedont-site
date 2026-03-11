---
title: Cody
weight: 7
aliases:
  - /docs/mcp-gateway/examples/connecting-cody/
---

[Cody](https://sourcegraph.com/cody) is Sourcegraph's AI coding assistant. This guide covers connecting Cody to Maybe Don't.

## Prerequisites

- Maybe Don't running (see [MCP overview](/docs/agents/mcp/))
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

You can also try asking Cody to list its available MCP tools as an end-to-end check.

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
- Verify the gateway container is running: `docker ps | grep maybe-dont`
- Check the gateway logs for tool discovery messages: `docker logs maybe-dont`

### Authentication errors

- Verify your GitHub token is valid
- Check the gateway's logs for pass-through auth issues
