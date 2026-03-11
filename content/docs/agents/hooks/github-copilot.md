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

Export the hook script and make it executable:

```bash
maybe-dont hooks export --agent github-copilot > maybe-dont-hook.sh
chmod +x maybe-dont-hook.sh
```

## Configure GitHub Copilot

Export the config snippet:

```bash
maybe-dont hooks export --agent github-copilot --config
```

This outputs a JSON snippet to place in `.github/hooks/`:

```json
{
  "hooks": {
    "PreToolUse": "./maybe-dont-hook.sh",
    "PostToolUse": "./maybe-dont-hook.sh"
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
| `PostToolUse` | Post-tool | Fires after tool execution. The hook sends the result for post-execution policy evaluation. |

## Verify It Works

Open VS Code with Copilot and trigger a tool call. Check the gateway's [audit log](/docs/audit-log/) for entries from the hook.

The hook writes status messages to stderr. You should see lines indicating allow/deny decisions.

## Agent-Specific Notes

- The same hooks work for Cody and VS Code Copilot — the hook format is shared across VS Code extensions.
- Hook configuration lives in `.github/hooks/*.json` in your project root.
- GitHub Copilot passes tool details as JSON on stdin to the hook script.
