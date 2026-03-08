---
title: API
weight: 10
---

The gateway exposes REST endpoints for integrations that don't use MCP. These endpoints accept JSON requests and return validation decisions — the caller decides what to do with the result.

All endpoints use the same [CEL](/docs/policies/cel-policies/) and [AI](/docs/policies/ai-policies/) policy engines that the MCP gateway uses. One set of policies, multiple integration surfaces.

## Endpoints

| Endpoint | Purpose |
|----------|---------|
| [`POST /api/v1/cli/validate`](/docs/api/cli-validate/) | Validate CLI commands before execution |
| [`POST /api/v1/action/validate`](/docs/api/action-validate/) | Validate agent actions before execution |
| [`POST /api/v1/intercept`](/docs/api/intercept/) | Validate tool calls from agent hook scripts |

## Common Headers

All API endpoints accept these headers:

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | Must be `application/json` |
| `X-Maybe-Dont-Client-ID` | No | Client identifier for audit attribution |
| `X-Request-ID` | No | Per-request tracing ID (generated if missing) |

## Choosing a Validation Surface

The API endpoints listed above are not the only way to validate with Maybe Don't. The MCP gateway validates inline as a proxy. This table compares all validation surfaces to help you choose the right integration point.

| Aspect | MCP Gateway | CLI Validate | Action Validate | Intercept |
|--------|-------------|--------------|-----------------|-----------|
| Integration | MCP proxy (inline) | REST endpoint | REST endpoint | REST endpoint |
| Trigger | MCP tool call through gateway | External CLI wrapper | Agent framework | Agent hook script |
| Phases | Request + response (automatic) | Request only | Request only | Request + response (caller chooses) |
| Proxies execution | Yes | No | No | No |
| Response format | MCP protocol | `allowed` boolean | `allowed` + `risk_level` | `valid` boolean + `messages` |

## Server Requirements

API endpoints require the gateway to be running in `http` or `sse` mode (not `stdio`), since they need a network listener.

```yaml
server:
  type: http
  listen_addr: ":8080"
```

{{< cards >}}
  {{< card link="cli-validate" title="CLI Validate" icon="terminal" subtitle="Validate CLI commands before execution" >}}
  {{< card link="action-validate" title="Action Validate" icon="shield-check" subtitle="Validate agent actions before execution" >}}
  {{< card link="intercept" title="Intercept" icon="lightning-bolt" subtitle="Validate tool calls from agent hook scripts" >}}
{{< /cards >}}
