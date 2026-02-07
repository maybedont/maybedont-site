---
title: Connecting OpenHands
weight: 5
---

[OpenHands](https://github.com/All-Hands-AI/OpenHands) is an open-source AI software development agent. This guide shows how to route OpenHands' MCP connections through Maybe Don't.

## Prerequisites

- Maybe Don't running (see [Examples overview](/docs/examples/))
- [OpenHands installed](https://github.com/All-Hands-AI/OpenHands)
- A GitHub Personal Access Token

## Configure OpenHands

OpenHands uses a YAML configuration file. Add the MCP server configuration:

```yaml
# config.yaml
mcp:
  servers:
    maybe-dont:
      url: "http://localhost:8080/mcp"
      transport: http
      headers:
        X-GitHub-Token: "${GITHUB_TOKEN}"
```

## Set Environment Variables

Before starting OpenHands, set your GitHub token:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

## Start OpenHands

Start OpenHands with your configuration:

```bash
openhands --config config.yaml
```

## Verify the Connection

OpenHands should now have access to GitHub tools through Maybe Don't. The tools will be prefixed with `github__`.

## What's Happening

When OpenHands calls a tool:

1. OpenHands sends the request to `localhost:8080/mcp`
2. Maybe Don't validates the request using CEL and AI policies
3. If allowed, Maybe Don't forwards to GitHub
4. All activity is logged to the audit log

This is particularly useful with OpenHands since it can be quite autonomous - you want visibility into what it's doing.

## Troubleshooting

### Connection refused

Verify Maybe Don't is running:

```bash
curl http://localhost:8080/mcp -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Environment variable not expanded

Make sure you're using the correct syntax for environment variables in your config and that the variable is set before starting OpenHands.
