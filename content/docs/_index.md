---
title: Documentation
linkTitle: Home
toc: false
---

## What is Maybe Don't?

Maybe Don't is an MCP gateway that sits between AI agents (Claude Code, Cursor, Codex, etc.) and downstream MCP servers. Every tool call flows through Maybe Don't, where it can be audited and validated against policies before reaching its destination.

Think of it as a security checkpoint for your AI's actions. You define the rules, Maybe Don't enforces them.

{{< inline-svg path="images/architecture-diagram.svg" style="max-width: 100%; height: auto; margin: 2rem 0;" >}}

## Why Use It?

- **Audit everything** - See exactly what your AI agents are doing
- **Set guardrails** - Block dangerous operations before they happen
- **Control access** - Route all MCP traffic through a single point
- **Stay informed** - Review decisions in structured audit logs

## Get Started

{{< cards >}}
  {{< card link="get-started" title="Get Started" icon="play" subtitle="Up and running in 5 minutes" >}}
  {{< card link="configuration" title="Configuration" icon="cog" subtitle="Configure the gateway and downstream servers" >}}
  {{< card link="policies" title="Policies" icon="shield-check" subtitle="Set up validation rules" >}}
  {{< card link="audit-log" title="Audit Log" icon="document-text" subtitle="Understand what's being logged" >}}
  {{< card link="examples" title="Examples" icon="code" subtitle="Connect your AI agent" >}}
{{< /cards >}}
