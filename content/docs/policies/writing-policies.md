---
title: How-To
weight: 3
---

This is the practical guide for writing policies. Not the schema reference — that's on the [AI](/docs/policies/ai-policies/) and [CEL](/docs/policies/cel-policies/) pages. This is how to think about it.

## Start with AI Policies

Most policy goals are best expressed in natural language. Write a prompt that describes what you want to allow or deny. AI policies are generic — they cover both MCP tool calls and CLI commands with a single rule.

```yaml
# This one rule covers both MCP tool calls and CLI commands
rules:
  - name: "prevent-credential-exposure"
    description: "Block operations that could leak credentials"
    action: deny
    prompt: |-
      ANALYZE: Could this operation expose or leak credentials,
      secrets, API keys, or authentication tokens?

      Look for: reading .env files, listing secrets, accessing
      credential stores, copying key files, printing environment
      variables.

      EXAMPLES:
      - cat ~/.ssh/id_rsa -> DANGEROUS: Reading private key
      - kubectl get secret -> DANGEROUS: Listing cluster secrets
      - gh secret list -> DANGEROUS: Listing GitHub secrets
      - cat README.md -> SAFE: Reading a documentation file
```

AI policies handle nuance well — the LLM understands intent, not just string patterns. A rule about "credential exposure" will catch `cat ~/.ssh/id_rsa`, `kubectl get secret`, and `gh secret list` without you enumerating each one.

## Add CEL for Specific Patterns

Once you have AI coverage, identify operations you want to enforce **deterministically** — tool names to blocklist, argument patterns to reject, commands that should never run. These become CEL rules.

```yaml
rules:
  - name: "block-github-delete"
    description: "Never allow GitHub file deletion"
    mcp_expression: |
      tool.name == "github__delete_file"
    cli_expression: |
      cli.command == "gh" &&
      cli.arguments.size() >= 2 &&
      cli.arguments[1] == "delete"
    action: deny
    message: "GitHub delete operations are blocked"
```

CEL is a **supplement** to AI policies, not a replacement. Think of it as a safety net for the things you absolutely, unambiguously want to block — regardless of how an LLM interprets the situation.

## Pros and Cons

| | AI Policies | CEL Policies |
|---|---|---|
| **Pros** | Flexible, handles edge cases, intent-aware, one rule covers MCP + CLI | Instant, free, deterministic, no external dependencies |
| **Cons** | Adds latency (1-5s), costs per API call, probabilistic | Can only match explicit patterns, can't reason about intent, easy to write over-broad rules |

## Start in Audit-Only Mode

Write policies with `mode: audit_only` first. Review the [audit log](/docs/audit-log/) to see what would have been blocked. When confident, switch to enforce mode.

```yaml
rules:
  - name: "experimental-rule"
    mode: audit_only  # Evaluate and log, but don't block
    action: deny
    prompt: |
      ...
```

This reduces the risk of accidentally blocking legitimate operations on day one. Let the system observe before it enforces.

## Write Tests for Every Policy

For each policy, write at least two test cases:

1. **An operation that should be denied** — proves the policy catches what it should
2. **An operation that should be allowed** — proves the policy doesn't over-block

This is especially important for AI policies, which are probabilistic. Testing with multiple models helps you find the right accuracy/cost tradeoff.

See [Testing](/docs/testing/) for the full guide on writing and running policy tests.

## Think About Both Directions

A common mistake is only testing the "deny" case. Consider:

- **False negatives** — Does your deny rule actually catch the bad thing?
- **False positives** — Does your deny rule accidentally block legitimate operations?

For example, a rule that blocks "delete" in tool names will also block `github__get_deleted_branches`. Is that what you want? If not, make the pattern more specific or use AI instead.

## Layering Strategy

A practical approach for most teams:

1. **AI policies for broad categories** — credential exposure, mass operations, production access, data exfiltration
2. **CEL rules for hard blocklists** — specific tools that should never be called, commands that should never run
3. **Audit-only mode for new rules** — test in production without risk
4. **Graduated enforcement** — move rules from audit to enforce as confidence grows

## Policy Organization

Rules can live in a single file or a directory of files:

- **Single file** (`cel_request_rules.yaml`) — works for simple setups
- **Directory** (`cel_request_rules/`) — better for teams managing many rules across domains

When using directories, organize by domain:

```
cel_request_rules/
├── github-rules.yaml
├── aws-rules.yaml
├── kubectl-rules.yaml
└── general-rules.yaml
```

{{< callout type="tip" >}}
**Let your AI agent help.** The built-in `ai-policy`, `cel-policy`, and `test-case` skills teach your agent how to write policies and tests. See [Skills](/docs/agents/skills/) to learn how to export them.
{{< /callout >}}
