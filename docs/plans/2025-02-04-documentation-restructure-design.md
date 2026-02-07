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
├── cli-proxy/
│   ├── _index.md                    # What it is, how it works, setup guide
│   └── rest-api.md                  # REST endpoint reference, request/response schemas
│
├── policies/
│   ├── _index.md                    # Concepts, request vs response, truth table, blocking budget
│   ├── cel-policies.md              # CEL: request rules, response rules, syntax, schema
│   └── ai-policies.md               # AI: request rules, response rules, prompts, schema
│
├── testing/
│   ├── _index.md                    # Philosophy: why test policies, thinking about test suites
│   ├── test-cases.md                # Test case schema, writing tests, examples
│   └── test-suites.md               # Suite config, model matrix, running tests, CI/CD
│
├── skills.md                        # Built-in AI skills: export, formats, using with agents
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
- Brief "What is Maybe Don't?" (2-3 sentences) — Frame as AI agent guardrails,
  not "MCP gateway". Mention both MCP and CLI as supported surfaces.
- Architecture diagram — Update to show both MCP and CLI proxy flows
- Quick links to Get Started, Configuration, Policies, CLI Proxy, Testing

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
- **Credential pass-through authentication:**
  - `auth.pass_through.enabled` and `headers` mapping
  - `CredentialMapping`: source_header, target_header, format template
  - Example: GitHub token pass-through (`X-GitHub-Token` → `Authorization: Bearer {value}`)
- Headers configuration (SSE and HTTP transport headers)

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
- **New sections to include:**
  - `cli_request_validation.*` — enabled, validate_commands, include_argument_values
  - `server.trusted_proxies` — IP/CIDR list for X-Forwarded-For
  - `server.session_timeout_minutes` — Session timeout (default: 30)
  - `*.rotation` — Log rotation settings (max_size_mb, max_backups, max_age_days, compress)
  - `validation.ai.parameters` — Provider-specific parameters (temperature, etc.)
  - `validation.ai.query_params` — URL query parameters
  - `validation.ai.headers` — Additional HTTP headers
  - Per-rule `mode: audit_only` — Audit without blocking

### `/docs/policies/_index.md` - Policy Concepts
- Why policies exist (guardrails, audit, control)
- **Policies apply to operations** — frame broadly as "operations" (MCP tool calls and
  CLI commands), not just "MCP tool calls"
- Two engines: CEL (deterministic) and AI (natural language)
- Request vs response validation
- Audit mode vs enforce mode (`mode: audit_only` per-engine or per-rule)
- Truth tables showing how policies combine:
  - CEL + AI results → final decision
  - Multiple policies of same type: any deny = deny
- Blocking budget concept (brief, not implementation details)
- Links to CEL and AI pages, plus cross-link to Testing section

### `/docs/policies/cel-policies.md`
- What CEL is (brief)
- Request policies: schema, examples
- **Dual expression support:** `mcp_expression` for MCP tool calls, `cli_expression` for CLI commands
  - A single rule can have both — the gateway evaluates the right one based on the request type
  - Legacy `expression` field is treated as `mcp_expression` for backwards compatibility
- Response policies: schema, examples
- Available fields/variables in expressions:
  - MCP context: `tool.name`, `tool.arguments`, `request.params.*`
  - CLI context: `cli.command`, `cli.arguments`, `cli.working_directory`, `cli.client_info.*`
  - Response context: `response.content`, `response.isError`, `response.meta`
- CEL function reference: `has()`, `get()`, `.contains()`, `.startsWith()`, `.endsWith()`,
  `.matches()`, `.size()`, `.exists()`, `.all()`, `in`
- Action types (allow, deny, redact for response)
- Common mistakes table

### `/docs/policies/ai-policies.md`
- How AI validation works
- AI provider configuration (OpenAI, Anthropic, openai_compatible)
- The `%s` prompt placeholder — replaced with a normalized operation object:
  - MCP: `{"type": "mcp_tool", "name": "...", "arguments": {...}}`
  - CLI: `{"type": "cli", "name": "...", "arguments": [...]}`
- Request policies: schema, prompt examples
- Response policies: schema, prompt examples
- Expected AI response format: `{"allowed": true/false, "message": "...", "redacted_content": "..."}`
- Action types (deny, redact for response)
- Prompt engineering best practices
- Common mistakes table

### `/docs/cli-proxy/_index.md` - CLI Proxy

Maybe Don't can validate CLI commands (not just MCP tool calls). AI agents run commands through
`maybe-dont cli -s <gateway-url> -- <command> [args...]` and the gateway evaluates the same
CEL and AI policies against the command before it executes.

- **What is the CLI proxy?** — Extends Maybe Don't beyond MCP to traditional CLI tools
  (gh, aws, kubectl, terraform, docker, etc.)
- **How it works** — Agent calls `maybe-dont cli`, gateway validates via REST, command
  executes on allow or is blocked on deny. Uses `syscall.Exec` for transparent process
  replacement (the command runs as if invoked directly).
- **Fail-open behavior** — If gateway is unreachable, commands execute with a warning to
  stderr. This is by design: Maybe Don't is opt-in guardrails, not a hard gate.
- **Setup guide:**
  1. Enable the REST endpoint in gateway config:
     ```yaml
     cli_request_validation:
       enabled: true
       validate_commands:
         - gh
         - aws
         - kubectl
     ```
  2. Gateway must be running in `http` or `sse` mode (not stdio) for the REST endpoint
  3. Run commands through the proxy:
     ```bash
     maybe-dont cli -s http://localhost:8080 -- gh pr create --title "Feature X"
     ```
- **CLI flags:**
  | Flag | Short | Default | Description |
  |------|-------|---------|-------------|
  | `--server` | `-s` | `http://localhost:8080` | Gateway base URL |
  | `--timeout` | — | `30s` | Validation request timeout |
  | `--dry-run` | — | `false` | Validate only, don't execute |
- **Environment variables:**
  - `MAYBE_DONT_CLIENT_ID` — Client identifier for audit attribution (e.g., user email)
- **The `--` separator** — Required to delineate proxy flags from the proxied command
- **Handling denials** — What the agent/user sees when a command is denied, and how to
  adjust or request approval
- **Audit integration** — CLI validations appear in the audit log alongside MCP tool calls,
  using a `cli` field instead of `tool`
- **Writing policies for CLI** — Brief cross-reference to policies section, noting:
  - CEL rules use `cli_expression` (not `mcp_expression`) for CLI commands
  - AI rules work the same way — the operation is normalized and injected into the prompt
  - A single policy can cover both MCP and CLI with both expression fields

### `/docs/cli-proxy/rest-api.md` - REST API Reference

The gateway exposes `POST /api/v1/cli/validate` when CLI validation is enabled.

- **Endpoint:** `POST /api/v1/cli/validate`
- **Request headers:**
  | Header | Required | Description |
  |--------|----------|-------------|
  | `Content-Type` | Yes | Must be `application/json` |
  | `X-Maybe-Dont-Client-ID` | No | Client identifier for audit |
  | `X-Request-ID` | No | Per-request tracing ID (generated if missing) |
- **Request body schema:**
  ```json
  {
    "command": "gh",
    "arguments": ["pr", "comment", "123", "--body", "Looks good!"],
    "working_directory": "/home/user/project",
    "client_info": {
      "hostname": "dev-workstation-1",
      "username": "developer",
      "os": "darwin",
      "arch": "arm64",
      "shell": "/bin/zsh",
      "cli_version": "1.0.0"
    }
  }
  ```
- **Response schemas:** Allow, deny, and no-validation-required examples
- **Error codes:**
  | Code | HTTP Status | Description |
  |------|-------------|-------------|
  | `cli_validation_disabled` | 400 | CLI validation not enabled |
  | `invalid_request` | 400 | Malformed request body |
  | `missing_command` | 400 | Required `command` field empty |
  | `invalid_content_type` | 400 | Wrong Content-Type header |
  | `policy_evaluation_error` | 500 | CEL or AI engine failed |
  | `internal_error` | 500 | Unexpected server error |
- **Note:** This endpoint is available on both HTTP and SSE transport types, independent
  of MCP configuration. It exists to allow non-MCP integrations.

### `/docs/testing/_index.md` - Policy Testing

This is the "how to think about it" page. Before diving into schemas, help readers
understand _why_ and _how_ to approach policy testing.

- **Why test policies?**
  - CEL rules are deterministic — you write them, they should work. But do they match
    what you _intend_? Test cases prove it.
  - AI rules are probabilistic — different models, different results. You need to know
    which models meet your accuracy bar before deploying.
  - Policies evolve. Tests prevent regressions when you add or modify rules.
- **The testing model:**
  - A **test suite** is a directory with a `suite.yaml` config and a `cases/` subdirectory
  - Each test case defines an operation (MCP tool call or CLI command) and the expected
    policy decision (allow, deny, or redact)
  - Tests run against the actual policy engine — same CEL and AI evaluation as production
- **Thinking about test suite design:**
  - **Cover both directions** — For each deny rule, write at least one test that triggers
    it _and_ one that should be allowed. This catches over-broad rules.
  - **Tag strategically** — Use tags like `cel`, `ai`, `request`, `response`, `github`,
    `credentials` so you can run targeted subsets
  - **Group by policy** — One file per policy (or related group) in `cases/`, with both
    positive and negative test cases in the same file
- **Model matrix testing:**
  - AI policies produce different results depending on the model
  - The test suite supports a `model_matrix` — define multiple models and test all of them
  - Use this to evaluate which models meet your accuracy threshold before choosing one
  - The `--matrix` flag runs all enabled models and produces a comparison table
  - Think of it like a benchmark: "Does gpt-5-mini meet 95% accuracy on our deny rules?
    How about claude-sonnet?"
- **Acceptance thresholds:**
  - `min_match_rate` sets the bar (0.0–1.0). A match rate of 1.0 means every test must pass.
  - `strict_policy_match` controls whether unexpected policy triggers count as failures
  - Tuning these lets you decide how strict your CI gate should be
- **Using skills to bootstrap tests** — Brief pointer to `/docs/skills.md` explaining
  that the CLI ships AI prompts specifically designed to help write test cases. You can
  export the `test-case` skill and use it with your AI agent to generate test cases from
  your policies.
- Cross-reference links to test-cases.md and test-suites.md

### `/docs/testing/test-cases.md` - Writing Test Cases

The schema reference and practical guide for authoring test cases.

- **Test case YAML schema** — Full annotated example:
  ```yaml
  - case_id: "cel-req-001"               # Required: unique across the suite
    title: "Block github__delete_file"    # Required: human-readable title
    tags: [cel, request, github]          # Optional: for filtering
    notes:                                # Optional: document the scenario
      - "Tests exact tool name match"
    phase: request                        # request | response | both (default: request)
    engine: cel                           # cel | ai | both (default: both)
    request:
      tool_name: "github__delete_file"    # MCP tool name
      arguments:                          # Tool arguments
        owner: "myorg"
        repo: "myrepo"
        path: "README.md"
    expectations:
      decision: deny                      # Required: allow | deny | redact
      policies:                           # Optional: specific policy expectations
        - policy_name: "deny-github-delete-file"
          decision: deny
  ```
- **Field reference table:**
  | Field | Required | Default | Description |
  |-------|----------|---------|-------------|
  | `case_id` | Yes | — | Unique identifier (kebab-case) |
  | `title` | Yes | — | Human-readable test description |
  | `tags` | No | `[]` | Tags for `--tags`/`--exclude-tags` filtering |
  | `notes` | No | `[]` | Documentation for the test case |
  | `phase` | No | `request` | `request`, `response`, or `both` |
  | `engine` | No | `both` | `cel`, `ai`, or `both` |
  | `request` | Yes* | — | Required when phase includes request |
  | `response` | Yes* | — | Required when phase includes response |
  | `expectations.decision` | Yes | — | `allow`, `deny`, or `redact` |
  | `expectations.policies` | No | `[]` | Expected triggering policies |
  | `expectations.redacted_content` | No | — | Expected content after redaction |
- **Concrete examples** — Include 3 annotated examples:
  1. CEL request deny (block a specific tool)
  2. AI request allow (safe operation passes)
  3. CEL response redact (sensitive content replaced)
- **Conventions:**
  - Case ID naming: `{engine}-{phase_prefix}-{number}` e.g., `cel-req-001`, `ai-resp-010`
  - Tag vocabulary: maintain a consistent set (`cel`, `ai`, `request`, `response`,
    `deny`, `allow`, `redact`, plus domain tags)
  - One file per logical group (all GitHub delete tests together, all credential tests
    together)
  - Always write both positive and negative cases for each policy
- **Copy-pasteable schemas** — Include clean YAML blocks (no comments) that a user can
  copy into an AI skill prompt as context. Include both the policy rule schema and the
  test case schema side by side.

### `/docs/testing/test-suites.md` - Test Suites & Running Tests

Suite configuration, the test runner CLI, model matrix, and CI/CD integration.

- **Suite directory structure:**
  ```
  my-test-suite/
  ├── suite.yaml                    # Suite configuration
  └── cases/
      ├── github-delete-tests.yaml  # Test cases grouped by policy
      ├── credential-tests.yaml
      └── response-redaction.yaml
  ```
- **Suite configuration (`suite.yaml`)** — Full annotated schema:
  ```yaml
  version: "v1"
  bundle_id: "my-policies"
  description: "Tests for production policy set"

  providers:
    openai:
      api_key: "${OPENAI_API_KEY}"
    anthropic:
      api_key: "${ANTHROPIC_API_KEY}"

  policies:
    cel_request_rules: "../cel_request_rules.yaml"
    ai_request_rules: "../ai_request_rules.yaml"
    cel_response_rules: "../cel_response_rules.yaml"
    ai_response_rules: "../ai_response_rules.yaml"

  acceptance:
    min_match_rate: 1.0
    strict_policy_match: true

  execution:
    timeout_ms: 30000
    retries: 2
    retry_delay_ms: 1000
    rate_limits:
      openai:
        requests_per_minute: 60
      anthropic:
        requests_per_minute: 30

  engines:
    cel:
      enabled: true
    ai:
      enabled: true
      model_matrix:
        - provider: openai
          model: gpt-5-mini
          enabled: true
        - provider: anthropic
          model: claude-sonnet-4-5-20250929
          enabled: true
  ```
- **Running tests** — CLI reference:
  ```bash
  # Basic run
  maybe-dont test policies --suite-dir ./suite

  # CEL only (fast, no API calls)
  maybe-dont test policies --suite-dir ./suite --engine cel

  # Single AI model
  maybe-dont test policies --suite-dir ./suite --model openai:gpt-5-mini

  # Full model matrix comparison
  maybe-dont test policies --suite-dir ./suite --matrix

  # Filter by tags
  maybe-dont test policies --suite-dir ./suite --tags "credentials,deny"

  # Validate suite without running (check for schema errors)
  maybe-dont test policies --suite-dir ./suite --validate-only
  ```
- **Incremental execution:**
  - `--incremental` — Skip unchanged tests, persist state
  - `--full` — Run all tests but persist state for next incremental run
  - `--retry-failed` — Re-run failed/errored tests even if cached
  - `--wait` — Run continuously until all tests complete (respects rate limits)
  - `--max-tests N` — Limit tests per invocation (exit code 5 if more remain)
  - State is persisted to `~/.local/state/maybe-dont/policy-test-state.json` by default
- **Output formats:**
  - Default: text to stdout with pass/fail/error/skip per test
  - `--output results.json` — Structured JSON with per-model breakdowns
  - `--format junit --output results.xml` — JUnit XML for CI integration
  - `--quiet` — Suppress stdout (useful with `--output`)
- **Exit codes:**
  | Code | Meaning |
  |------|---------|
  | 0 | All tests passed, thresholds met |
  | 1 | Test failure (thresholds not met) |
  | 2 | Schema validation error |
  | 3 | Policy integrity error (referenced policy doesn't exist) |
  | 4 | Path resolution error |
  | 5 | More tests remain (with `--max-tests`) |
- **CI/CD integration** — Brief guidance on running in CI:
  - Use `--engine cel` for fast feedback on every commit
  - Use `--matrix` in a nightly or weekly job for model accuracy tracking
  - Use `--format junit` for CI test reporting integration
  - Use `--incremental --max-tests N` for rate-limit-friendly CI runs
- **Model comparison** — Explain the comparison table the runner outputs when
  using `--matrix`, showing pass/fail/match% per model

### `/docs/skills.md` - Built-in AI Skills

Maybe Don't ships AI agent skills (prompt templates) that help users write policies
and test cases. This page documents how to extract and use them.

- **What are skills?** — Pre-written instructions embedded in the `maybe-dont` binary.
  They teach AI coding agents how to use Maybe Don't features: writing CEL policies,
  writing AI policies, writing test cases, and routing CLI commands through the proxy.
- **Available skills:**
  | Skill | Description |
  |-------|-------------|
  | `cli` | Teaches an AI agent to route CLI commands through the proxy |
  | `cel-policy` | Guide for authoring CEL deterministic policy rules |
  | `ai-policy` | Guide for authoring AI LLM-powered policy rules |
  | `test-case` | Guide for writing policy test cases and configuring test suites |
- **Listing skills:**
  ```bash
  maybe-dont skill list
  ```
- **Exporting skills** — Use `skill view` to output a skill in a format your agent understands:
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
- **Output formats:**
  | Format | Target | Description |
  |--------|--------|-------------|
  | `claude` | Claude Code | Full skill with markdown sections |
  | `cursor` | Cursor IDE | Concise `.cursorrules` format |
  | `copilot` | GitHub Copilot | Copilot instructions markdown |
  | `generic` | Any agent | General-purpose markdown |
- **Workflow: using skills to write policies and tests:**
  1. Export the `cel-policy` or `ai-policy` skill to your agent
  2. Describe the policy you want in natural language
  3. The agent uses the skill's schema reference and examples to produce valid YAML
  4. Export the `test-case` skill
  5. Ask the agent to generate test cases for the policy it just wrote
  6. Run `maybe-dont test policies` to validate
- **Schema reference for AI context** — Include clean, copy-pasteable YAML schemas
  (no inline comments) for:
  - CEL request rule schema
  - AI request rule schema
  - Test case schema
  - These are the same schemas embedded in the skills, surfaced here so users can
    copy-paste them into any AI chat (not just agent skills)

### `/docs/audit-log/_index.md`
- What gets logged (tool calls, validation decisions)
- Why it matters (compliance, debugging, visibility)
- Configuration recap (path, filter)
- Future: SIEM integration intent

### `/docs/audit-log/log-schema.md`
- JSON schema of audit entries
- Field definitions
- Example entries with annotations
- **Two entry types:** MCP tool call entries (with `tool` field) and CLI validation
  entries (with `cli` field containing `command`, `arguments`, `working_directory`,
  `client_info`)
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
2. **Current version**: Reference `ghcr.io/maybedont/maybe-dont:v1.0.0` (update as needed).
   Version 1.0.0 introduced XDG Base Directory support, self-contained binary, CLI proxy,
   policy test framework, and built-in skills.
3. **Writing style**: Casual, friendly, technically precise. Light humor where appropriate.
4. **Code examples**: Complete, runnable, with realistic values
5. **CLI proxy examples**: Use realistic commands (gh, aws, kubectl) with the full
   `maybe-dont cli -s ... -- <command>` syntax
6. **Test suite examples**: Show both simple (single CEL test) and realistic
   (multi-model matrix) configurations

### Future Download page
This is a great example of a clean download page:
 - https://zed.dev/download


## Next Steps

1. Create directory structure for new pages (including `cli-proxy/`, `testing/`, `skills.md`)
2. Implement `data/mcp_examples.yaml` and supporting shortcode
3. Write pages in order:
   - `_index.md` and `get-started.md` first (the happy path)
   - Configuration section
   - Policies section (updated with CLI expression docs)
   - CLI proxy section
   - Testing section
   - Skills page
   - Audit log section
   - Security and native tools
   - Examples last (depend on data provider)
4. Remove/archive deprecated pages
5. Review and iterate

## Pre-Launch Review

1. **Terminology review: stop calling it an "MCP gateway"** — Maybe Don't is not just an
   MCP gateway anymore. With CLI proxy, policy testing, and skills, MCP is one feature
   among several. Do a full pass across all docs and homepage copy to:
   - Replace "MCP gateway" / "MCP proxy" as the primary descriptor with something more
     general. Candidate terms to evaluate:
     - **"Guardrails for agentic AI"** — leads with the problem, positions broadly
     - **"Agentic AI observability"** — emphasizes audit/visibility angle
     - **"AI agent guardrails"** — focuses on the problem, not the transport
     - **"AI operations gateway"** — broader than MCP
     - **"AI safety layer"** — emphasizes the value prop
     - **"agent policy engine"** — technical but accurate
   - The product likely has two complementary identities worth leaning into:
     1. **Guardrails** — policy enforcement, deny/allow/redact (the active control story)
     2. **Observability** — audit log, visibility into what agents are doing (the passive insight story)
   - These two angles can coexist in copy. E.g., "Guardrails and observability for agentic AI"
     captures both halves. Individual pages can lean into whichever angle is more relevant.
   - Keep "MCP gateway" as a feature name when specifically discussing MCP proxying,
     but it should not be the product's primary identity
   - Each doc page should be able to stand on its own without requiring MCP context.
     The CLI proxy page shouldn't need to explain MCP. The testing page shouldn't assume
     MCP-only policies.
   - The homepage hero, architecture diagram, and intro copy all need updating to
     show Maybe Don't as a multi-surface tool (MCP tools + CLI commands, with room for more)
2. **Doc layout review for surface-independence** — Review the full page layout to ensure
   each product capability (MCP proxying, CLI proxying, policies, testing, skills, audit)
   can be discussed independently. Policies should be framed as "operation validation"
   not "MCP tool call validation". The architecture diagram should show both MCP and CLI
   flows. Consider whether `downstream-servers.md` should be renamed to something less
   MCP-specific, or if MCP-specific pages are clearly scoped.
3. **SEO review** — Review page names, titles, URLs, and meta descriptions for search optimization
4. **Redirect audit** — Diff against main branch to identify pages being moved/removed; set up Hugo aliases or redirects to avoid 404s damaging site reputation
