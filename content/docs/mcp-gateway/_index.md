---
title: MCP Gateway
linkTitle: MCP
weight: 5
---

The MCP gateway sits between AI agents and your MCP servers, evaluating every tool call against your policies before it reaches the downstream server. Agents connect to the gateway as if it were the MCP server itself — forwarding, validation, and audit logging happen transparently.

## How It Works

```
AI Agent → MCP Gateway → Policy Evaluation → Downstream MCP Server
```

1. An AI agent connects to the gateway using standard MCP transport (HTTP, SSE, or stdio)
2. The agent discovers tools — the gateway aggregates tools from all configured downstream servers
3. When the agent calls a tool, the gateway evaluates it against CEL and AI policies
4. **Allow** — the call is forwarded to the downstream server and the response flows back
5. **Deny** — the call is blocked and the agent sees the denial reason

All operations are logged to the [audit log](/docs/audit-log/).

## Setup

{{< cards >}}
  {{< card link="downstream-servers" title="Downstream Servers" icon="server" subtitle="Configure MCP servers to proxy" >}}
  {{< card link="server-modes" title="Server" icon="chip" subtitle="Transport modes, listen address, trusted proxies" >}}
  {{< card link="examples" title="Agents" icon="code" subtitle="Connect your AI coding assistant" >}}
{{< /cards >}}
