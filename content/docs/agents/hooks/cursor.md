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

Export the hook script and make it executable:

```bash
maybe-dont hooks export --agent cursor > maybe-dont-hook.sh
chmod +x maybe-dont-hook.sh
```

## Configure Cursor

Export the config snippet:

```bash
maybe-dont hooks export --agent cursor --config
```

This outputs the configuration to add to `.cursor/hooks/`. Cursor supports four hook events — the most granular hook support of any agent:

```json
{
  "hooks": {
    "beforeShellExecution": "./maybe-dont-hook.sh",
    "afterShellExecution": "./maybe-dont-hook.sh",
    "beforeMCPExecution": "./maybe-dont-hook.sh",
    "afterMCPExecution": "./maybe-dont-hook.sh"
  }
}
```

Set the gateway URL before launching Cursor:

```bash
export MAYBE_DONT_URL="http://localhost:8080"
```

## Supported Events

| Event | Phase | Description |
|-------|-------|-------------|
| `beforeShellExecution` | Pre-tool | Fires before a shell command runs. The hook can block execution. |
| `afterShellExecution` | Post-tool | Fires after a shell command completes. |
| `beforeMCPExecution` | Pre-tool | Fires before an MCP tool call. The hook can block the call. |
| `afterMCPExecution` | Post-tool | Fires after an MCP tool call completes. Supports output mutation/redaction. |

## Verify It Works

Open Cursor and trigger a tool call or shell command. Check the gateway's [audit log](/docs/audit-log/) for entries from the hook.

The hook writes status messages to stderr. You should see lines indicating allow/deny decisions for each event.

## Agent-Specific Notes

- Cursor has the most granular hook support — separate events for shell and MCP, both pre and post.
- The `afterMCPExecution` event supports output mutation, meaning the hook can redact sensitive data from tool responses before Cursor sees them.
- Cursor passes hook context as JSON on stdin.
