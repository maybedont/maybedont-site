---
title: Get Started
weight: 1
---

Let's get Maybe Don't running. This guide takes you from zero to a working gateway in just a few steps.

## Prerequisites

- **Docker** (or Podman) installed and running
- **An AI API key** for validation (OpenAI recommended, but Anthropic works too)
- **At least one MCP server** you want to connect to (we'll use GitHub in this example)

{{< callout type="info" >}}
If you just want to try Maybe Don't without AI validation, you can skip the API key and run in audit-only mode. More on that below.
{{< /callout >}}

## Pull the Image

```bash
docker pull ghcr.io/maybedont/maybe-dont:v0.7.2
```

## Create Your Config Directory

Maybe Don't needs a configuration directory. Let's set one up:

```bash
mkdir -p ./config
```

## Export the Default Configuration

Maybe Don't ships with a default configuration and policy files. Export them into your config directory:

```bash
docker run --rm \
  -v $(pwd)/config:/config \
  ghcr.io/maybedont/maybe-dont:v0.7.2 defaults export /config
```

This creates `maybe-dont.yaml` along with the default CEL and AI policy rule files.

## Configure Your Downstream Server

Open `./config/maybe-dont.yaml` and update the `downstream_mcp_servers` section with the MCP server you want to proxy. For example, to connect to GitHub's MCP server:

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

You'll also want to set your AI validation provider under `validation.ai`. The default config uses OpenAI — just make sure `api_key` references your environment variable:

```yaml
validation:
  ai:
    endpoint: "https://api.openai.com/v1/chat/completions"
    model: "gpt-4o-mini"
    api_key: "${OPENAI_API_KEY}"
```

## Start the Gateway

Set your API key and run:

```bash
export OPENAI_API_KEY="your-api-key-here"

docker run \
  -e OPENAI_API_KEY \
  -v $(pwd)/config:/config \
  -p 8080:8080 \
  ghcr.io/maybedont/maybe-dont:v0.7.2 start --config-dir /config
```

You should see output indicating the gateway has started and is listening on port 8080.

## Verify It's Working

The gateway is now ready to accept MCP connections at `http://localhost:8080/mcp`.

To test it, you can connect your AI agent (see [Examples](/docs/examples/)) or use curl:

```bash
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Token: your-github-token" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

## Running Without AI Validation

Don't have an OpenAI API key yet? No problem. You can run Maybe Don't with just CEL-based policies:

```yaml
# In your maybe-dont.yaml, disable AI validation:
request_validation:
  cel:
    enabled: true
    mode: audit_only
    rules_file: "cel_request_rules.yaml"
  ai:
    enabled: false  # Disable AI validation

# Also disable native tools that require AI
native_tools:
  audit_report:
    enabled: false
```

This still gives you audit logging and deterministic policy evaluation.

## What's Next?

Now that you're up and running:

- **[Configuration](/docs/configuration/)** - Learn about all configuration options
- **[Policies](/docs/policies/)** - Understand how validation policies work
- **[Audit Log](/docs/audit-log/)** - Explore what's being logged
- **[Examples](/docs/examples/)** - Connect your specific AI agent (Claude Code, Cursor, etc.)
