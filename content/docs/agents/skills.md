---
title: Skills
weight: 3
aliases:
  - /docs/skills/
---

{{< callout type="info" >}}
**For runtime policy enforcement, use [Hooks](/docs/agents/hooks/).** Skills are for teaching agents to author policies and test cases.
{{< /callout >}}

Maybe Don't ships AI agent skills — pre-written instructions embedded in the binary that teach AI coding agents how to use the gateway's features. Export them and give them to your agent.

## What Are Skills?

Skills are prompt templates. They contain schema references, examples, and instructions that teach an AI agent how to write CEL policies, AI policies, test cases, or route CLI commands through the proxy. Instead of copy-pasting documentation into a chat, you export a skill and the agent has everything it needs.

## Available Skills

| Skill | Description |
|-------|-------------|
| `cli` | Teaches an agent to route CLI commands through the proxy. Use [hooks](/docs/agents/hooks/) instead when available — the CLI skill is a fallback for agents that don't support hooks. |
| `cel-policy` | Guide for authoring CEL deterministic policy rules |
| `ai-policy` | Guide for authoring AI LLM-powered policy rules |
| `test-case` | Guide for writing policy test cases and configuring test suites |

## Listing Skills

```bash
maybe-dont skill list
```

## Exporting Skills

Use `skill view` to output a skill in a format your agent understands:

```bash
# Claude Code
maybe-dont skill view cel-policy --format claude > .claude/skills/cel-policy.md

# Cursor
maybe-dont skill view cel-policy --format cursor >> .cursorrules

# GitHub Copilot
maybe-dont skill view cel-policy --format copilot > .github/copilot-instructions.md

# Generic (any agent)
maybe-dont skill view cel-policy --format generic > instructions.md
```

### Output Formats

| Format | Target | Description |
|--------|--------|-------------|
| `claude` | Claude Code | Full skill with markdown sections |
| `cursor` | Cursor IDE | Concise `.cursorrules` format |
| `copilot` | GitHub Copilot | Copilot instructions markdown |
| `generic` | Any agent | General-purpose markdown |

## Workflow: Writing Policies and Tests

Here's how to use skills end-to-end:

1. **Export the policy skill** to your agent:
   ```bash
   maybe-dont skill view ai-policy --format claude > .claude/skills/ai-policy.md
   ```

2. **Describe the policy you want** in natural language — the agent uses the skill's schema reference and examples to produce valid YAML

3. **Export the test-case skill:**
   ```bash
   maybe-dont skill view test-case --format claude > .claude/skills/test-case.md
   ```

4. **Ask the agent to generate test cases** for the policy it just wrote

5. **Run the tests** to validate:
   ```bash
   maybe-dont test policies --suite-dir ./suite
   ```

## Schema Reference

Quick-reference schemas showing every field. The embedded skills include richer context — CEL variables, available functions, prompt patterns, and worked examples — that helps AI agents produce correct YAML. Use `maybe-dont skill view <name>` to see the full version, or export it to your agent with `--format`.

### CEL Request Rule

```yaml
name: ""                   # Unique rule identifier (kebab-case)
description: ""            # Human-readable description
enabled: true              # true or false
mcp_expression: ""         # CEL expression for MCP tool calls
cli_expression: ""         # CEL expression for CLI commands
action: deny               # deny or allow
message: ""                # Message returned when rule triggers
mode: ""                   # audit_only or enforce (empty = enforce)
```

### AI Request Rule

```yaml
name: ""                   # Unique rule identifier (kebab-case)
description: ""            # Human-readable description
enabled: true              # true or false
action: deny               # deny or allow
mode: ""                   # audit_only or enforce (empty = enforce)
prompt: ""                 # Natural language policy instruction
```

### Test Case

```yaml
case_id: ""                # Unique ID across the suite (kebab-case)
title: ""                  # Human-readable test description
tags: []                   # For --tags/--exclude-tags filtering
notes: []                  # Documentation strings
phase: request             # request, response, or both
engine: both               # cel, ai, or both
request:
  tool_name: ""            # MCP tool name (MCP tests)
  arguments: {}            # Tool arguments
  command: ""              # CLI command name (CLI tests)
  cli_arguments: []        # CLI command arguments
expectations:
  decision: deny           # allow, deny, or redact
  policies:
    - policy_name: ""      # Expected triggering policy
      decision: deny       # Expected policy decision
```
