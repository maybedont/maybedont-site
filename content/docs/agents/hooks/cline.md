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
- macOS or Linux (Cline hooks are not supported on Windows)

## Install the Hook

Export the hook script and make it executable:

```bash
maybe-dont hooks export --agent cline > maybe-dont-hook.sh
chmod +x maybe-dont-hook.sh
```

## Configure Cline

Export the config snippet:

```bash
maybe-dont hooks export --agent cline --config
```

This outputs the configuration to add to `.clinerules/hooks/`:

```json
{
  "hooks": {
    "preToolUse": "./maybe-dont-hook.sh",
    "postToolUse": "./maybe-dont-hook.sh"
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

Open VS Code with Cline and trigger a tool call. Check the gateway's [audit log](/docs/audit-log/) for entries from the hook.

The hook writes status messages to stderr. You should see lines indicating allow/deny decisions.

## Agent-Specific Notes

- Cline hooks are macOS and Linux only — they are not supported on Windows.
- Hook configuration lives in `.clinerules/hooks/` in your project root.
- Cline passes tool details as JSON on stdin to the hook script.
