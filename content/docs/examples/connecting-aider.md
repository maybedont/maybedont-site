---
title: Connecting Aider
weight: 8
---

[Aider](https://aider.chat) is an AI pair programming tool for your terminal. This guide shows how to route Aider's MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Examples overview](/docs/examples/))
- [Aider installed](https://aider.chat/docs/install.html)
- A GitHub Personal Access Token

## Configure Aider

Aider can be configured via command-line flags or a YAML config file. Create or edit `~/.aider.conf.yml`:

```yaml
# MCP server configuration
mcp-server-url: "http://localhost:8080/mcp"
mcp-transport: http
mcp-headers:
  X-GitHub-Token: "${GITHUB_TOKEN}"
```

## Set Environment Variables

Before starting Aider, set your GitHub token:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

## Start Aider

Start Aider normally:

```bash
aider
```

Or pass the configuration via command line:

```bash
aider \
  --mcp-server-url "http://localhost:8080/mcp" \
  --mcp-transport http \
  --mcp-header "X-GitHub-Token: $GITHUB_TOKEN"
```

## Verify the Connection

Aider should now have access to GitHub tools through Maybe Don't. You can list available tools within Aider's interface.

## What's Happening

When Aider calls a tool:

1. Aider sends the request to `localhost:8080/mcp`
2. Maybe Don't validates the request
3. If allowed, Maybe Don't forwards to GitHub
4. All activity is logged to the audit log

## Why This Matters for Aider

Aider is designed to make changes to your codebase autonomously. Having Maybe Don't in the middle gives you:

- Visibility into what GitHub operations Aider is performing
- The ability to block dangerous operations
- An audit trail of all actions

## Troubleshooting

### Connection refused

Verify Maybe Don't is running:

```bash
curl http://localhost:8080/mcp -X POST \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Token: $GITHUB_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Environment variables not expanding

Make sure to use the correct syntax in your config file and that variables are set before starting Aider.

### No tools available

Check that Maybe Don't is successfully connecting to GitHub by reviewing its logs. Look for tool discovery messages.
