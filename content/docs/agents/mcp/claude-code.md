---
title: Claude Code
weight: 1
aliases:
  - /docs/mcp-gateway/examples/connecting-claude-code/
---

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) is Anthropic's CLI coding assistant. This guide shows how to route Claude Code's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [MCP overview](/docs/agents/mcp/))
- [Claude Code installed](https://docs.anthropic.com/en/docs/claude-code)
- A GitHub Personal Access Token

## Configure Claude Code

Claude Code uses the `claude mcp add` command to register MCP servers. Instead of connecting directly to GitHub, we'll point it at the gateway:

```bash
# Set your GitHub token
export GITHUB_TOKEN="ghp_your_token_here"

# Add the gateway as the MCP server
claude mcp add maybe-dont http://localhost:8080/mcp \
  --transport http \
  --header "X-GitHub-Token: $GITHUB_TOKEN"
```

This tells Claude Code to:
- Connect to `http://localhost:8080/mcp` (the gateway)
- Use HTTP transport
- Send your GitHub token in the `X-GitHub-Token` header

The gateway will forward this token to GitHub using pass-through authentication.

## Verify the Connection

Check that Claude Code can see the MCP server:

```bash
claude mcp list
```

You should see `maybe-dont` listed with the tools available from GitHub.

## Start Using It

Start Claude Code normally:

```bash
claude
```

From within Claude Code, you can verify MCP tools are available:

```
/mcp
```

This shows all available MCP tools. You should see GitHub tools prefixed with `github__`:
- `github__create_issue`
- `github__search_code`
- `github__list_repos`
- etc.

## What's Happening

When Claude Code calls a tool:

1. Claude Code sends the request to `localhost:8080/mcp` with `X-GitHub-Token` header
2. The gateway receives the request and runs validation (CEL + AI policies)
3. If allowed, the gateway forwards to GitHub with `Authorization: Bearer <token>`
4. The response flows back through the gateway to Claude Code
5. Everything is logged to the audit log

## Removing the Configuration

To disconnect Claude Code from the gateway:

```bash
claude mcp remove maybe-dont
```

## Troubleshooting

### "Connection refused"

Make sure the gateway container is running:

```bash
docker ps | grep maybe-dont
```

### "Unauthorized" errors

Check that your GitHub token is valid and being passed correctly:

```bash
echo $GITHUB_TOKEN  # Should show your token
```

### Tools not showing up

Check the gateway logs. When an agent connects, the gateway discovers tools from the downstream MCP server and logs the tool count:

```bash
docker logs maybe-dont
```

Enable debug logging to see individual tool names.
