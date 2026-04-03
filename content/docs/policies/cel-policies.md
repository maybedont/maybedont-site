---
title: CEL
weight: 1
---

CEL (Common Expression Language) policies use deterministic expressions to evaluate operations. They're fast, free, and 100% predictable — great for explicit pattern matching and known blocklists.

## When to Use CEL

CEL rules are for narrow, explicit pattern matching:

- Block a specific tool by name
- Deny arguments that match a known dangerous pattern
- Enforce allow/deny lists for tool names or commands
- Any rule that can be expressed as "if X then deny"

If you're trying to express something nuanced or intent-based, use an [AI policy](/docs/policies/ai-policies/) instead. CEL shines when you know exactly what you want to block.

## Policy Schema

### Request Policy

```yaml
rules:
  - name: "rule-name"
    description: "What this does"
    enabled: true
    mcp_expression: |
      tool.name == "dangerous_tool"
    cli_expression: |
      cli.command == "dangerous-cmd"
    action: deny
    message: "Tool blocked"
    mode: enforce
```

### Dual Expression Support

Unlike AI policies, CEL requires **separate expressions** for MCP and CLI contexts because the data structures differ. A single rule can have both:

```yaml
rules:
  - name: deny-delete-operations
    description: Block file deletion across MCP and CLI
    mcp_expression: |
      tool.name == "github__delete_file"
    cli_expression: |
      cli.command == "gh" &&
      cli.arguments.exists(a, a == "delete")
    action: deny
    message: Delete operations are not allowed
```

The engine evaluates the right expression based on the request type:
- MCP tool call → evaluates `mcp_expression`
- CLI command → evaluates `cli_expression`
- If a rule only has one expression type, it only applies to that context

{{< callout type="info" >}}
The legacy `expression` field is treated as `mcp_expression` for backwards compatibility. New rules should use `mcp_expression` and `cli_expression` explicitly.
{{< /callout >}}

### Response Policy

Response policies can also redact content:

```yaml
rules:
  - name: "redact-secrets"
    description: "Redact API keys from responses"
    enabled: true
    expression: |
      response.content.contains("api_key")
    action: redact
    redaction_pattern: "api_key[\"']?\\s*[:=]\\s*[\"']?[a-zA-Z0-9_-]+"
    redaction_replacement: "api_key: [REDACTED]"
    message: "Redacted API key from response"
```

## Available Variables

### MCP Request Context

| Variable | Type | Description |
|----------|------|-------------|
| `tool.name` | string | Tool name (e.g., `github__delete_file`) |
| `tool.arguments` | map | Tool arguments |
| `request.params` | map | Full MCP request parameters |
| `request` | map | The full MCP request object |

### CLI Request Context

| Variable | Type | Description |
|----------|------|-------------|
| `cli.command` | string | Command name (e.g., `gh`, `aws`, `kubectl`) |
| `cli.arguments` | list | Command arguments |
| `cli.working_directory` | string | Working directory |
| `cli.client_info.hostname` | string | Client hostname |
| `cli.client_info.username` | string | Client username |
| `cli.client_info.os` | string | Client OS |
| `cli.client_info.arch` | string | Client architecture |

### Response Context

| Variable | Type | Description |
|----------|------|-------------|
| `response.content` | string | Response content |
| `response.isError` | bool | Whether response is an error |
| `response.meta` | map | Response metadata |

## CEL Functions

| Function | Description | Example |
|----------|-------------|---------|
| `get(map, key, default)` | Safe map access with default | `get(tool.arguments, "path", "")` |
| `has(map, key)` | Check if key exists | `has(tool.arguments, "force")` |
| `.contains(substr)` | String contains | `tool.name.contains("delete")` |
| `.startsWith(prefix)` | String prefix check | `tool.name.startsWith("github__")` |
| `.endsWith(suffix)` | String suffix check | `tool.name.endsWith("_file")` |
| `.matches(regex)` | Regex match | `tool.name.matches(".*delete.*")` |
| `.size()` | Length of string/list/map | `cli.arguments.size() > 5` |
| `.exists(predicate)` | Any element matches | `cli.arguments.exists(a, a == "--force")` |
| `.all(predicate)` | All elements match | `cli.arguments.all(a, !a.startsWith("-"))` |
| `in` | Membership test | `tool.name in ["tool_a", "tool_b"]` |

## Examples

### Block a Specific Tool

```yaml
rules:
  - name: deny-delete-file
    description: Block file deletion
    mcp_expression: |
      tool.name == "github__delete_file"
    action: deny
    message: File deletion is not allowed
```

### Block Tools by Pattern

```yaml
rules:
  - name: deny-all-delete-tools
    description: Block any tool with "delete" in the name
    mcp_expression: |
      tool.name.contains("delete")
    action: deny
    message: Delete operations are not allowed
```

### Block CLI Commands with Dangerous Flags

```yaml
rules:
  - name: deny-force-flag
    description: Block kubectl commands with --force
    cli_expression: |
      cli.command == "kubectl" &&
      cli.arguments.exists(a, a == "--force")
    action: deny
    message: Force flag is not allowed
```

### Block Across Both MCP and CLI

```yaml
rules:
  - name: deny-destructive-github
    description: Block destructive GitHub operations everywhere
    mcp_expression: |
      tool.name.contains("delete") ||
      tool.name.contains("remove")
    cli_expression: |
      cli.command == "gh" &&
      cli.arguments.exists(a, a == "delete" || a == "remove")
    action: deny
    message: Destructive GitHub operations are not allowed
```

### Allow List (Block Everything Else)

```yaml
rules:
  - name: allow-only-read-tools
    description: Only allow read operations
    mcp_expression: |
      !(tool.name.startsWith("github__get_") ||
        tool.name.startsWith("github__list_"))
    action: deny
    message: Only read operations are allowed
```

## Per-Rule Mode Override

Individual rules can override the top-level mode:

```yaml
rules:
  - name: critical-rule
    # Inherits mode from request_validation.cel.mode
    mcp_expression: ...
    action: deny

  - name: experimental-rule
    mode: audit_only  # This rule only logs, doesn't block
    mcp_expression: ...
    action: deny
```

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Using `mcp_expression` for CLI context | Variables don't exist, expression fails | Use `cli_expression` with `cli.*` variables |
| Accessing nested fields without `has()` | Runtime error on missing field | Use `has()` or `get()` for optional fields |
| Using `==` for partial string match | Only matches exact strings | Use `.contains()` for substrings |
| Complex intent-based logic in CEL | Brittle, misses edge cases | Use an AI policy instead |

## Testing Your Rules

Run with `audit_only` mode and watch the audit log:

```yaml
request_validation:
  cel:
    enabled: true
    mode: audit_only
    rules_file: "cel_request_rules.yaml"
```

Review the [audit log](/docs/audit-log/) for entries showing `"decision": "deny"` to see what would be blocked. When you're ready to test systematically, see [Testing](/docs/testing/).

{{< callout type="tip" >}}
**Want help writing CEL policies?** The built-in `cel-policy` skill teaches your AI agent how to author rules. See [Skills](/docs/agents/skills/) to learn how to export it, or run `maybe-dont skill view cel-policy` to see what it contains.
{{< /callout >}}
