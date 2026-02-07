---
title: Connecting OpenAI Codex
weight: 3
---

[OpenAI Codex CLI](https://github.com/openai/codex) is OpenAI's command-line coding assistant. This guide shows how to route Codex's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Examples overview](/docs/examples/))
- OpenAI Codex CLI installed
- A GitHub Personal Access Token

## Configure Codex

Codex uses a JSON configuration file for MCP servers. Create or edit `~/.codex/mcp.json`:

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

## Using Environment Variables

For better security, you can use environment variables in your config:

```json
{
  "mcpServers": {
    "maybe-dont": {
      "url": "http://localhost:8080/mcp",
      "transport": "http",
      "env": {
        "GITHUB_TOKEN": true
      },
      "headers": {
        "X-GitHub-Token": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

Then set the environment variable before starting Codex:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
codex
```

## Verify the Connection

Start Codex and verify MCP tools are available. You should see GitHub tools prefixed with `github__`.

## What's Happening

When Codex calls a tool:

1. Codex sends the request to `localhost:8080/mcp` with your GitHub token
2. Maybe Don't validates the request using configured policies
3. If allowed, Maybe Don't forwards to GitHub
4. All activity is logged to the audit log

## Troubleshooting

### Connection issues

```bash
# Test Maybe Don't is running
curl http://localhost:8080/mcp -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Authentication errors

Verify your GitHub token works:

```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user
```
