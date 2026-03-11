---
title: Cases
weight: 1
---

Test cases define an operation and the expected policy decision. This page covers the schema, field reference, and practical examples.

## Test Case Schema

Full annotated example:

```yaml
- case_id: "cel-req-001"
  title: "Block github__delete_file"
  tags: [cel, request, github]
  notes:
    - "Tests exact tool name match"
  phase: request
  engine: cel
  request:
    tool_name: "github__delete_file"
    arguments:
      owner: "myorg"
      repo: "myrepo"
      path: "README.md"
  expectations:
    decision: deny
    policies:
      - policy_name: "deny-github-delete-file"
        decision: deny
```

## Field Reference

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `case_id` | Yes | | Unique identifier across the suite (kebab-case) |
| `title` | Yes | | Human-readable test description |
| `tags` | No | `[]` | Tags for `--tags`/`--exclude-tags` filtering |
| `notes` | No | `[]` | Documentation for the test case |
| `phase` | No | `request` | `request`, `response`, or `both` |
| `engine` | No | `both` | `cel`, `ai`, or `both` |
| `request` | Yes* | | Required when phase includes `request` |
| `request.tool_name` | Yes* | | MCP tool name (for MCP test cases) |
| `request.arguments` | No | | Tool arguments |
| `request.command` | Yes* | | CLI command name (for CLI test cases) |
| `request.cli_arguments` | No | | CLI command arguments |
| `response` | Yes* | | Required when phase includes `response` |
| `expectations.decision` | Yes | | `allow`, `deny`, or `redact` |
| `expectations.policies` | No | `[]` | Expected triggering policies |
| `expectations.redacted_content` | No | | Expected content after redaction |

*Conditionally required based on test type and phase.

## Examples

### CEL Request Deny — Block a Specific Tool

```yaml
- case_id: "cel-req-001"
  title: "Block github__delete_file"
  tags: [cel, request, github, deny]
  phase: request
  engine: cel
  request:
    tool_name: "github__delete_file"
    arguments:
      owner: "myorg"
      repo: "myrepo"
      path: "README.md"
  expectations:
    decision: deny
    policies:
      - policy_name: "deny-github-delete-file"
        decision: deny
```

### AI Request Allow — Safe Operation Passes

```yaml
- case_id: "ai-req-001"
  title: "Allow reading a file"
  tags: [ai, request, github, allow]
  phase: request
  engine: ai
  request:
    tool_name: "github__get_file_contents"
    arguments:
      owner: "myorg"
      repo: "myrepo"
      path: "README.md"
  expectations:
    decision: allow
```

### CEL Response Redact — Sensitive Content Replaced

```yaml
- case_id: "cel-resp-001"
  title: "Redact API keys from response"
  tags: [cel, response, redact]
  phase: response
  engine: cel
  request:
    tool_name: "github__get_file_contents"
    arguments:
      path: ".env"
  response:
    content: "DATABASE_URL=postgres://...\nAPI_KEY=sk-abc123def456"
  expectations:
    decision: redact
    policies:
      - policy_name: "redact-secrets"
        decision: redact
```

### CLI Request Deny — Block a CLI Command

```yaml
- case_id: "cel-req-010"
  title: "Block kubectl with --force flag"
  tags: [cel, request, kubectl, deny]
  phase: request
  engine: cel
  request:
    command: "kubectl"
    cli_arguments: ["delete", "pod", "my-pod", "--force"]
  expectations:
    decision: deny
```

## Conventions

### Case ID Naming

Use the pattern `{engine}-{phase_prefix}-{number}`:
- `cel-req-001` — CEL request test
- `ai-req-001` — AI request test
- `cel-resp-001` — CEL response test
- `ai-resp-001` — AI response test

### Tag Vocabulary

Maintain a consistent set of tags across your test suite:

| Category | Tags |
|----------|------|
| Engine | `cel`, `ai` |
| Phase | `request`, `response` |
| Decision | `allow`, `deny`, `redact` |
| Domain | `github`, `aws`, `kubectl`, `credentials`, etc. |

### Organization

- One file per logical group (all GitHub delete tests together, all credential tests together)
- Always write both positive and negative cases for each policy
- Keep test files small and focused — easier to review and maintain

## Copy-Pasteable Schemas

YAML schemas you can copy into an AI chat or skill prompt. For annotated versions with field descriptions, see [Skills — Schema Reference](/docs/agents/skills/#schema-reference).

### CEL Request Rule Schema

```yaml
name: ""
description: ""
enabled: true
mcp_expression: ""
cli_expression: ""
action: deny
message: ""
mode: ""
```

### AI Request Rule Schema

```yaml
name: ""
description: ""
enabled: true
action: deny
mode: ""
prompt: ""
```

### Test Case Schema

```yaml
case_id: ""
title: ""
tags: []
notes: []
phase: request
engine: both
request:
  tool_name: ""
  arguments: {}
expectations:
  decision: deny
  policies:
    - policy_name: ""
      decision: deny
```

{{< callout type="tip" >}}
**Want help writing test cases?** The built-in `test-case` skill teaches your AI agent how to write tests. Run `maybe-dont skill view test-case` to see what it contains, or see [Skills](/docs/agents/skills/) to learn how to export it.
{{< /callout >}}
