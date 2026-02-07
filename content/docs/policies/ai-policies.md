---
title: AI Policies
weight: 2
---

AI policies use natural language prompts to evaluate requests. An LLM reads your prompt, analyzes the tool call, and returns a decision. This handles nuanced scenarios that are hard to express as CEL expressions.

## When to Use AI Policies

- Complex security scenarios (e.g., "is this a mass deletion?")
- Context-dependent decisions
- Patterns that are hard to express in code
- Catching edge cases that slip past deterministic rules

## AI Provider Configuration

Configure your AI provider in the main config file:

```yaml
validation:
  ai:
    provider: openai          # openai, anthropic, or openai_compatible
    endpoint: "https://api.openai.com/v1/chat/completions"
    model: "gpt-4o-mini"
    api_key: "${OPENAI_API_KEY}"
```

### Supported Providers

| Provider | Description |
|----------|-------------|
| `openai` | OpenAI API (default) |
| `anthropic` | Anthropic Claude API |
| `openai_compatible` | Any OpenAI-compatible API (requires `endpoint`) |

## Policy Schema

### Request Policy

```yaml
rules:
  - name: "rule-name"              # Unique identifier
    description: "What this does"  # Human-readable description
    enabled: true                  # true/false (default: true)
    action: deny                   # deny or allow (default: deny)
    mode: ""                       # "" (enforce) or "audit_only"
    prompt: |                      # Natural language prompt
      ANALYZE: Does this operation do something dangerous?

      Tool call: %s

      Return ONLY JSON: { "allowed": true/false, "message": "explanation" }
```

### Response Policy

```yaml
rules:
  - name: "check-sensitive-data"
    description: "Check if response contains sensitive data"
    action: deny
    prompt: |
      ANALYZE: Does this response contain sensitive information
      that should not be returned to the user?

      Look for: API keys, passwords, private keys, internal URLs,
      database connection strings, personal information.

      Response: %s

      Return ONLY JSON: { "allowed": true/false, "message": "explanation" }
```

## Writing Effective Prompts

Good AI prompts are clear, specific, and include examples. Here's a pattern that works well:

```yaml
prompt: |
  ANALYZE: [Clear question about what to check]

  Look for: [Specific patterns or indicators]

  EXAMPLES:
  - [safe example] → { "allowed": true, "message": "why safe" }
  - [dangerous example] → { "allowed": false, "message": "why dangerous" }
  - [edge case] → { "allowed": true/false, "message": "explanation" }

  Tool call: %s

  Return ONLY JSON in this exact format: { "allowed": true/false, "message": "your message" }
```

The `%s` placeholder is replaced with the actual tool call JSON at evaluation time.

## Built-in AI Rules

Maybe Don't includes default AI rules that cover common security scenarios:

| Rule | Description |
|------|-------------|
| Mass deletion operations | Blocks wildcards, recursive flags, bulk deletes |
| System directory access | Blocks /etc/, /sys/, /proc/, etc. |
| Command execution tools | Blocks bash, shell, exec, etc. |
| Credential file access | Blocks .env, .pem, .ssh/, etc. |
| External network access | Blocks requests to non-approved domains |
| Executable file creation | Blocks .exe, .sh, .bat, etc. |
| Large file operations | Blocks >100MB files, >10MB content |

These are in `ai_request_rules.yaml` generated on first run. Edit or replace as needed.

## Example: Mass Deletion Detection

```yaml
rules:
  - name: "check-mass-deletion"
    description: "Prevent deletion of multiple files"
    enabled: true
    action: deny
    prompt: |
      ANALYZE: Does this operation delete multiple files or use dangerous deletion patterns?

      Look for: delete_file, rm, remove_file with wildcards (*), recursive flags (-r, --recursive), force flags (-f, --force), or >5 files

      EXAMPLES:
      - kubectl get po → NOT deletion → { "allowed": true, "message": "Not a deletion operation" }
      - kubectl delete po --all → IS dangerous → { "allowed": false, "message": "Wildcard deletion blocked" }
      - kubectl delete po app-1234 → SAFE → { "allowed": true, "message": "Single pod deletion allowed" }
      - delete_file path="*" → DANGEROUS → { "allowed": false, "message": "Wildcard deletion blocked" }

      Tool call: %s

      Return ONLY JSON: { "allowed": true/false, "message": "your message" }
```

## Example: Custom Business Rule

```yaml
rules:
  - name: "check-production-access"
    description: "Require approval for production database access"
    enabled: true
    action: deny
    prompt: |
      ANALYZE: Does this operation access a production database?

      Production indicators:
      - Database names containing: prod, production, live, main
      - Hostnames containing: prod, prd, production
      - Connection strings with production markers

      If this accesses production data, deny unless the operation is read-only (SELECT).

      Tool call: %s

      Return ONLY JSON: { "allowed": true/false, "message": "your message" }
```

## Performance Considerations

AI validation adds latency (typically 1-5 seconds per rule). To optimize:

1. **Order rules by likelihood** - Put commonly-triggered rules first
2. **Use CEL for simple checks** - AI is overkill for exact matches
3. **Disable unused rules** - Set `enabled: false` on rules you don't need
4. **Tune the blocking budget** - Adjust `validation.max_blocking_ms` if needed

## Per-Rule Mode Override

Like CEL policies, individual AI rules can override the top-level mode:

```yaml
rules:
  - name: critical-rule
    # Inherits mode from request_validation.ai.mode
    prompt: ...

  - name: experimental-rule
    mode: audit_only  # Only logs, doesn't block
    prompt: ...
```

## Debugging AI Decisions

Enable debug logging to see AI responses:

```yaml
logger:
  level: debug
```

Or check the audit log for detailed validation results including the AI's reasoning.
