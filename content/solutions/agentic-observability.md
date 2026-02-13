---
title: "Agentic AI Observability — See What Your AI Agents Are Doing"
linkTitle: "Agentic Observability"
weight: 2
description: "Observability for agentic AI. Maybe Don't gives you complete visibility into every MCP tool call and CLI command your AI agents execute — what happened, when, and why."
---

Your AI agents are taking actions right now — calling tools, running commands, accessing data. Can you see what they're doing? Can you trace what happened yesterday? Can you spot a pattern before it becomes a problem?

Agentic AI observability means having complete visibility into every operation your agents perform. Not just knowing that something happened, but understanding the full context: what was requested, which policy evaluated it, what decision was made, and what the outcome was.

## Why Observability Matters

### You can't govern what you can't see
AI agents operate autonomously. They make decisions, call tools, and execute commands without waiting for human approval. Without observability, you're trusting agents to behave correctly with no way to verify.

### Incidents need forensics
When something goes wrong — and with autonomous agents, it will — you need to trace the exact sequence of events. Which agent, which tool call, which arguments, which policy allowed it, and when. Observability turns "something broke" into a clear chain of cause and effect.

### Patterns reveal risk
Audit data isn't just for incident response. Over time, it reveals patterns: which tools agents use most, what gets blocked, where agents repeatedly hit policy boundaries. These patterns inform better policies and better agent configurations.

### Audit-only mode is where you start
Most teams don't know what their agents are doing until they look. Maybe Don't's audit-only mode logs every operation without blocking anything, giving you full visibility before you write a single policy. Observe first, then enforce.

## What You See

Maybe Don't captures a structured record for every operation:

- **Timestamp** — when the operation occurred
- **Agent identity** — which agent initiated the action
- **Operation type** — MCP tool call or CLI command
- **Request details** — tool name, arguments, server, or full command string
- **Policy evaluation** — which policies were applied, their reasoning, and their decisions
- **Result** — allowed, denied, or flagged for review
- **Response** — what the downstream system returned (for allowed operations)

Every field is queryable. Every record is immutable once written. See the [log schema reference](/docs/audit-log/log-schema/) for the complete specification.

## How It Works

Maybe Don't sits between your AI agents and the tools they use. Every MCP tool call and CLI command passes through the Maybe Don't gateway, where it's evaluated, logged, and (optionally) enforced.

This means observability is automatic. You don't need to instrument your agents, modify your MCP servers, or change your CLI tools. The gateway captures everything.

### MCP tool calls
Every tool call — the tool name, arguments, target server, and the server's response — is logged with the full policy evaluation context.

### CLI commands
Every CLI command an agent validates through Maybe Don't's [CLI gateway](/docs/cli-gateway/) is logged with the same detail.

### Policy decisions
For each operation, the audit log captures which policies were evaluated, what they decided, and why. This creates a complete decision trail — not just what happened, but the reasoning behind every allow or deny.

## SIEM Integration

Observability data is most valuable when it's part of your existing infrastructure. Maybe Don't supports forwarding audit data to your SIEM for correlation with other security and operational events.

Integrate with Splunk, Elastic, Datadog, or any platform that accepts structured log data. See our [SIEM integration guide](/docs/audit-log/siem-integration/) for details.

## FAQ

**What's the difference between audit-only mode and enforcement mode?**
In audit-only mode, Maybe Don't logs every operation but doesn't block anything. In enforcement mode, policies are actively applied and violations are denied. Both modes produce the same audit records with the same level of detail.

**Does observability add latency?**
Audit logging is asynchronous and does not add latency to the policy evaluation or tool call path.

**Can I query the audit data programmatically?**
Yes. Audit records are structured JSON that can be queried, filtered, and analyzed with standard tooling. See the [log schema reference](/docs/audit-log/log-schema/).

**Which AI agents are supported?**
Maybe Don't works with any agent that connects via MCP — [Claude Code](/docs/mcp-gateway/examples/connecting-claude-code/), [Cursor](/docs/mcp-gateway/examples/connecting-cursor/), [GitHub Copilot](/docs/mcp-gateway/examples/connecting-github-copilot/), and [more](/docs/mcp-gateway/examples/). If it speaks MCP, you get full observability.

---

See what your AI agents are doing. [Get started](/docs/get-started/) or [book a demo](https://cal.com/kmillermd/30min).
