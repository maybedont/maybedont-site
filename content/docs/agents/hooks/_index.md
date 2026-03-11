---
title: Hooks
weight: 2
---

Hook scripts integrate AI agents with the Maybe Don't gateway via the `POST /api/v1/intercept` endpoint. When an agent is about to use a tool (pre-tool) or has finished using one (post-tool), the hook script sends the tool call to the gateway for policy evaluation and translates the response into the agent's expected format.

## Reference Implementations

The hook scripts shipped with Maybe Don't are reference implementations written in bash. You can write your own in any language — the only requirement is calling the [intercept endpoint](/docs/api/intercept/) and translating the response for your agent.

## How Hooks Work

1. Agent fires a hook event before or after tool execution
2. Hook script extracts the tool name, arguments (and result for post-tool)
3. Script POSTs to `/api/v1/intercept` on the gateway
4. Gateway evaluates CEL and AI policies, returns a verdict
5. Script translates the verdict into the agent-specific format (allow/deny)

## Fail-Open Behavior

If the gateway is unreachable, hooks allow the tool call with a warning to stderr. The gateway is opt-in guardrails, not a hard gate — you're choosing to add safety, not creating a single point of failure.

## Response Phase Limitations

Post-tool hooks send tool results to the gateway for policy evaluation and audit logging, but most agents don't support blocking or modifying the response after the tool has already executed. In practice, this means a post-tool policy violation is **logged in the [audit log](/docs/audit-log/) but not enforced** — the agent still sees the original tool output.

| Agent | Event | Response deny | Response redact |
|-------|-------|:---:|:---:|
| Cursor | `afterMCPExecution` | No — logs warning | **Yes** — returns modified output |
| Cursor | `afterShellExecution` | No | No |
| Claude Code | `PostToolUse` | No | No |
| Gemini CLI | `AfterTool` | No | No |
| Cline | `postToolUse` | No | No |
| GitHub Copilot | `PostToolUse` | No | No |

Cursor's `afterMCPExecution` is the only hook that supports output modification — the script can return redacted content that replaces what the agent sees. All other post-tool events are observability-only.

{{< callout type="info" >}}
**Want response-phase enforcement?** Use the [MCP gateway](/docs/mcp-gateway/) instead of (or in addition to) hooks. The gateway intercepts responses at the proxy layer — before they reach the agent — so deny and redact decisions are enforced, not just logged.
{{< /callout >}}

## Prerequisites

- Gateway running in `http` or `sse` mode
- `MAYBE_DONT_URL` environment variable set (e.g., `http://localhost:8080`)
- `jq` and `curl` on PATH (for the reference bash scripts)

## CLI Commands

```bash
# List available hook scripts
maybe-dont hooks list

# Export hook script to the agent's config directory
mkdir -p .claude/hooks
maybe-dont hooks export --agent claude-code > .claude/hooks/maybe-dont-hook.sh
chmod +x .claude/hooks/maybe-dont-hook.sh

# Export agent config snippet
maybe-dont hooks export --agent claude-code --config
```

## Supported Agents

{{< cards >}}
  {{< card link="claude-code" title="Claude Code" subtitle="Anthropic's CLI coding assistant" >}}
  {{< card link="cursor" title="Cursor" subtitle="AI-powered code editor" >}}
  {{< card link="gemini-cli" title="Gemini CLI" subtitle="Google's CLI coding assistant" >}}
  {{< card link="cline" title="Cline" subtitle="Autonomous AI coding agent" >}}
  {{< card link="github-copilot" title="GitHub Copilot" subtitle="GitHub's AI coding assistant" >}}
{{< /cards >}}
