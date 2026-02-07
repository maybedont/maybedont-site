---
title: Connecting Claude Code
weight: 1
---

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) is Anthropic's CLI coding assistant. This guide shows how to route Claude Code's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Examples overview](/docs/examples/))
- [Claude Code installed](https://docs.anthropic.com/en/docs/claude-code)
- A GitHub Personal Access Token

## Configure Claude Code

Claude Code uses the `claude mcp add` command to register MCP servers. Instead of connecting directly to GitHub, we'll point it at Maybe Don't:

```bash
# Set your GitHub token
export GITHUB_TOKEN="ghp_your_token_here"

# Add Maybe Don't as the MCP server
claude mcp add maybe-dont http://localhost:8080/mcp \
  --transport http \
  --header "X-GitHub-Token: $GITHUB_TOKEN"
```

This tells Claude Code to:
- Connect to `http://localhost:8080/mcp` (Maybe Don't)
- Use HTTP transport
- Send your GitHub token in the `X-GitHub-Token` header

Maybe Don't will forward this token to GitHub using pass-through authentication.

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
2. Maybe Don't receives the request and runs validation (CEL + AI policies)
3. If allowed, Maybe Don't forwards to GitHub with `Authorization: Bearer <token>`
4. The response flows back through Maybe Don't to Claude Code
5. Everything is logged to the audit log

## Removing the Configuration

To disconnect Claude Code from Maybe Don't:

```bash
claude mcp remove maybe-dont
```

## Troubleshooting

### "Connection refused"

Make sure Maybe Don't is running and listening on port 8080:

```bash
curl http://localhost:8080/mcp -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### "Unauthorized" errors

Check that your GitHub token is valid and being passed correctly:

```bash
echo $GITHUB_TOKEN  # Should show your token
```

### Tools not showing up

Verify Maybe Don't is correctly connecting to GitHub by checking its logs for successful tool discovery.
