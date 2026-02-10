---
title: OpenAI Codex
weight: 4
---

[OpenAI Codex CLI](https://github.com/openai/codex) is OpenAI's command-line coding assistant. This guide shows how to route Codex's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Agents overview](/docs/mcp-gateway/examples/))
- OpenAI Codex CLI installed
- A GitHub Personal Access Token

## Configure Codex

Codex uses TOML configuration at `~/.codex/config.toml`. Add the MCP server configuration:

```toml
[mcp_servers.maybe-dont]
url = "http://localhost:8080/mcp"
env_http_headers = { "X-GitHub-Token" = "GITHUB_TOKEN" }
```

The `env_http_headers` field maps header names to environment variable names. Codex reads the value of `GITHUB_TOKEN` from your environment and sends it as the `X-GitHub-Token` header.

## Set Environment Variables

Before starting Codex, set your GitHub token:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

## Start Codex

Start Codex normally:

```bash
codex
```

## Verify the Connection

In your Codex session, you should see GitHub tools prefixed with `github__`.

Test the gateway independently:

```bash
curl -s http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}' | head -c 200
```

If you see a JSON response with tool definitions, the gateway is working.

## Static Headers

If you prefer to hardcode the token (not recommended for secrets):

```toml
[mcp_servers.maybe-dont]
url = "http://localhost:8080/mcp"
http_headers = { "X-GitHub-Token" = "ghp_your_token_here" }
```

{{< callout type="warning" >}}
**Security note:** Prefer `env_http_headers` over `http_headers` for tokens and secrets. Static headers are stored in plain text.
{{< /callout >}}

## What's Happening

When Codex calls a tool:

1. Codex sends the request to `localhost:8080/mcp` with your GitHub token
2. The gateway validates the request using configured policies
3. If allowed, the gateway forwards to GitHub
4. All activity is logged to the audit log

## Troubleshooting

### Connection issues

```bash
# Test the gateway is running
curl http://localhost:8080/mcp -X POST \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Token: $GITHUB_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Authentication errors

Verify your GitHub token works:

```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user
```
