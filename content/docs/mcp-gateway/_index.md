---
title: MCP Gateway
linkTitle: MCP
weight: 5
---

The MCP gateway sits between AI agents and your MCP servers, evaluating every tool call against your policies before it reaches the downstream server. Agents connect to the gateway as if it were the MCP server itself — forwarding, validation, and audit logging happen transparently.

## How It Works

<div class="solutions-hero-graphic" style="margin: 1.5rem 0;">
<svg viewBox="0 0 760 160" xmlns="http://www.w3.org/2000/svg" class="solutions-flow-svg">
  <rect x="10" y="50" width="140" height="50" rx="6" class="flow-box flow-agent"/>
  <text x="80" y="80" text-anchor="middle" class="flow-label">AI Agent</text>
  <line x1="160" y1="75" x2="230" y2="75" class="flow-line"/>
  <polygon points="225,70 235,75 225,80" class="flow-dot" style="fill: currentColor; opacity: 0.3;"/>
  <rect x="240" y="30" width="200" height="90" rx="10" class="flow-box flow-shield"/>
  <text x="340" y="65" text-anchor="middle" class="flow-label flow-label-bold">MCP Gateway</text>
  <text x="340" y="88" text-anchor="middle" class="flow-label flow-label-sm">Policy Engine + Audit Log</text>
  <line x1="450" y1="60" x2="550" y2="40" class="flow-line flow-line-allow"/>
  <circle cx="502" cy="49" r="5" class="flow-dot flow-dot-allow"/>
  <line x1="450" y1="90" x2="550" y2="120" class="flow-line flow-line-deny"/>
  <circle cx="502" cy="106" r="5" class="flow-dot flow-dot-deny"/>
  <rect x="560" y="15" width="185" height="50" rx="6" class="flow-box flow-tool"/>
  <text x="652" y="45" text-anchor="middle" class="flow-label">MCP Server</text>
  <rect x="560" y="95" width="185" height="50" rx="6" class="flow-box flow-tool-deny"/>
  <text x="652" y="125" text-anchor="middle" class="flow-label flow-label-deny">Denied + Reason</text>
</svg>
</div>

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
  {{< card link="/docs/agents/mcp" title="Agents" icon="code" subtitle="Connect your AI coding assistant" >}}
{{< /cards >}}
