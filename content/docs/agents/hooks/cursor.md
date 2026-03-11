---
title: Cursor
weight: 2
---

This guide shows how to integrate [Cursor](https://cursor.sh) with Maybe Don't using hooks.

## Prerequisites

- Maybe Don't gateway running in `http` or `sse` mode (see [Get Started](/docs/get-started/))
- [Cursor installed](https://cursor.sh)
- `jq` and `curl` on PATH
- `MAYBE_DONT_URL` environment variable set (e.g., `http://localhost:8080`)

## Install the Hook

Export the hook script into your project's `.cursor/hooks/` directory:

```bash
mkdir -p .cursor/hooks
maybe-dont hooks export --agent cursor > .cursor/hooks/maybe-dont-hook.sh
chmod +x .cursor/hooks/maybe-dont-hook.sh
```

## Configure Cursor

Export the config snippet:

```bash
maybe-dont hooks export --agent cursor --config
```

This outputs the configuration to save as `.cursor/hooks/hooks.json`. Update the command path to where you placed the hook script. The default configuration validates shell commands via hooks while the [MCP gateway](/docs/mcp-gateway/) handles MCP tools:

```json
{
  "hooks": {
    "beforeShellExecution": [
      {
        "command": ".cursor/hooks/maybe-dont-hook.sh"
      }
    ],
    "afterShellExecution": [
      {
        "command": ".cursor/hooks/maybe-dont-hook.sh"
      }
    ]
  }
}
```

{{< callout type="info" >}}
**Using hooks without the MCP gateway?** Add `beforeMCPExecution` and `afterMCPExecution` entries with the same command to also validate MCP tool calls via hooks. The `afterMCPExecution` hook uniquely supports output redaction via the gateway's mutation response. See the comments in the exported config for details.
{{< /callout >}}

Set the gateway URL before launching Cursor:

```bash
export MAYBE_DONT_URL="http://localhost:8080"
```

## Supported Events

| Event | Phase | Description |
|-------|-------|-------------|
| `beforeShellExecution` | Pre-tool | Fires before a shell command runs. The hook can block execution. |
| `afterShellExecution` | Post-tool | Fires after a shell command completes. [Observability only](/docs/agents/hooks/#response-phase-limitations) — cannot modify output. |
| `beforeMCPExecution` | Pre-tool | Fires before an MCP tool call. The hook can block the call. |
| `afterMCPExecution` | Post-tool | Fires after an MCP tool call completes. Supports output mutation/redaction. |

## Verify It Works

Open Cursor and run a shell command. Check the gateway's [audit log](/docs/audit-log/) for entries — you should see an intercept record for the command.

The hook is silent on allow. On deny, you'll see stderr output like:

```
[maybe-dont] DENIED: <reason>
```

## Agent-Specific Notes

- Cursor supports four hook events (shell + MCP, pre + post) — the most granular hook support of any agent. The default config enables shell events only; add MCP events if not using the MCP gateway.
- The `afterMCPExecution` event supports output mutation, meaning the hook can redact sensitive data from tool responses before Cursor sees them.
- Cursor passes hook context as JSON on stdin.
