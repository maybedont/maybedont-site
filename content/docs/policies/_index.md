---
title: Policies
weight: 20
---

Policies are the rules that determine whether an operation — MCP tool call or CLI command — should be allowed, denied, or modified. Maybe Don't supports two policy engines that work together.

## Two Engines, One Goal

| | AI Policies | CEL Policies |
|---|---|---|
| **Best for** | Nuanced judgment, intent-based rules, broad categories | Specific known patterns, exact matches, explicit blocklists |
| **Example** | "Block operations that could leak credentials" | "Block the `github__delete_file` tool" |
| **Speed** | Seconds (LLM API call) | Microseconds (local eval) |
| **Cost** | Per-API-call | Free |
| **Determinism** | Probabilistic (temperature=0.0 helps) | 100% deterministic |
| **MCP + CLI** | One policy covers both (generic) | Needs separate expressions per surface |

**Recommendation:** Start with AI policies for broad coverage. Add CEL rules only for specific, concrete patterns you want to enforce deterministically. Most users will get the majority of their value from AI policies.

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

AI validation takes time (network round-trip to an LLM). To prevent requests from hanging forever, the gateway enforces a blocking budget:

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

Learn more:

{{< cards >}}
  {{< card link="ai-policies" title="AI" icon="sparkles" subtitle="The primary policy engine" >}}
  {{< card link="cel-policies" title="CEL" icon="code" subtitle="Fast, deterministic rules" >}}
  {{< card link="writing-policies" title="How-To" icon="pencil" subtitle="Practical guide to writing policies" >}}
{{< /cards >}}
