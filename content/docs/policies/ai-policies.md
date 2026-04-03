---
title: AI
weight: 2
---

AI policies are the primary policy engine. They use natural language prompts to evaluate operations — an LLM reads your prompt, analyzes the tool call or CLI command, and returns a decision. This handles nuanced, intent-based scenarios that are impossible to express as deterministic rules.

## When to Use AI Policies

- Complex security scenarios (e.g., "is this a mass deletion?")
- Context-dependent decisions where intent matters
- Broad categories of behavior to allow or deny
- Catching edge cases that slip past deterministic rules

AI policies are **generic across MCP and CLI**. A single AI policy applies to both MCP tool calls and CLI commands — the engine normalizes the operation and appends it to your prompt automatically. You write the detection logic once.

## AI Provider Configuration

Configure your AI provider in the main config file:

```yaml
validation:
  ai:
    provider: openai
    endpoint: "https://api.openai.com/v1/chat/completions"
    model: "gpt-5.1"
    api_key: "${OPENAI_API_KEY}"
```

### Supported Providers

| Provider | Description |
|----------|-------------|
| `openai` | OpenAI API (default) |
| `anthropic` | Anthropic Claude API |
| `openai_compatible` | Any OpenAI-compatible API: Google Gemini, Groq, LiteLLM, Azure OpenAI, vLLM, Ollama, OpenRouter, etc. |

The `openai_compatible` provider works with any API that speaks the OpenAI chat completions format. Set the `endpoint` to your provider's URL.

### Temperature

Temperature defaults to **0.0** for deterministic policy evaluation. This produces the most consistent, repeatable decisions. You can override it if needed:

```yaml
validation:
  ai:
    parameters:
      temperature: 0.0  # Default — recommended for policy evaluation
```

## How Prompts Work

You write the evaluation prompt. The engine automatically appends the operation context — you do **not** include any placeholder. The engine appends:

For MCP tool calls:
```
[Your policy prompt]

Tool call:
{"type": "mcp_tool", "name": "github__delete_file", "arguments": {"owner": "myorg", "repo": "myrepo", "path": "README.md"}}
```

For CLI commands:
```
[Your policy prompt]

CLI command:
{"type": "cli", "name": "gh", "arguments": ["pr", "comment", "123", "--body", "Looks good!"]}
```

The label ("Tool call:" or "CLI command:") is context-appropriate. **Do not include `%s` in prompts** — the engine will reject it.

## Policy Schema

### Request Policy

```yaml
rules:
  - name: "rule-name"
    description: "What this does"
    enabled: true
    action: deny
    mode: enforce
    prompt: |-
      ANALYZE: Does this operation do something dangerous?

      Look for: mass deletions, recursive deletes, wildcard patterns,
      force flags, or operations targeting more than 5 items.

      EXAMPLES:
      - rm -rf /tmp/cache -> SAFE: Clearing a temp cache
      - rm -rf * -> DANGEROUS: Wildcard recursive deletion
      - delete_file path="README.md" -> SAFE: Single file deletion
```

### Response Policy

```yaml
rules:
  - name: "check-sensitive-data"
    description: "Check if response contains sensitive data"
    action: deny
    prompt: |-
      ANALYZE: Does this response contain sensitive information
      that should not be returned to the user?

      Look for: API keys, passwords, private keys, internal URLs,
      database connection strings, personal information.
```

{{< callout type="warning" >}}
**Response `deny` semantics:** A `deny` on a response means "don't show the response to the AI agent." This only makes sense for read-only operations (queries, list commands). If the operation already created, modified, or deleted something, denying the response is misleading — the action already happened. Use `redact` for response policies when possible, and reserve `deny` for read-only contexts.
{{< /callout >}}

### Response Format

The engine automatically enforces the response format using JSON Schema structured output — you do **not** need to include format instructions in your prompts. The AI provider returns:

```json
{ "allowed": true, "message": "Operation is safe" }
```

For response policies with redaction, the schema includes an additional field:

```json
{ "allowed": false, "message": "Contains API key", "redacted_content": "..." }
```

## Writing Effective Prompts

Good AI prompts are clear, specific, and include examples:

```yaml
prompt: |-
  ANALYZE: Does this operation delete multiple files or use dangerous
  deletion patterns?

  Look for: delete_file, rm, remove_file with wildcards (*),
  recursive flags (-r, --recursive), force flags (-f, --force),
  or operations targeting more than 5 items.

  EXAMPLES:
  - kubectl get po -> SAFE: Not a deletion operation
  - kubectl delete po --all -> DANGEROUS: Wildcard deletion of all pods
  - kubectl delete po app-1234 -> SAFE: Single pod deletion
  - delete_file path="*" -> DANGEROUS: Wildcard file deletion
```

Tips:
- Be specific about what constitutes a violation
- Include both safe and dangerous examples — the model uses these as calibration
- Keep prompts focused — one concern per policy
- Use `|-` (strip trailing newline) for cleaner prompts

## Built-in AI Rules

The default configuration includes AI rules that cover common security scenarios:

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

## Example: Custom Business Rule

```yaml
rules:
  - name: "check-production-access"
    description: "Require approval for production database access"
    enabled: true
    action: deny
    prompt: |-
      ANALYZE: Does this operation access a production database?

      Production indicators:
      - Database names containing: prod, production, live, main
      - Hostnames containing: prod, prd, production
      - Connection strings with production markers

      If this accesses production data, deny unless the operation
      is read-only (SELECT).

      EXAMPLES:
      - SELECT * FROM prod.users WHERE id = 5 -> SAFE: Read-only query
      - DELETE FROM production.logs -> DANGEROUS: Destructive operation on production
      - psql -h dev-db.internal -> SAFE: Development database
```

## Performance Considerations

AI validation adds latency (typically 1-5 seconds per rule). To optimize:

1. **Use CEL for simple checks** — AI is overkill for exact matches
2. **Disable unused rules** — Set `enabled: false` on rules you don't need
3. **Tune the blocking budget** — Adjust `validation.max_blocking_ms` if needed
4. **Choose efficient models** — Models like `gpt-5.1` offer a good balance of accuracy, speed, and cost for policy evaluation

## Per-Rule Mode Override

Individual AI rules can override the top-level mode:

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

Or check the [audit log](/docs/audit-log/) for detailed validation results including the AI's reasoning.

{{< callout type="tip" >}}
**Want help writing AI policies?** The built-in `ai-policy` skill teaches your AI agent how to author policies. See [Skills](/docs/agents/skills/) to learn how to export it, or run `maybe-dont skill view ai-policy` to see what it contains.
{{< /callout >}}
