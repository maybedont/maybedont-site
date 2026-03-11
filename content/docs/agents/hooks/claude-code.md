---
title: Claude Code
weight: 1
---

This guide shows how to integrate [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with Maybe Don't using hooks.

## Prerequisites

- Maybe Don't gateway running in `http` or `sse` mode (see [Get Started](/docs/get-started/))
- [Claude Code installed](https://docs.anthropic.com/en/docs/claude-code)
- `jq` and `curl` on PATH
- `MAYBE_DONT_URL` environment variable set (e.g., `http://localhost:8080`)

## Install the Hook

Export the hook script and make it executable:

```bash
maybe-dont hooks export --agent claude-code > maybe-dont-hook.sh
chmod +x maybe-dont-hook.sh
```

## Configure Claude Code

Export the config snippet and add it to your Claude Code settings:

```bash
maybe-dont hooks export --agent claude-code --config
```

This outputs a JSON snippet to merge into `.claude/settings.json`. The configuration registers the hook script for the `PreToolUse` and `PostToolUse` events:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": ["./maybe-dont-hook.sh"]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": ["./maybe-dont-hook.sh"]
      }
    ]
  }
}
```

Set the gateway URL before starting Claude Code:

```bash
export MAYBE_DONT_URL="http://localhost:8080"
```

## Supported Events

| Event | Phase | Description |
|-------|-------|-------------|
| `PreToolUse` | Pre-tool | Fires before Claude Code executes a tool. The hook can block the tool call. |
| `PostToolUse` | Post-tool | Fires after tool execution. The hook sends the result for post-execution policy evaluation. |

## Verify It Works

Start Claude Code and trigger a tool call. Check the gateway's [audit log](/docs/audit-log/) for entries from the hook:

```bash
claude
```

The hook writes status messages to stderr. You should see lines like:

```
[maybe-dont] PreToolUse: allowed (tool: Bash)
```

## Agent-Specific Notes

- Claude Code hooks use a `matcher` field to filter which tools trigger the hook. Use `"*"` to match all tools.
- The hook script path in the config is relative to the project root.
- Claude Code passes tool details as JSON on stdin to the hook script.
