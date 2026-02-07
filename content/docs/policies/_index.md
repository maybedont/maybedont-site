---
title: Policies
weight: 20
---

Policies are the rules that determine whether a tool call should be allowed, denied, or modified. Maybe Don't supports two policy engines that can work together.

## Two Engines, One Goal

| Engine | Best For | How It Works |
|--------|----------|--------------|
| **CEL** | Exact matches, known patterns | Deterministic expressions evaluated locally |
| **AI** | Complex scenarios, nuance | Natural language prompts evaluated by an LLM |

You can use one or both. CEL is fast and predictable. AI handles the edge cases that are hard to express as code.

## Request vs Response Validation

Policies can validate at two points:

- **Request validation** - Check the tool call before it reaches the downstream MCP server
- **Response validation** - Check the response before it's returned to the AI agent

Most use cases only need request validation. Response validation is useful when you need to redact sensitive data from responses.

## Audit Mode vs Enforce Mode

Each policy group can run in one of two modes:

| Mode | Behavior |
|------|----------|
| `audit_only` | Evaluate and log, but don't block (default) |
| *(empty)* | Evaluate and enforce - deny blocks the request |

Start in `audit_only` mode to understand what your policies would do, then switch to enforce mode when you're confident.

```yaml
request_validation:
  cel:
    enabled: true
    mode: audit_only  # Log but don't block
    rules_file: "cel_request_rules.yaml"
```

To enforce:

```yaml
request_validation:
  cel:
    enabled: true
    mode: ""  # Empty = enforce mode
    rules_file: "cel_request_rules.yaml"
```

## How Policies Combine

When multiple policies evaluate a request, here's how the final decision is made:

### Same Engine (Multiple CEL or Multiple AI Policies)

| Scenario | Result |
|----------|--------|
| All policies return Allow | ✅ Allow |
| Any policy returns Deny | ❌ Deny |

**Rule:** Any deny = deny. This is intentional - policies are guardrails, not voting systems.

### Different Engines (CEL + AI)

| CEL Result | AI Result | Final Decision |
|------------|-----------|----------------|
| Allow | Allow | ✅ Allow |
| Allow | Deny | ❌ Deny |
| Deny | Allow | ❌ Deny |
| Deny | Deny | ❌ Deny |
| Not evaluated | Allow | ✅ Allow |
| Not evaluated | Deny | ❌ Deny |

Both engines must agree to allow. If either denies, the request is denied.

## Blocking Budget

AI validation takes time (network round-trip to an LLM). To prevent requests from hanging forever, Maybe Don't enforces a blocking budget:

| Setting | Default | Description |
|---------|---------|-------------|
| `validation.max_blocking_ms` | 90000 (90s) | Max total time to block waiting for all validations |
| `validation.max_rule_evaluation_ms` | 45000 (45s) | Max time for any single rule |

If the budget is exhausted, remaining validations continue asynchronously but the request proceeds (fail-open). Results are still logged to the audit log.

## Policy Files

Policies are defined in separate YAML files referenced from your main config:

```yaml
request_validation:
  cel:
    enabled: true
    rules_file: "cel_request_rules.yaml"  # Relative to config directory
  ai:
    enabled: true
    rules_file: "ai_request_rules.yaml"
```

Learn more about each engine:

{{< cards >}}
  {{< card link="cel-policies" title="CEL Policies" icon="code" subtitle="Deterministic expression-based rules" >}}
  {{< card link="ai-policies" title="AI Policies" icon="sparkles" subtitle="Natural language validation" >}}
{{< /cards >}}
