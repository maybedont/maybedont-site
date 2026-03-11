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

Export the hook script into your project's `.claude/hooks/` directory:

```bash
mkdir -p .claude/hooks
maybe-dont hooks export --agent claude-code > $CLAUDE_PROJECT_DIR/.claude/hooks/maybe-dont-hook.sh
chmod +x $CLAUDE_PROJECT_DIR/.claude/hooks/maybe-dont-hook.sh
```

## Configure Claude Code

Export the config snippet and add it to your Claude Code settings:

```bash
maybe-dont hooks export --agent claude-code --config
```

This outputs a JSON snippet to merge into `.claude/settings.json`. Update the command path to where you placed the hook script. The default configuration uses `"matcher": "Bash"` to validate CLI tool calls via hooks while the [MCP gateway](/docs/mcp-gateway/) handles MCP tools:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/maybe-dont-hook.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/maybe-dont-hook.sh"
          }
        ]
      }
    ]
  }
}
```

{{< callout type="info" >}}
**Using hooks without the MCP gateway?** Change the matcher to `"*"` to validate all tool calls (both CLI and MCP) via hooks, or add a second entry with `"matcher": "mcp__.*"` for MCP tools specifically. See the comments in the exported config for details.
{{< /callout >}}

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

Start Claude Code and trigger a tool call. Check the gateway's [audit log](/docs/audit-log/) for entries — you should see an intercept record for the tool call.

```bash
claude
```

The hook is silent on allow. On deny, you'll see stderr output like:

```
[maybe-dont] WARNING (PostToolUse): Policy violation detected — <reason>
```

## Agent-Specific Notes

- Claude Code hooks use a `matcher` field to filter which tools trigger the hook. The default `"Bash"` matches CLI tools only. Use `"*"` to match all tools.
- `$CLAUDE_PROJECT_DIR` resolves to the project root at runtime, ensuring the hook works regardless of the agent's working directory.
- Claude Code passes tool details as JSON on stdin to the hook script.
