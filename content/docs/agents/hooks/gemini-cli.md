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

Export the hook script into your project's `.gemini/hooks/` directory:

```bash
mkdir -p .gemini/hooks
maybe-dont hooks export --agent gemini-cli > $GEMINI_PROJECT_DIR/.gemini/hooks/maybe-dont-hook.sh
chmod +x $GEMINI_PROJECT_DIR/.gemini/hooks/maybe-dont-hook.sh
```

## Configure Gemini CLI

Export the config snippet:

```bash
maybe-dont hooks export --agent gemini-cli --config
```

This outputs a JSON snippet to merge into your Gemini CLI `settings.json`. Update the command path to where you placed the hook script:

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "type": "command",
        "command": "$GEMINI_PROJECT_DIR/.gemini/hooks/maybe-dont-hook.sh"
      }
    ],
    "AfterTool": [
      {
        "type": "command",
        "command": "$GEMINI_PROJECT_DIR/.gemini/hooks/maybe-dont-hook.sh"
      }
    ]
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

Start Gemini CLI and trigger a tool call. Check the gateway's [audit log](/docs/audit-log/) for entries — you should see an intercept record for the tool call.

```bash
gemini
```

The hook is silent on allow. On deny, you'll see stderr output like:

```
[maybe-dont] WARNING (AfterTool): Policy violation detected for '<tool_name>' — <reason>
```

## Agent-Specific Notes

- Gemini CLI hooks apply to the CLI tool only — not the Gemini Code Assist IDE extension.
- `$GEMINI_PROJECT_DIR` resolves to the project root at runtime, ensuring the hook works regardless of the agent's working directory.
- Gemini CLI passes tool details as JSON on stdin to the hook script.
