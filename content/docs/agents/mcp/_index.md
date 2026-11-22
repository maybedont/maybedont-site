---
title: MCP
weight: 1
aliases:
  - /docs/mcp-gateway/examples/
---

These guides show how to connect AI coding agents to Maybe Don't via the [MCP gateway](/docs/mcp-gateway/) proxy. The gateway sits between your agent and your MCP servers, evaluating every tool call against your policies before it reaches the downstream server.

Each example uses [GitHub's MCP server](https://github.com/github/github-mcp-server) as the downstream service — it's a practical example since most developers already have a GitHub account. Substitute any MCP server you like; the agent-side wiring is the same.

## Prerequisites

Before following any of these guides, you'll need:

1. **Maybe Don't running** — Follow [Get Started](/docs/get-started/) first
2. **A downstream MCP server** — The examples use GitHub's MCP server, so you'll need a [GitHub Personal Access Token](https://github.com/settings/tokens). If you're using a different MCP server, substitute its URL and auth configuration
3. **Your AI coding assistant installed** — Links provided in each guide

## Choose Your Agent

{{< cards >}}
  {{< card link="claude-code" title="Claude Code" subtitle="Anthropic's CLI coding assistant" >}}
  {{< card link="github-copilot" title="GitHub Copilot" subtitle="GitHub's AI coding assistant" >}}
  {{< card link="cursor" title="Cursor" subtitle="AI-powered code editor" >}}
  {{< card link="openai-codex" title="OpenAI Codex" subtitle="OpenAI's coding CLI" >}}
  {{< card link="gemini-code-assist" title="Gemini Code Assist" subtitle="Google's AI coding assistant" >}}
  {{< card link="openhands" title="OpenHands" subtitle="Open-source AI developer" >}}
  {{< card link="cody" title="Cody" subtitle="Sourcegraph's coding assistant" >}}
{{< /cards >}}

## Common Pattern

All these guides follow the same pattern:

1. **Configure the gateway** with a downstream MCP server (GitHub in these examples)
2. **Start the gateway** listening on HTTP
3. **Configure your AI agent** to connect to the gateway instead of the MCP server directly
4. **Verify the connection** works

The gateway configuration is identical across all agents. Only the agent-side configuration differs.

## Gateway Configuration

Every example uses a gateway with the GitHub server added under `downstream_mcp_servers` in the bootstrapped `maybe-dont.yaml`:

```yaml
downstream_mcp_servers:
  github:
    type: http
    url: "https://api.githubcopilot.com/mcp/"
    auth:
      pass_through:
        enabled: true
        headers:
          - source_header: "X-GitHub-Token"
            target_header: "Authorization"
            format: "Bearer {value}"
```

Edit the existing `downstream_mcp_servers:` key in `~/.config/maybe-dont/maybe-dont.yaml` (the default config directory) rather than adding a second one. Leave the rest of the file as bootstrapped: the server listens on `127.0.0.1:8080`, and CEL and AI request validation are on in `audit_only` mode.

AI request validation and the audit report tool need an API key. The default config reads it from `OPENAI_API_KEY`, and the gateway won't start while either is on and the key is empty. Export the key before starting, or turn off both `request_validation.ai.enabled` and `native_tools.audit_report.enabled` as described in [Get Started](/docs/get-started/#configure).

Start the gateway with Docker:

{{% docker-run %}}

The command sets `MAYBE_DONT_SERVER_LISTEN_ADDR=0.0.0.0:8080` because the default `127.0.0.1:8080` only accepts connections from inside the container. Published as `-p 8080:8080`, the gateway is still reachable on your machine at `http://localhost:8080/mcp`. If you run the binary instead, start it with `maybe-dont gateway start` and keep the default listen address.

Now follow the guide for your specific AI agent.
