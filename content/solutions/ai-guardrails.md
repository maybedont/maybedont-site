---
title: "AI Guardrails — Runtime Policy Enforcement for AI Agents"
linkTitle: "AI Guardrails"
weight: 1
description: "AI guardrails that enforce your policies at runtime. Maybe Don't sits between AI agents and your systems, blocking dangerous operations before they execute."
---

AI agents are powerful — and unpredictable. They interpret instructions literally, improvise solutions you never intended, and execute actions faster than any human review process. AI guardrails are the missing layer between agent autonomy and organizational control.

## What Are AI Guardrails?

AI guardrails are runtime controls that evaluate every action an AI agent takes against your policies before it executes. Unlike model-level safety features that filter content during inference, guardrails operate at the **action layer** — where agents interact with your systems, databases, and infrastructure.

The distinction matters. A model can be trained not to generate harmful text, but that doesn't prevent it from running `DROP TABLE users` when asked to "clean up old data." AI guardrails catch the action, not the thought.

## How Maybe Don't Works

Maybe Don't sits at the chokepoint between your AI agents and the tools they use — MCP servers and CLI commands. Every operation passes through the Maybe Don't gateway before reaching its destination.

1. **An AI agent requests an action** — a tool call, a CLI command, a database query
2. **Maybe Don't evaluates the request** against your policies using AI judgment and deterministic rules
3. **Allowed actions pass through** to the downstream tool or system
4. **Blocked actions are denied** with a clear explanation that helps the agent self-correct

This happens in milliseconds. Your agents stay fast. Your systems stay safe.

### Two policy engines working together

**AI Policies** — Write rules in natural language. "Don't allow any operation that modifies production data." The policy engine evaluates each action against your intent, understanding context and nuance.

**CEL Policies** — Deterministic rules using the Common Expression Language for exact pattern matching. Block specific tool names, argument patterns, or command signatures with zero ambiguity.

Both run on every operation. AI policies handle judgment calls. CEL policies handle hard rules.

## Use Cases

### Prevent destructive operations
Block database deletions, production deployments on Fridays, or any action that matches your definition of "dangerous." AI policies understand semantic intent — they catch `DROP TABLE`, `TRUNCATE`, and creative reformulations alike.

### Enforce coding standards
Require PRs under 500 lines, prevent direct commits to main, or enforce any team convention you want AI agents to respect.

### Protect sensitive data
Prevent agents from accessing customer PII, financial records, or classified documents without explicit authorization.

### Control blast radius
Limit what agents can do in production versus staging. Same policies, different environments, different permissions.

### Observe before enforcing
Run in audit-only mode to see what your agents are doing before turning on enforcement. Understand the patterns, then write the policies.

## Why Runtime Guardrails Matter

Static rules and pre-deployment testing can't anticipate every scenario an AI agent will encounter. Agents improvise. They find creative interpretations of ambiguous instructions. They don't understand organizational context unless you encode it into enforceable policies.

Runtime guardrails close this gap by evaluating every action in context, at the moment it matters. Every decision is logged, creating a complete audit trail for compliance and incident response.

## FAQ

**How are AI guardrails different from model safety features?**
Model safety features (like those in Claude or ChatGPT) filter content during inference — they prevent the model from generating harmful outputs. AI guardrails operate at the action layer, preventing agents from executing dangerous operations regardless of what the model generates. They're complementary: model safety prevents harmful content, guardrails prevent harmful actions.

**Do guardrails slow down my agents?**
Policy evaluation typically adds single-digit milliseconds to each operation. For most use cases, the latency is imperceptible.

**Can I use AI guardrails with any AI agent?**
Maybe Don't works with any agent that connects via MCP or executes CLI commands. This includes [Claude Code](/docs/agents/mcp/claude-code/), [Cursor](/docs/agents/mcp/cursor/), [GitHub Copilot](/docs/agents/mcp/github-copilot/), and [others](/docs/agents/). See our [agent integration guides](/docs/agents/) for specific instructions.

**Can I start without blocking anything?**
Yes. Audit-only mode logs every operation without enforcing policies. This is the recommended way to start — observe, learn, then enforce. See the [get started guide](/docs/get-started/) for details.

---

Ready to add guardrails to your AI agents? [Get started](/docs/get-started/) or [book a demo](https://cal.com/kmillermd/30min).
