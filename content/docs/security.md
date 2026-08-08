---
title: Security
weight: 50
---

Let's be clear about what Maybe Don't is and isn't, so you can deploy it with appropriate expectations.

## What Maybe Don't Is

Maybe Don't is an **opt-in MCP gateway** for users who want:

- **Visibility** - See exactly what tool calls AI agents are making
- **Guardrails** - Define policies that block dangerous operations
- **Audit trails** - Maintain a record of all actions for compliance

Think of it as a speed bump and a dashcam, not a fortress.

## What Maybe Don't Isn't

Maybe Don't is **not a security enforcement boundary**. Users can bypass it by connecting directly to downstream MCP servers. If you're trying to prevent a malicious actor from accessing your systems, this isn't the tool for that.

The value proposition is for users who **want** the safety and guardrails - developers who appreciate having a second set of eyes on their AI's actions.

## Deployment Expectations

### Network Position

Maybe Don't is expected to run **behind a firewall** or in a private network. It doesn't implement its own authentication at the gateway level.

### Authentication

Maybe Don't uses **pass-through authentication**. Credentials flow from the connecting client through to downstream servers:

- The gateway doesn't authenticate incoming clients
- The gateway doesn't store credentials
- Each request carries its own credentials to the downstream server

This means access control is handled by your downstream MCP servers, not by Maybe Don't.

### Future Authentication

We're exploring options for gateway-level authentication. If this is important to you, let us know.

## Telemetry

Maybe Don't sends no telemetry.

## Data Handling

### Tool Call Parameters

Tool call parameters are logged to your audit log (which you control) but are **never** sent anywhere outside your environment.

### AI Validation

When AI validation is enabled, tool call information is sent to your configured AI provider (OpenAI, Anthropic, etc.) for evaluation. Review your AI provider's privacy policy for how they handle this data.

### Credentials in Config

We recommend using environment variable substitution (`${VAR}`) for secrets rather than hardcoding them in config files. This keeps credentials out of your config directory.

## Responsible Use

Maybe Don't is a tool for **defensive security** - helping well-intentioned users avoid accidents. It's not designed for:

- Preventing malicious actors who control the client
- Enforcing access control (use your downstream servers for that)
- Replacing proper security architecture

Use it as one layer in a defense-in-depth approach, not as your only protection.
