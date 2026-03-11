---
title: GitHub Copilot
weight: 5
---

This guide shows how to integrate [GitHub Copilot](https://github.com/features/copilot) with Maybe Don't using hooks.

## Prerequisites

- Maybe Don't gateway running in `http` or `sse` mode (see [Get Started](/docs/get-started/))
- [GitHub Copilot](https://github.com/features/copilot) active in VS Code
- `jq` and `curl` on PATH
- `MAYBE_DONT_URL` environment variable set (e.g., `http://localhost:8080`)

## Install the Hook

Export the hook script into your project's `.github/hooks/` directory:

```bash
mkdir -p .github/hooks
maybe-dont hooks export --agent copilot > .github/hooks/maybe-dont-hook.sh
chmod +x .github/hooks/maybe-dont-hook.sh
```

## Configure GitHub Copilot

Export the config snippet:

```bash
maybe-dont hooks export --agent copilot --config
```

This outputs a JSON configuration to save as `.github/hooks/maybe-dont.json`. Update the command path to where you placed the hook script:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": ".github/hooks/maybe-dont-hook.sh"
      }
    ],
    "PostToolUse": [
      {
        "type": "command",
        "command": ".github/hooks/maybe-dont-hook.sh"
      }
    ]
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
| `PreToolUse` | Pre-tool | Fires before Copilot executes a tool. The hook can block the tool call. |
| `PostToolUse` | Post-tool | Fires after tool execution. [Observability only](/docs/agents/hooks/#response-phase-limitations) — results are logged but cannot be blocked or modified. |

## Verify It Works

Open VS Code with Copilot and trigger a tool call. Check the gateway's [audit log](/docs/audit-log/) for entries — you should see an intercept record for the tool call.

The hook is silent on allow. On deny, you'll see stderr output like:

```
[maybe-dont] WARNING (PostToolUse): Policy violation detected — <reason>
```

## Filtering

GitHub Copilot hooks do not support a declarative matcher — `PreToolUse` and `PostToolUse` fire for all tool calls. To filter by tool name, add conditional logic in the hook script itself:

```bash
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')
if [ "$TOOL_NAME" != "bash" ]; then
  exit 0  # Allow non-CLI tools without validation
fi
```

See the [GitHub Copilot hooks documentation](https://docs.github.com/en/copilot/reference/hooks-configuration) for the full configuration reference.

## Agent-Specific Notes

- The CLI agent name is `copilot` (not `github-copilot`): `maybe-dont hooks export --agent copilot`.
- The same hooks work for Cody and VS Code Copilot — the hook format is shared across VS Code extensions.
- Hook configuration lives in `.github/hooks/*.json` in your project root.
- GitHub Copilot passes tool details as JSON on stdin to the hook script.
