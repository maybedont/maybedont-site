---
title: API
weight: 10
---

The gateway exposes REST endpoints for integrations that don't use MCP. These endpoints accept JSON requests and return validation decisions — the caller decides what to do with the result.

Both endpoints use the same [CEL](/docs/policies/cel-policies/) and [AI](/docs/policies/ai-policies/) policy engines that the MCP gateway uses. One set of policies, multiple integration surfaces.

## Endpoints

| Endpoint | Purpose |
|----------|---------|
| [`POST /api/v1/cli/validate`](/docs/api/cli-validate/) | Validate CLI commands before execution |
| [`POST /api/v1/action/validate`](/docs/api/action-validate/) | Validate agent actions before execution |

## Common Headers

All API endpoints accept these headers:

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | Must be `application/json` |
| `X-Maybe-Dont-Client-ID` | No | Client identifier for audit attribution |
| `X-Request-ID` | No | Per-request tracing ID (generated if missing) |

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
{{< /cards >}}
