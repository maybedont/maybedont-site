---
title: Cline
weight: 4
---

This guide shows how to integrate [Cline](https://github.com/cline/cline) with Maybe Don't using hooks.

## Prerequisites

- Maybe Don't gateway running in `http` or `sse` mode (see [Get Started](/docs/get-started/))
- [Cline installed](https://github.com/cline/cline) in VS Code
- `jq` and `curl` on PATH
- `MAYBE_DONT_URL` environment variable set (e.g., `http://localhost:8080`)
- macOS or Linux (the reference bash scripts require a Unix shell)

## Install the Hook

Export the hook script into your project's `.clinerules/hooks/` directory:

```bash
mkdir -p .clinerules/hooks
maybe-dont hooks export --agent cline > .clinerules/hooks/maybe-dont-hook.sh
chmod +x .clinerules/hooks/maybe-dont-hook.sh
```

## Configure Cline

Export the config snippet:

```bash
maybe-dont hooks export --agent cline --config
```

This outputs the configuration to place in `.clinerules/hooks/`. Update the command path to where you placed the hook script:

```json
{
  "hooks": {
    "preToolUse": {
      "command": ".clinerules/hooks/maybe-dont-hook.sh"
    },
    "postToolUse": {
      "command": ".clinerules/hooks/maybe-dont-hook.sh"
    }
  }
}
```

Set the gateway URL before launching VS Code:

```bash
export MAYBE_DONT_URL="http://localhost:8080"
```

## Supported Events

| Event | Phase | Description |
|-------|-------|-------------|
| `preToolUse` | Pre-tool | Fires before Cline executes a tool. The hook can block the tool call. |
| `postToolUse` | Post-tool | Fires after tool execution. The hook sends the result for post-execution policy evaluation. |

## Verify It Works

Open VS Code with Cline and trigger a tool call. Check the gateway's [audit log](/docs/audit-log/) for entries — you should see an intercept record for the tool call.

The hook is silent on allow. On deny, you'll see stderr output like:

```
[maybe-dont] WARNING (PostToolUse): Policy violation detected — <reason>
```

## Agent-Specific Notes

- The reference hook scripts are bash — they require macOS or Linux. On Windows, you can write your own hook in any language that calls the [intercept endpoint](/docs/api/intercept/).
- Hook configuration lives in `.clinerules/hooks/` in your project root.
- Cline passes tool details as JSON on stdin to the hook script.
