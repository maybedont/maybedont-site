---
title: OpenAI Codex
weight: 5
aliases:
  - /docs/mcp-gateway/examples/connecting-openai-codex/
---

[OpenAI Codex CLI](https://github.com/openai/codex) is OpenAI's command-line coding assistant. This guide shows how to route Codex's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [MCP overview](/docs/agents/mcp/))
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

In your Codex session, try asking Codex to list its available MCP tools. You should see GitHub tools prefixed with `github__`.

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

Verify the gateway container is running:

```bash
docker ps | grep maybe-dont
```

Check the gateway logs for tool discovery messages or errors:

```bash
docker logs maybe-dont
```

### Authentication errors

Verify your GitHub token works:

```bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user
```
