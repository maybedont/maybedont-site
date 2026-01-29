---
title: Documentation
linkTitle: Home
toc: false
aliases:
  - /download/   # Redirect old download URL until we decide to re-publish /docs/download.md
---

## What is Maybe Don't?

Maybe Don't AI is an MCP gateway that operates between AI agents such as Claude or ChatGPT and downstream MCP servers.

Tools are discovered and called through Maybe Don't. Each tool call is audited, and you may run policy against the tool request and the tool response. 

The gateway will then expose all downstream tools to the connecting agent. When a tool call is made, one or more policies evaluate the tool call. A tool can then be allowed, or denied.

The diagram below illustrates the gateway architecture:

<img src="/images/architecture-diagram.svg" alt="Maybe Don't MCP Gateway Architecture" style="max-width: 100%; height: auto; margin: 2rem 0;" />

{{< cards >}}
  {{< card link="configuration" title="Configuration" icon="cog" subtitle="Configure the gateway and downstream servers" >}}
  {{< card link="policies" title="Policy Configuration" icon="shield-check" subtitle="Set up CEL and AI-powered validation rules" >}}
  {{< card link="containers" title="Container Deployment" icon="cube" subtitle="Run with Docker or Podman" >}}
{{< /cards >}}
