---
title: Gemini CLI
weight: 3
---

This guide shows how to integrate [Gemini CLI](https://github.com/google-gemini/gemini-cli) with Maybe Don't using hooks.

## Prerequisites

- Maybe Don't gateway running in `http` or `sse` mode (see [Get Started](/docs/get-started/))
- [Gemini CLI installed](https://github.com/google-gemini/gemini-cli)
- `jq` and `curl` on PATH
- `MAYBE_DONT_URL` environment variable set (e.g., `http://localhost:8080`)

## Install the Hook

Export the hook script and make it executable:

```bash
maybe-dont hooks export --agent gemini-cli > maybe-dont-hook.sh
chmod +x maybe-dont-hook.sh
```

## Configure Gemini CLI

Export the config snippet:

```bash
maybe-dont hooks export --agent gemini-cli --config
```

This outputs a JSON snippet to merge into your Gemini CLI `settings.json`:

```json
{
  "hooks": {
    "BeforeTool": "./maybe-dont-hook.sh",
    "AfterTool": "./maybe-dont-hook.sh"
  }
}
```

Set the gateway URL before starting Gemini CLI:

```bash
export MAYBE_DONT_URL="http://localhost:8080"
```

## Supported Events

| Event | Phase | Description |
|-------|-------|-------------|
| `BeforeTool` | Pre-tool | Fires before Gemini CLI executes a tool. The hook can block the tool call. |
| `AfterTool` | Post-tool | Fires after tool execution. The hook sends the result for post-execution policy evaluation. |

## Verify It Works

Start Gemini CLI and trigger a tool call. Check the gateway's [audit log](/docs/audit-log/) for entries from the hook:

```bash
gemini
```

The hook writes status messages to stderr. You should see lines indicating allow/deny decisions.

## Agent-Specific Notes

- Gemini CLI hooks apply to the CLI tool only — not the Gemini Code Assist IDE extension.
- Gemini CLI passes tool details as JSON on stdin to the hook script.
