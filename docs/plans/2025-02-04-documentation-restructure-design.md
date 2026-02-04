# Documentation Restructure Design

**Date:** 2025-02-04
**Status:** Approved
**Author:** Claude + Dan DeGroff

## Overview

This document outlines the plan to restructure the Maybe Don't documentation at maybedont.ai/docs. The goal is to create a progressive, use-case driven documentation experience that guides technical users (DevOps, Platform, Security engineers) from getting started through advanced configuration.

## Design Principles

1. **Progressive disclosure** - Start simple, allow readers to dig deeper
2. **Use-case driven** - Configuration examples tied to real scenarios
3. **Casual, friendly tone** - Non-corporate, sprinkle of humor, but technically precise
4. **Goal-oriented pages** - Each page has a clear purpose (get started, configure X, understand Y)
5. **Maintainable** - Use data providers for reusable content across pages

## Target Audience

Technical users: DevOps engineers, Platform engineers, Security engineers. Assume comfort with Docker, YAML, and command-line tools. Don't assume a specific AI coding agent.

## Site Map

```
/docs/
├── _index.md                        # What is Maybe Don't + architecture
├── get-started.md                   # Docker → minimal config → running
│
├── configuration/
│   ├── _index.md                    # Overview, file locations, precedence hierarchy
│   ├── downstream-servers.md        # MCP servers you proxy to
│   ├── server-modes.md              # stdio, http, sse
│   ├── logging.md                   # Application logs
│   └── reference.md                 # Full config table
│
├── policies/
│   ├── _index.md                    # Concepts, request vs response, truth table, blocking budget
│   ├── cel-policies.md              # CEL: request rules, response rules, syntax, schema
│   └── ai-policies.md               # AI: request rules, response rules, prompts, schema
│
├── audit-log/
│   ├── _index.md                    # What's captured, why it matters
│   ├── log-schema.md                # Entry format, fields, examples
│   └── siem-integration.md          # Future SIEM guidance (placeholder)
│
├── native-tools.md                  # Experimental tools (single page, sections per tool)
│
├── security.md                      # Posture, telemetry, firewall expectations, opt-in nature
│
├── examples/
│   ├── _index.md                    # Overview
│   ├── connecting-claude-code.md
│   ├── connecting-cursor.md
│   ├── connecting-openai-codex.md
│   ├── connecting-gemini.md
│   ├── connecting-openhands.md
│   ├── connecting-windsurf.md
│   ├── connecting-cody.md
│   └── connecting-aider.md
```

### Data Files

```
data/
└── mcp_examples.yaml                # Reusable MCP server definitions
```

## Content Outline

### `/docs/_index.md` - Overview
- Brief "What is Maybe Don't?" (2-3 sentences)
- Architecture diagram (already exists)
- Quick links to Get Started, Configuration, Policies

### `/docs/get-started.md` - Getting Started
- Prerequisites (Docker, AI API key for validation)
- Pull the image
- Create minimal config (one downstream MCP, validation in audit_only mode)
- Run it
- Verify it's working
- "Next steps" links

### `/docs/configuration/_index.md` - Configuration Overview
- Config file location (XDG paths)
- Precedence: CLI flags → env vars → config file
- Environment variable naming pattern (`MAYBE_DONT_*`)
- `${VAR}` substitution syntax
- Links to sub-pages

### `/docs/configuration/downstream-servers.md`
- What are downstream MCP servers
- Transport types (stdio, http, sse)
- Basic examples of each
- Pass-through authentication
- Headers configuration

### `/docs/configuration/server-modes.md`
- stdio mode (default, for direct process communication)
- http mode (for network access)
- sse mode (streaming)
- TLS configuration for sse
- Listen address configuration

### `/docs/configuration/logging.md`
- Log levels
- Output destinations (stderr, stdout, file)
- Log rotation settings
- Brief - points to audit-log for the important stuff

### `/docs/configuration/reference.md`
- Table: YAML path | Env var | Type | Default | Description
- Organized by section (server, validation, audit, etc.)
- Documents the full precedence hierarchy

### `/docs/policies/_index.md` - Policy Concepts
- Why policies exist (guardrails, audit, control)
- Two engines: CEL (deterministic) and AI (natural language)
- Request vs response validation
- Audit mode vs enforce mode
- Truth tables showing how policies combine:
  - CEL + AI results → final decision
  - Multiple policies of same type: any deny = deny
- Blocking budget concept (brief, not implementation details)
- Links to CEL and AI pages

### `/docs/policies/cel-policies.md`
- What CEL is (brief)
- Request policies: schema, examples
- Response policies: schema, examples
- Available fields/variables in expressions
- Action types (allow, deny, redact for response)

### `/docs/policies/ai-policies.md`
- How AI validation works
- AI provider configuration (OpenAI, Anthropic, compatible)
- Request policies: schema, prompt examples
- Response policies: schema, prompt examples
- Action types

### `/docs/audit-log/_index.md`
- What gets logged (tool calls, validation decisions)
- Why it matters (compliance, debugging, visibility)
- Configuration recap (path, filter)
- Future: SIEM integration intent

### `/docs/audit-log/log-schema.md`
- JSON schema of audit entries
- Field definitions
- Example entries with annotations
- Common patterns to look for

### `/docs/audit-log/siem-integration.md`
- Placeholder: "Coming soon" or brief guidance
- Mention intent to support SIEM ingestion

### `/docs/native-tools.md`
- Experimental disclaimer at top (subject to change, may be removed)
- Section per tool:
  - `maybedont__get_audit_log` - Access audit log entries
  - `maybedont__generate_audit_report` - AI-powered audit analysis
  - `maybedont__list_downstream_servers` - List configured servers
  - `maybedont__list_sessions` - List active sessions
  - `maybedont__discover_tools` - Trigger lazy discovery
- Each: description, parameters, example output

### `/docs/security.md`
- **What Maybe Don't is**: Opt-in guardrails for users who want safety
- **What it isn't**: NOT a security gateway that enforces routing - users can bypass it
- **Value proposition**: Control which MCPs are in use, audit all tool calls
- **Deployment expectations**: Expected behind a firewall
- **Authentication**: Pass-through only, no client-gateway auth yet
- **Telemetry**:
  - What data is sent (schema example)
  - How to disable (`MAYBEDONT_METRICS_OPTOUT`)
  - Privacy stance (anonymous, no PII)

### `/docs/examples/_index.md`
- Overview of examples
- Note: all examples use GitHub MCP as the downstream server
- Links to each agent page

### `/docs/examples/connecting-{agent}.md` (template for each agent)
- Prerequisites for that agent
- Agent-specific config/setup
- Maybe Don't config (using data provider values)
- Verification steps
- Common issues

**Agents to document:**
- Claude Code
- Cursor
- OpenAI Codex
- Gemini
- OpenHands
- Windsurf (Codeium)
- Cody (Sourcegraph)
- Aider

## Data Provider Pattern

To maintain consistency across agent examples, define MCP server configurations once:

```yaml
# data/mcp_examples.yaml
mcp_servers:
  - id: github
    name: "GitHub"
    description: "GitHub's official MCP server"
    type: http
    url: "https://api.githubcopilot.com/mcp/"
    auth:
      pass_through: true
      source_header: "X-GitHub-Token"
      target_header: "Authorization"
      format: "Bearer {value}"
```

Each agent example page uses these properties in its own config template, ensuring:
- Consistent MCP server details across all examples
- Easy to add new MCP examples (automatically appear in all agent pages)
- Single source of truth for URLs, auth patterns, etc.

## Policy Truth Tables

Include in `/docs/policies/_index.md`:

### CEL + AI Combined Result

| CEL Result | AI Result | Final Decision |
|------------|-----------|----------------|
| Allow | Allow | ✅ Allow |
| Allow | Deny | ❌ Deny |
| Deny | Allow | ❌ Deny |
| Deny | Deny | ❌ Deny |
| Not evaluated | Allow | ✅ Allow |
| Not evaluated | Deny | ❌ Deny |

### Multiple Policies of Same Type

When multiple CEL or AI policies exist:
- If **any** policy returns Deny → **Deny**
- If **all** policies return Allow → **Allow**

## Pages to Remove/Deprecate

- `/docs/installation.md` - Merge into get-started, mark as draft or delete
- `/docs/containers.md` - Merge into get-started, delete

## Implementation Notes

1. **Docker-only for now** - No binary download documentation
2. **Current version**: Reference `ghcr.io/maybedont/maybe-dont:v0.7.2` (update as needed)
3. **Writing style**: Casual, friendly, technically precise. Light humor where appropriate.
4. **Code examples**: Complete, runnable, with realistic values

## Next Steps

1. Create directory structure for new pages
2. Implement `data/mcp_examples.yaml` and supporting shortcode
3. Write pages in order:
   - `_index.md` and `get-started.md` first (the happy path)
   - Configuration section
   - Policies section
   - Audit log section
   - Security and native tools
   - Examples last (depend on data provider)
4. Remove/archive deprecated pages
5. Review and iterate
