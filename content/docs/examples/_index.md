---
title: Examples
weight: 60
---

These guides show how to connect popular AI coding assistants to Maybe Don't. Each example uses GitHub's MCP server as the downstream service, giving you a template to adapt for your own MCP servers.

## Prerequisites

Before following any of these guides, you'll need:

1. **Maybe Don't running** - Follow [Get Started](/docs/get-started/) first
2. **A GitHub Personal Access Token** - For the GitHub MCP server examples
3. **Your AI coding assistant installed** - Links provided in each guide

## Choose Your Agent

{{< cards >}}
  {{< card link="connecting-claude-code" title="Claude Code" subtitle="Anthropic's CLI coding assistant" >}}
  {{< card link="connecting-cursor" title="Cursor" subtitle="AI-powered code editor" >}}
  {{< card link="connecting-openai-codex" title="OpenAI Codex" subtitle="OpenAI's coding CLI" >}}
  {{< card link="connecting-gemini" title="Gemini Code Assist" subtitle="Google's AI coding assistant" >}}
  {{< card link="connecting-openhands" title="OpenHands" subtitle="Open-source AI developer" >}}
  {{< card link="connecting-windsurf" title="Windsurf" subtitle="Codeium's AI-powered IDE" >}}
  {{< card link="connecting-cody" title="Cody" subtitle="Sourcegraph's coding assistant" >}}
  {{< card link="connecting-aider" title="Aider" subtitle="AI pair programming in terminal" >}}
{{< /cards >}}

## Common Pattern

All these guides follow the same pattern:

1. **Configure Maybe Don't** with GitHub MCP as a downstream server
2. **Start Maybe Don't** listening on HTTP
3. **Configure your AI agent** to connect to Maybe Don't instead of GitHub directly
4. **Verify the connection** works

The Maybe Don't configuration is identical across all agents. Only the agent-side configuration differs.

## Maybe Don't Configuration

Every example uses this Maybe Don't configuration:

```yaml
server:
  type: http
  listen_addr: "0.0.0.0:8080"

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

validation:
  ai:
    endpoint: "https://api.openai.com/v1/chat/completions"
    model: "gpt-4o-mini"
    api_key: "${OPENAI_API_KEY}"

request_validation:
  cel:
    enabled: true
    mode: audit_only
    rules_file: "cel_request_rules.yaml"
  ai:
    enabled: true
    mode: audit_only
    rules_file: "ai_request_rules.yaml"
```

Save this as `config/maybe-dont.yaml` and start with:

```bash
docker run \
  -e OPENAI_API_KEY \
  -v $(pwd)/config:/config \
  -p 8080:8080 \
  ghcr.io/maybedont/maybe-dont:v0.7.2 start --config-dir /config
```

Now follow the guide for your specific AI agent.
