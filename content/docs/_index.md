---
title: Documentation
linkTitle: Home
toc: true
---

## What is Maybe Don't?

Maybe Don't provides guardrails and observability for agentic AI. It sits between AI agents and the tools they use — MCP servers and CLI commands — evaluating every operation against your policies before it executes. You define the rules, Maybe Don't enforces them.

Think of it as a security checkpoint for your AI's actions. Every tool call and CLI command is audited, validated, and logged.

{{< inline-svg path="images/architecture-diagram.svg" style="max-width: 100%; height: auto; margin: 2rem 0;" >}}

## Why Use It?

- **Audit everything** — See exactly what your AI agents are doing, across MCP tool calls and CLI commands
- **Set guardrails** — Block dangerous operations before they happen, using AI or deterministic policies
- **Stay in control** — Enforce policies, review decisions, and trace any action back to its source
- **Observe and learn** — Run in audit-only mode to understand agent behavior before enforcing rules

## Get Started

{{< cards >}}
  {{< card link="get-started" title="Get Started" icon="play" subtitle="Up and running in minutes" >}}
  {{< card link="mcp-gateway" title="MCP Gateway" icon="server" subtitle="Validate MCP tool calls" >}}
  {{< card link="cli-gateway" title="CLI Gateway" icon="terminal" subtitle="Validate CLI commands" >}}
  {{< card link="configuration" title="Configuration" icon="cog" subtitle="Global settings, logging, and reference" >}}
  {{< card link="policies" title="Policies" icon="shield-check" subtitle="Define what's allowed and what isn't" >}}
  {{< card link="audit-log" title="Audit Log" icon="document-text" subtitle="The record of everything" >}}
  {{< card link="testing" title="Testing" icon="beaker" subtitle="Test your policies before deploying" >}}
{{< /cards >}}
