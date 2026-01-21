---
title: Documentation
linkTitle: Home
toc: false
aliases:
  - /download/   # Redirect old download URL until we decide to re-publish /docs/download.md
---

## What is Maybe Don't?

Maybe Don't is a security gateway that sits between AI assistants (like Claude) and external tools/servers. It monitors and blocks potentially dangerous AI actions before they can affect your system. Think of it as a firewall for AI tool calls - it logs everything and stops risky operations like deleting files or accessing sensitive data.

{{< callout type="info" >}}
**Why use it?** When AI assistants interact with your systems through MCP (Model Context Protocol) servers, you want protection against unintended consequences. Maybe Don't gives you that safety net with real-time monitoring and intelligent blocking.
{{< /callout >}}

{{< cards >}}
  {{< card link="configuration" title="Configuration" icon="cog" subtitle="Configure the gateway and downstream servers" >}}
  {{< card link="policies" title="Policy Configuration" icon="shield-check" subtitle="Set up CEL and AI-powered validation rules" >}}
  {{< card link="containers" title="Container Deployment" icon="cube" subtitle="Run with Docker or Podman" >}}
{{< /cards >}}
