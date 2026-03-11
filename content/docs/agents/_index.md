---
title: Agents
weight: 9
---

Maybe Don't supports multiple integration points for AI coding agents. This section covers how to connect your agent to the gateway for policy enforcement, auditing, and observability.

## Choosing an Integration

| Approach | MCP Tools | CLI Tools | Notes |
|----------|-----------|-----------|-------|
| MCP Gateway + Hooks (recommended) | MCP gateway proxy | Hooks via intercept endpoint | Best coverage. MCP gateway intercepts responses before they reach the agent. Hooks enforce CLI commands deterministically. |
| Hooks only | Hooks via intercept endpoint | Hooks via intercept endpoint | Simpler setup — no proxy required. Works when agent supports hooks for both MCP and CLI tool calls. Agent must honor deny decisions. |
| MCP Gateway only | MCP gateway proxy | CLI skill or `maybe-dont cli` | For agents without hook support. CLI enforcement relies on LLM compliance. |

{{< callout type="info" >}}
**Why combine MCP Gateway + Hooks?** The MCP gateway intercepts tool call responses at the proxy layer — before they reach the agent. This provides stronger enforcement than hooks alone, where the agent receives the response and must honor the deny decision. For CLI commands, hooks call the gateway's [intercept endpoint](/docs/api/intercept/) directly and enforce decisions deterministically. Together, they give you full coverage across both MCP and CLI surfaces.
{{< /callout >}}

## Integration Guides

{{< cards >}}
  {{< card link="mcp" title="MCP" icon="server" subtitle="Connect agents via the MCP gateway proxy" >}}
  {{< card link="hooks" title="Hooks" icon="code" subtitle="Integrate via hook scripts and the intercept endpoint" >}}
  {{< card link="skills" title="Skills" icon="document-text" subtitle="Teach agents to author policies and test cases" >}}
{{< /cards >}}
