---
title: CEL Policies
weight: 1
---

CEL (Common Expression Language) policies use deterministic expressions to evaluate requests. They're fast, predictable, and great for exact matches.

## When to Use CEL

- Block specific tool names
- Match exact patterns in arguments
- Enforce allow/deny lists
- Any rule that can be expressed as "if X then deny"

## Policy Schema

### Request Policy

```yaml
rules:
  - name: "rule-name"              # Unique identifier
    description: "What this does"  # Human-readable description
    enabled: true                  # true/false (default: true)
    expression: |                  # CEL expression (must return boolean)
      get(request, "method", "") == "tools/call" &&
      get(request.params, "name", "") == "dangerous_tool"
    action: deny                   # deny or allow
    message: "Tool blocked"        # Message returned when rule triggers
    mode: ""                       # "" (enforce) or "audit_only"
```

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

### Request Validation

| Variable | Type | Description |
|----------|------|-------------|
| `request` | map | The full MCP request object |
| `request.method` | string | MCP method (e.g., `tools/call`) |
| `request.params` | map | Method parameters |
| `request.params.name` | string | Tool name (for `tools/call`) |
| `request.params.arguments` | map | Tool arguments |

### Response Validation

| Variable | Type | Description |
|----------|------|-------------|
| `response` | map | The full MCP response object |
| `response.content` | string | Response content |
| `response.isError` | bool | Whether response is an error |

## CEL Functions

CEL provides useful functions for working with data:

| Function | Description | Example |
|----------|-------------|---------|
| `get(map, key, default)` | Safe map access with default | `get(request, "method", "")` |
| `has(map, key)` | Check if key exists | `has(request.params, "arguments")` |
| `contains(string, substr)` | String contains | `"hello".contains("ell")` |
| `startsWith(string, prefix)` | String prefix check | `"hello".startsWith("he")` |
| `endsWith(string, suffix)` | String suffix check | `"hello".endsWith("lo")` |
| `matches(string, regex)` | Regex match | `"test".matches("t.*t")` |
| `size(collection)` | Length of string/list/map | `size("hello") == 5` |

## Examples

### Block a Specific Tool

```yaml
rules:
  - name: deny-delete-file
    description: Block file deletion
    expression: |
      get(request, "method", "") == "tools/call" &&
      get(request.params, "name", "") == "github__delete_file"
    action: deny
    message: File deletion is not allowed
```

### Block Tools by Pattern

```yaml
rules:
  - name: deny-all-delete-tools
    description: Block any tool with "delete" in the name
    expression: |
      get(request, "method", "") == "tools/call" &&
      get(request.params, "name", "").contains("delete")
    action: deny
    message: Delete operations are not allowed
```

### Block Specific Arguments

```yaml
rules:
  - name: deny-force-flag
    description: Block kubectl commands with --force
    expression: |
      get(request, "method", "") == "tools/call" &&
      get(request.params, "name", "") == "kubectl__run" &&
      has(request.params, "arguments") &&
      has(request.params.arguments, "command") &&
      request.params.arguments.command.contains("--force")
    action: deny
    message: Force flag is not allowed
```

### Allow List (Block Everything Else)

```yaml
rules:
  - name: allow-only-read-tools
    description: Only allow read operations
    expression: |
      get(request, "method", "") == "tools/call" &&
      !(get(request.params, "name", "").startsWith("github__get_") ||
        get(request.params, "name", "").startsWith("github__list_"))
    action: deny
    message: Only read operations are allowed
```

## Per-Rule Mode Override

Individual rules can override the top-level mode:

```yaml
request_validation:
  cel:
    enabled: true
    mode: ""  # Enforce by default

rules:
  - name: critical-rule
    expression: |
      # This rule enforces (inherits from top-level mode: "")
      ...
    action: deny

  - name: experimental-rule
    mode: audit_only  # This rule only logs, doesn't block
    expression: |
      ...
    action: deny
```

## Testing Your Rules

Run Maybe Don't with `audit_only` mode and watch the audit log to see what your rules would do:

```yaml
request_validation:
  cel:
    enabled: true
    mode: audit_only
    rules_file: "cel_request_rules.yaml"
```

Then review `audit.log` for entries showing `"decision": "deny"` to understand what would be blocked.
