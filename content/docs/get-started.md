---
title: Get Started
weight: 1
aliases:
  - /download/
---

Let's get Maybe Don't running. Pick your installation method, then follow the same first-run steps regardless of how you installed.

The gateway is open source under the [Apache License 2.0](https://github.com/maybedont/maybe-dont/blob/main/LICENSE) — source on [GitHub](https://github.com/maybedont/maybe-dont).

Before you start, you'll want two things:

- An OpenAI API key for AI policy validation. You can run without one; see [Configure](#configure).
- A [GitHub personal access token](https://github.com/settings/tokens) if you want to proxy GitHub's MCP server. Your AI agent sends the token to the gateway with each request. You can skip it and try the gateway with a downstream server that needs no credentials; see [Configure](#configure).

## Install

{{< tabs items="Docker,Homebrew,Packages" >}}

{{< tab >}}
**Recommended for MCP server mode.** Docker keeps the gateway isolated and is the easiest way to get started if you're proxying MCP tool calls.

<div data-ga="install_action" data-ga-label="copy_docker_pull">
{{< codeblock lang="bash" >}}
docker pull ghcr.io/maybedont/maybe-dont:{version}
{{< /codeblock >}}
</div>
{{< /tab >}}

{{< tab >}}
**Recommended for CLI gateway and local development.** Homebrew installs `maybe-dont` as a native binary — ideal if you're validating CLI commands or want the fastest startup.

<div data-ga="install_action" data-ga-label="copy_homebrew">
{{< codeblock lang="bash" >}}
brew install maybedont/tap/maybe-dont
{{< /codeblock >}}
</div>
{{< /tab >}}

{{< tab >}}
**Recommended for CLI gateway mode.** A native binary — no Docker required. Also useful if you prefer managing your own installs.

{{< list-files-for-version >}}

Each archive has a matching `.sha256` file (the sha256 link next to each download). Save it in the same directory as the archive and check the download before extracting it:

```bash
# macOS
shasum -a 256 -c maybe-dont_<version>_darwin_arm64.tar.gz.sha256

# Linux
sha256sum -c maybe-dont_<version>_linux_x86_64.tar.gz.sha256
```

Use the file names you downloaded. The command prints the archive name followed by `OK` when the checksum matches.

After checking it, extract the archive. It unpacks into a versioned directory such as `maybe-dont_<version>_darwin_arm64/` containing the `maybe-dont` binary, `README.md` and `LICENSE`. Move the binary somewhere on your `PATH`.

{{< callout type="info" >}}
**macOS:** If you downloaded the archive with a browser, Gatekeeper may quarantine the binary and refuse to run it. Clear the quarantine flag with `xattr -d com.apple.quarantine ./maybe-dont`.
{{< /callout >}}
{{< /tab >}}

{{< /tabs >}}

## First Run

On first startup, Maybe Don't writes the default configuration and policy files to your config directory. You don't need to create anything from scratch. Just modify the defaults.

If no AI API key is set, this first start then exits with an error naming the settings to set or disable. That's expected. Set your API key or disable those settings in [Configure](#configure), then start again.

{{< tabs items="Docker,Package" >}}

{{< tab >}}
<div data-ga="install_action" data-ga-label="copy_docker_run">
{{< codeblock lang="bash" >}}
# Run once to bootstrap defaults
docker run --rm \
  -e XDG_CONFIG_HOME=/config \
  -e XDG_STATE_HOME=/state \
  -v ${XDG_CONFIG_HOME:-$HOME/.config}/maybe-dont:/config/maybe-dont \
  -v ${XDG_STATE_HOME:-$HOME/.local/state}/maybe-dont:/state/maybe-dont \
  ghcr.io/maybedont/maybe-dont:{version}
{{< /codeblock >}}
</div>

The defaults are now written to `~/.config/maybe-dont/`.
{{< /tab >}}

{{< tab >}}
```bash
# Run once to bootstrap defaults
maybe-dont gateway start
```

The defaults are now written to your config directory — `~/.config/maybe-dont` by default, or `$XDG_CONFIG_HOME/maybe-dont` if set. Run `maybe-dont gateway config info` to see the resolved paths.
{{< /tab >}}

{{< /tabs >}}

{{< callout type="info" >}}
**Read-only environments?** If your config directory isn't writable (e.g., mounted read-only in a container), use `maybe-dont gateway defaults export -o <dir>` to extract the defaults to a writable location.
{{< /callout >}}

## Configure

Open `maybe-dont.yaml`. The bootstrapped file already contains every top-level section, so change the lines that are there instead of pasting a second copy of a section. YAML doesn't allow the same key twice in a mapping, and the gateway won't load a file that repeats one.

**1. Add a downstream MCP server** (if you're proxying MCP tool calls). Add servers under the existing `downstream_mcp_servers:` key. To try the gateway without any credentials, start with AWS's public documentation server, which needs no account or token:

```yaml
downstream_mcp_servers:
  aws-docs:
    type: http
    url: "https://knowledge-mcp.global.api.aws"
```

To proxy GitHub's MCP server as well, add a second entry under the same key. Your agent sends its GitHub token in the `X-GitHub-Token` header and the gateway forwards it:

```yaml
downstream_mcp_servers:
  aws-docs:
    type: http
    url: "https://knowledge-mcp.global.api.aws"
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

**2. Check your AI provider** for policy validation. The default file already has this block, which reads your key from the `OPENAI_API_KEY` environment variable:

```yaml
validation:
  ai:
    provider: openai
    endpoint: "https://api.openai.com/v1/chat/completions"
    model: "gpt-5"
    api_key: "${OPENAI_API_KEY}"
```

With OpenAI there's nothing to change. For Anthropic or an OpenAI-compatible provider, edit `provider`, `endpoint`, `model` and `api_key` in that block. Point `api_key` at the variable that holds your key, for example `"${ANTHROPIC_API_KEY}"`. See the [configuration reference](/docs/configuration/reference/).

{{< callout type="info" >}}
Don't have an AI API key yet? You can run with just CEL policies. AI request validation and the audit report tool both need the key, so turn both off. Either set these environment variables before you start the gateway:

```bash
export MAYBE_DONT_REQUEST_VALIDATION_AI_ENABLED=false
export MAYBE_DONT_NATIVE_TOOLS_AUDIT_REPORT_ENABLED=false
```

Or edit the existing lines in `maybe-dont.yaml`: change `enabled: true` to `enabled: false` under `request_validation:` → `ai:`, and under `native_tools:` → `audit_report:`. Don't add new `request_validation:` or `native_tools:` sections.

With Docker, pass the variables to `docker run` as `-e MAYBE_DONT_REQUEST_VALIDATION_AI_ENABLED=false -e MAYBE_DONT_NATIVE_TOOLS_AUDIT_REPORT_ENABLED=false`. You'll still get audit logging and deterministic policy evaluation.
{{< /callout >}}

## Start

{{< tabs items="Docker,Package" >}}

{{< tab >}}
<div data-ga="install_action" data-ga-label="copy_docker_run">
{{< codeblock lang="bash" >}}
export OPENAI_API_KEY="your-api-key-here"

docker run --rm --name maybe-dont \
  -e OPENAI_API_KEY \
  -e MAYBE_DONT_SERVER_LISTEN_ADDR=0.0.0.0:8080 \
  -e XDG_CONFIG_HOME=/config \
  -e XDG_STATE_HOME=/state \
  -v ${XDG_CONFIG_HOME:-$HOME/.config}/maybe-dont:/config/maybe-dont \
  -v ${XDG_STATE_HOME:-$HOME/.local/state}/maybe-dont:/state/maybe-dont \
  -p 8080:8080 \
  ghcr.io/maybedont/maybe-dont:{version}
{{< /codeblock >}}
</div>
{{< /tab >}}

{{< tab >}}
```bash
export OPENAI_API_KEY="your-api-key-here"

maybe-dont gateway start
```
{{< /tab >}}

{{< /tabs >}}

The Docker command sets `MAYBE_DONT_SERVER_LISTEN_ADDR` because the default `listen_addr` of `127.0.0.1:8080` only accepts connections from inside the container.

The gateway's MCP endpoint is `http://127.0.0.1:8080/mcp`. Point your AI agent there; see [agent integrations](/docs/agents/mcp/) for per-agent setup.

Everything starts in `audit_only` mode by default — observe before enforcing. This means policies evaluate and log decisions, but nothing gets blocked until you're ready.

## Verify

List the tools the gateway exposes, then call one. The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) CLI does both and only needs Node.js:

```bash
npx -y @modelcontextprotocol/inspector --cli http://127.0.0.1:8080/mcp \
  --transport http --method tools/list
```

Downstream tools are prefixed with the server name, so the `aws-docs` server's tools show up as `aws-docs__<tool>`, next to the gateway's own `maybedont__` tools. Call one of them:

```bash
npx -y @modelcontextprotocol/inspector --cli http://127.0.0.1:8080/mcp \
  --transport http --method tools/call \
  --tool-name aws-docs__aws___search_documentation \
  --tool-arg search_phrase="S3 bucket naming rules" --tool-arg limit=1
```

AWS names the tools on its server. If this one isn't in your `tools/list` output, call another `aws-docs__` tool from the list.

Then check the audit log. It's written to `maybedont-audit.log` in the log directory, which is `~/.local/state/maybe-dont/` by default (or `$XDG_STATE_HOME/maybe-dont`). Run `maybe-dont gateway config info` to print the config and log directories.

```bash
tail -f ~/.local/state/maybe-dont/maybedont-audit.log
```

Each downstream tool call adds one JSON line with the tool name, its parameters and the policy results. Calls to the gateway's own `maybedont__` tools aren't logged.

## What's Next?

Three paths depending on what you're here for:

- **"I want to proxy MCP tool calls"** — Set up your [downstream servers](/docs/mcp-gateway/downstream-servers/) and connect your [AI agent](/docs/agents/mcp/)
- **"I want to validate CLI commands"** — Set up the [CLI gateway](/docs/cli-gateway/)
- **"I want to use hooks"** — See all [agent integrations](/docs/agents/) including hooks, MCP, and skills

Then explore:

- **[Policies](/docs/policies/)** — Define what's allowed and what isn't
- **[Audit Log](/docs/audit-log/)** — See what your agents are doing
- **[Configuration](/docs/configuration/)** — All configuration options
- **[Testing](/docs/testing/)** — Test your policies before deploying
