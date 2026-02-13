---
title: Get Started
weight: 1
---

Let's get Maybe Don't running. Pick your installation method, then follow the same first-run steps regardless of how you installed.

## Install

{{< tabs items="Docker,Homebrew,Packages" >}}

{{< tab >}}
**Recommended for MCP server mode.** Docker keeps the gateway isolated and is the easiest way to get started if you're proxying MCP tool calls.

{{< codeblock lang="bash" >}}
docker pull ghcr.io/maybedont/maybe-dont:{version}
{{< /codeblock >}}
{{< /tab >}}

{{< tab >}}
**Recommended for CLI gateway and local development.** Homebrew installs `maybe-dont` as a native binary — ideal if you're validating CLI commands or want the fastest startup.

```bash
brew install maybedont/tap/maybe-dont
```
{{< /tab >}}

{{< tab >}}
**Recommended for CLI gateway mode.** A native binary — no Docker required. Also useful if you prefer managing your own installs.

{{< list-files-for-version >}}

After downloading, extract the archive and place the `maybe-dont` binary somewhere on your `PATH`.
{{< /tab >}}

{{< /tabs >}}

## First Run

On first startup, Maybe Don't writes the default configuration and policy files to your config directory. You don't need to create anything from scratch — just modify the defaults.

{{< tabs items="Docker,Package" >}}

{{< tab >}}
{{< codeblock lang="bash" >}}
# Run once to bootstrap defaults
docker run --rm \
  -e XDG_CONFIG_HOME=/config \
  -e XDG_STATE_HOME=/state \
  -v ${XDG_CONFIG_HOME:-$HOME/.config}/maybe-dont:/config/maybe-dont \
  -v ${XDG_STATE_HOME:-$HOME/.local/state}/maybe-dont:/state/maybe-dont \
  ghcr.io/maybedont/maybe-dont:{version}
{{< /codeblock >}}

Stop the container after it starts up — the defaults are now written to `~/.config/maybe-dont/`.
{{< /tab >}}

{{< tab >}}
```bash
# Run once to bootstrap defaults
maybe-dont gateway start
```

Stop the process after it starts up. The defaults are now written to your config directory — `~/.config/maybe-dont` by default, or `$XDG_CONFIG_HOME/maybe-dont` if set. Run `maybe-dont gateway config info` to see the resolved paths.
{{< /tab >}}

{{< /tabs >}}

{{< callout type="info" >}}
**Read-only environments?** If your config directory isn't writable (e.g., mounted read-only in a container), use `maybe-dont defaults export -o <dir>` to extract the defaults to a writable location.
{{< /callout >}}

## Configure

Open `maybe-dont.yaml` and make two changes:

**1. Add a downstream MCP server** (if you're proxying MCP tool calls):

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

**2. Set your AI provider** for policy validation:

```yaml
validation:
  ai:
    provider: openai
    endpoint: "https://api.openai.com/v1/chat/completions"
    model: "gpt-4o-mini"
    api_key: "${OPENAI_API_KEY}"
```

{{< callout type="info" >}}
Don't have an AI API key yet? You can skip this step and run with just CEL policies. Set `ai.enabled: false` under `request_validation` in your config. You'll still get audit logging and deterministic policy evaluation.
{{< /callout >}}

## Start

{{< tabs items="Docker,Package" >}}

{{< tab >}}
{{< codeblock lang="bash" >}}
export OPENAI_API_KEY="your-api-key-here"

docker run \
  -e OPENAI_API_KEY \
  -e XDG_CONFIG_HOME=/config \
  -e XDG_STATE_HOME=/state \
  -v ${XDG_CONFIG_HOME:-$HOME/.config}/maybe-dont:/config/maybe-dont \
  -v ${XDG_STATE_HOME:-$HOME/.local/state}/maybe-dont:/state/maybe-dont \
  -p 8080:8080 \
  ghcr.io/maybedont/maybe-dont:{version}
{{< /codeblock >}}
{{< /tab >}}

{{< tab >}}
```bash
export OPENAI_API_KEY="your-api-key-here"

maybe-dont gateway start
```
{{< /tab >}}

{{< /tabs >}}

Everything starts in `audit_only` mode by default — observe before enforcing. This means policies evaluate and log decisions, but nothing gets blocked until you're ready.

## Verify

Check the audit log for entries. If you see log output, the gateway is intercepting and evaluating operations.

You can also test with curl:

```bash
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Token: your-github-token" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

## What's Next?

Two paths depending on what you're here for:

- **"I want to proxy MCP tool calls"** — Set up your [downstream servers](/docs/mcp-gateway/downstream-servers/) and connect your [AI agent](/docs/mcp-gateway/examples/)
- **"I want to validate CLI commands"** — Set up the [CLI gateway](/docs/cli-gateway/)

Then explore:

- **[Policies](/docs/policies/)** — Define what's allowed and what isn't
- **[Audit Log](/docs/audit-log/)** — See what your agents are doing
- **[Configuration](/docs/configuration/)** — All configuration options
- **[Testing](/docs/testing/)** — Test your policies before deploying
