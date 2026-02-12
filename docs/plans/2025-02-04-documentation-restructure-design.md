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
├── get-started.md                   # Install (Docker/Homebrew/binary) → first run → verify
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
│   ├── _index.md                    # Concepts, AI vs CEL comparison, truth table, blocking budget
│   ├── ai-policies.md               # AI: the primary policy engine, prompts, providers, schema
│   ├── cel-policies.md              # CEL: narrow deterministic rules, expressions, schema
│   └── writing-policies.md          # Guide: how to approach writing policies (AI-first, add CEL for specifics)
│
├── audit-log/                       # Elevated: audit logging is a key feature
│   ├── _index.md                    # What's captured, why it matters, configuration
│   ├── log-schema.md                # Entry format, fields, examples (MCP + CLI entries)
│   └── siem-integration.md          # Future SIEM guidance (placeholder)
│
├── testing/
│   ├── _index.md                    # Philosophy, getting started recipe, test suite design
│   ├── test-cases.md                # Test case schema, writing tests, examples
│   └── test-suites.md               # Suite config, model matrix, running tests, CI/CD
│
├── skills.md                        # Built-in AI skills: export, formats, using with agents
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

Present two installation paths, then converge on the same first-run experience:

- **Installation options:**
  - **Docker** (recommended for MCP server mode):
    `docker pull ghcr.io/maybedont/maybe-dont:v1.0.0`
  - **Homebrew** (recommended for CLI proxy / local use):
    `brew install maybedont/tap/maybe-dont`
  - **Binary download** (alternative): Direct download from the public
    `maybedont/releases` GitHub repository. Multi-platform: macOS, Linux, Windows
    (amd64/arm64).
- **First run experience:**
  - On first run, Maybe Don't writes the default config and rule files to the config
    directory. The user does NOT need to create a config from scratch.
  - Walk the user through modifying the defaults:
    1. Run `maybe-dont start` (or Docker equivalent) once — defaults are written
    2. Open `maybe-dont.yaml` and add one downstream MCP server
    3. Set your AI API key (env var or config)
    4. Restart
  - Everything starts in `audit_only` mode by default — observe before enforcing
- **Two paths after setup:**
  - "I want to proxy MCP tool calls" → link to downstream-servers.md
  - "I want to validate CLI commands" → link to cli-proxy/
- **Verify it's working** — check the audit log for entries
- **"Next steps" links**

### Author Notes: Initial Configuration

When writing the get-started and configuration pages, keep these behaviors in mind:

- **Config directory bootstrap:** Once the config directory is resolved, on startup the
  default configuration file and default rules will be written if the directory is
  read/write. This means a first-time user gets a working baseline automatically.
- **Read-only environments:** If the config directory is not writable (e.g., mounted
  read-only in a container), the user can use the `defaults` subcommand to extract the
  default config and rules to a writable location.
- **Source control:** Ideally the config directory — or at minimum the rules directories
  and files — should be placed under source control. This gives teams version history,
  code review, and rollback for policy changes.
- **Rules file organization:** Rules can be individual files or directories of files.
  This provides flexibility — a single `cel_request_rules.yaml` works for simple setups,
  while a `cel_request_rules/` directory with multiple files works for teams managing
  many rules across domains.
- **Start in audit-only mode:** The get-started guide should recommend that everything
  begin in `audit_only` mode. Let users observe what policies would do before enforcing
  them. This reduces the risk of accidentally blocking legitimate operations on day one.

### `/docs/configuration/_index.md` - Configuration Overview
- Config file location (XDG paths)
- Precedence: CLI flags → env vars → config file
- Environment variable naming pattern (`MAYBE_DONT_*`)
- `${VAR}` substitution syntax
- **Useful commands:**
  - `maybe-dont config info` — Shows resolved config and log directory paths.
    Useful for troubleshooting "where is my config?"
  - `maybe-dont defaults export -o <dir>` — Exports the embedded default config
    and rule files. Useful for read-only environments, upgrades, or getting a fresh
    baseline to compare against customized files.
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

### `/docs/configuration/logging.md` - Application Logging vs Audit Logging
- **Lead with the distinction:** Maybe Don't has two separate logging systems with
  different purposes, different configuration, and different output:
  - **Application logs** (`logger.*`) — Operational events: startup messages, errors,
    debug info. These are for operators troubleshooting the server itself.
  - **Audit logs** (`audit.*`) — Security-relevant record of every operation that passes
    through Maybe Don't: every MCP tool call, every CLI command validation, with the
    full policy decision, timing, and context. This is the compliance and visibility
    story. **Audit logging is a key feature of the product.**
- Application log configuration:
  - Log levels (debug, info, warn, error)
  - Output destinations (stderr, stdout, file)
  - Log rotation settings (max_size_mb, max_backups, max_age_days, compress)
- Clear pointer: "For the audit trail of policy decisions, see [Audit Log](/docs/audit-log/).
  That's where the important stuff is."

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
- **Two policy engines: AI and CEL**
  - **AI policies are the primary policy engine.** They evaluate operations using natural
    language prompts sent to an LLM. They can express nuanced, intent-based rules that
    would be impossible to write deterministically. AI policies are generic — a single
    AI policy works for both MCP tool calls and CLI commands because the engine
    normalizes the operation into a standard format before injecting it into the prompt.
  - **CEL policies are for narrow, explicit rules.** CEL (Common Expression Language)
    evaluates deterministic expressions — fast, free, and 100% predictable. Use CEL when
    you have a specific, concrete thing to block: a known tool name, a forbidden argument
    pattern, a string match. CEL's scope is intentionally narrow. Don't try to use CEL
    for nuanced judgment calls — that's what AI policies are for. Unlike AI policies,
    CEL requires separate expressions for MCP and CLI contexts (`mcp_expression` and
    `cli_expression`) because the data structures differ.
- **When to use which:**

  | | AI Policies | CEL Policies |
  |---|---|---|
  | **Best for** | Nuanced judgment, intent-based rules, broad categories | Specific known patterns, exact matches, explicit blocklists |
  | **Example** | "Block operations that could leak credentials" | "Block the `github__delete_file` tool" |
  | **Speed** | Seconds (LLM API call) | Microseconds (local eval) |
  | **Cost** | Per-API-call | Free |
  | **Determinism** | Probabilistic (temperature=0.0 helps) | 100% deterministic |
  | **MCP + CLI** | One policy covers both (generic) | Needs separate expressions per surface |
  | **Testability** | Needs model matrix testing | Always passes/fails the same way |

  **Recommendation:** Start with AI policies for broad coverage. Add CEL rules only for
  specific, concrete patterns you want to enforce deterministically (e.g., blocklisting
  a known-dangerous tool by name). Most users will get the majority of their value from
  AI policies.

- Request vs response validation
- Audit mode vs enforce mode (`mode: audit_only` per-engine or per-rule)
- Truth tables showing how policies combine:
  - CEL + AI results → final decision
  - Multiple policies of same type: any deny = deny
- Blocking budget concept (brief, not implementation details)
- Links to CEL and AI pages, plus cross-link to Testing section

### `/docs/policies/cel-policies.md`
- What CEL is (brief)
- **Scope framing:** CEL rules are for narrow, explicit pattern matching — blocking a
  specific tool by name, denying arguments that match a known dangerous pattern, etc.
  If you're trying to express something nuanced or intent-based, use an AI policy
  instead. CEL shines when you know exactly what you want to block.
- Request policies: schema, examples
- **Dual expression support:** `mcp_expression` for MCP tool calls, `cli_expression` for CLI commands
  - A single rule can have both — the gateway evaluates the right one based on the request type
  - Legacy `expression` field is treated as `mcp_expression` for backwards compatibility
  - **Unlike AI policies**, CEL requires separate expressions because the data structures
    for MCP and CLI contexts are different
- Response policies: schema, examples
- Available fields/variables in expressions:
  - MCP context: `tool.name`, `tool.arguments`, `request.params.*`
  - CLI context: `cli.command`, `cli.arguments`, `cli.working_directory`, `cli.client_info.*`
  - Response context: `response.content`, `response.isError`, `response.meta`
- CEL function reference: `has()`, `get()`, `.contains()`, `.startsWith()`, `.endsWith()`,
  `.matches()`, `.size()`, `.exists()`, `.all()`, `in`
- Action types (allow, deny, redact for response)
- Common mistakes table
- **Skills cross-reference:** End with a callout pointing users to the built-in
  `cel-policy` skill if they want their AI agent to help author CEL rules. Link to
  `/docs/skills.md` and briefly mention `maybe-dont skill view cel-policy`.

### `/docs/policies/ai-policies.md`
- How AI validation works
- **AI policies are generic across surfaces.** A single AI policy applies to both MCP
  tool calls and CLI commands. The engine normalizes the operation into a standard JSON
  object and appends it to the prompt automatically. The policy author writes only the
  detection logic — they don't need to know whether the operation came from MCP or CLI.
- AI provider configuration (OpenAI, Anthropic, openai_compatible)
  - The `openai_compatible` provider works with any OpenAI-compatible API: Google Gemini,
    Groq, LiteLLM, Azure OpenAI, vLLM, Ollama, OpenRouter, etc.
- **How prompts work:** The policy author writes the evaluation prompt. The engine
  automatically appends the operation context — the author does NOT include any
  placeholder. The engine appends:
  ```
  [Your policy prompt]

  Tool call:
  {"type": "mcp_tool", "name": "...", "arguments": {...}}
  ```
  or for CLI:
  ```
  [Your policy prompt]

  CLI command:
  {"type": "cli", "name": "...", "arguments": [...]}
  ```
  The label ("Tool call:" or "CLI command:") is context-appropriate. Do NOT include
  `%s` in prompts — the engine will reject it.
- **Temperature defaults to 0.0** for deterministic policy decisions. This can be
  overridden via `validation.ai.parameters.temperature` but 0.0 is recommended for
  consistent, repeatable policy evaluation.
- Request policies: schema, prompt examples
- Response policies: schema, prompt examples
- Expected AI response format: `{"allowed": true/false, "message": "...", "redacted_content": "..."}`
- Action types (deny, redact for response)
- Prompt engineering best practices
- Common mistakes table
- **Skills cross-reference:** End with a callout pointing users to the built-in
  `ai-policy` skill if they want their AI agent to help author AI rules. Link to
  `/docs/skills.md` and briefly mention `maybe-dont skill view ai-policy`.

### `/docs/policies/writing-policies.md` - Guide: Writing Policies

A practical guide on how to approach writing policies. Not a schema reference — that's
on the AI and CEL pages. This is the "how to think about it" guide.

- **Start with AI policies.** Most policy goals are best expressed in natural language.
  Write a prompt that describes what you want to allow or deny. AI policies are generic —
  they cover both MCP tool calls and CLI commands with a single rule.
- **Add CEL for specific, concrete patterns.** Once you have AI coverage, identify any
  specific operations you want to enforce deterministically — tool names to blocklist,
  argument patterns to reject, etc. These become CEL rules. CEL is a supplement to AI
  policies, not a replacement.
- **Pros and cons of each approach:**
  - AI: Flexible, intent-based, handles edge cases, but adds latency and API cost.
    Results are probabilistic — test with multiple models to find the right accuracy/cost
    tradeoff.
  - CEL: Instant, free, deterministic, but can only match explicit patterns. Can't
    reason about intent. Over-broad rules are easy to write accidentally.
- **Start in audit-only mode.** Write policies with `mode: audit_only` first. Review the
  audit log to see what would have been blocked. When confident, remove `audit_only` to
  start enforcing.
- **Test your policies.** Write test cases for every policy — both positive (should allow)
  and negative (should deny). See [Testing](/docs/testing/).
- **Cross-reference:** Point to the skills page for agent-assisted policy authoring.

### Author Notes: Writing Rules

When writing the policies pages, incorporate these behavioral details:

- **AI response rules can be slow:** The CLI or tool call response is not known ahead of
  time and may be large. AI response validation has to wait for the full response and then
  send it to the AI provider for evaluation. Document this latency tradeoff clearly.
- **Response rule `deny` semantics:** AI response rules that use `deny` should be used
  sparingly. A `deny` on a response is only meaningful if the request was read-only (e.g.,
  a GET or list command). In this context, `deny` means "don't show the response to the
  AI agent." Similarly, `redact` means "don't show parts of the response to the AI agent."
  If the CLI or tool call created, modified, or deleted something, a `deny` is misleading
  because the action already completed — we don't want to tell the AI agent it didn't
  happen. Make this distinction explicit in the docs.
- **Discrepancy check:** If during doc implementation you find that the code behavior
  doesn't match what's described here (e.g., `deny` on a mutating response actually does
  something different), flag it so the code can be corrected.

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
  - **AI policies work automatically** — AI policies are generic across MCP and CLI.
    The engine normalizes the operation and appends it to the prompt. A single AI policy
    covers both surfaces with no extra work.
  - **CEL rules need explicit expressions** — CEL rules use `cli_expression` for CLI
    commands and `mcp_expression` for MCP tool calls. A single CEL rule can have both
    fields — the engine evaluates the right one based on the request type.

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
  - AI rules are probabilistic — different models produce different results. You need to
    know which models meet your accuracy bar before deploying. Testing is essential for
    AI policies.
  - CEL rules are deterministic — they always produce the same result. But do they match
    what you _intend_? Test cases prove it and catch over-broad or under-broad rules.
  - Policies evolve. Tests prevent regressions when you add or modify rules.

- **Getting started: your first test suite**
  This is a concrete "Day 1" recipe. Start small:
  1. Create a suite directory with `suite.yaml` and a `cases/` folder
  2. Configure one AI provider — pick whichever vendor you're already using for AI
     validation (e.g., OpenAI or Anthropic)
  3. Start with one or two models from that vendor (e.g., `gpt-4o-mini` or
     `claude-sonnet-4-5-20250929`). Don't try to test everything at once.
  4. Write 2-3 test cases per policy: one that should be denied and one that should
     be allowed. This catches both false negatives and false positives.
  5. Run CEL tests first — they're free and instant:
     `maybe-dont test policies --suite-dir ./suite --engine cel`
  6. Then add AI tests once CEL passes:
     `maybe-dont test policies --suite-dir ./suite`
  7. Expand to `--matrix` with multiple models later, when you want to compare accuracy
     across models or find the most cost-effective option.

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
  your policies. Frame this as: the docs here teach you the best practices and mental
  model, the skills give your AI agent the schema knowledge to do the heavy lifting.
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
- **Skills cross-reference:** End with a callout pointing users to the built-in
  `test-case` skill if they want their AI agent to help write test cases. Link to
  `/docs/skills.md` and briefly mention `maybe-dont skill view test-case`. This
  complements the copy-pasteable schemas — the schemas are for manual use, the skill
  is for agent-assisted authoring.

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

  # Show cached results without re-running tests
  maybe-dont test policies --suite-dir ./suite --summary-only
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

### `/docs/audit-log/_index.md` - Audit Logging

Audit logging is a core feature of Maybe Don't — not an afterthought. This page should
make that clear from the first paragraph.

- **What is the audit log?** Every operation that passes through Maybe Don't — every MCP
  tool call, every CLI command validation — is recorded with the full policy decision,
  timing, client context, and AI provider metadata. This is a complete, tamper-evident
  record of what AI agents did and what Maybe Don't decided about it.
- **Why it matters:**
  - **Compliance** — Prove what your AI agents did (and didn't do)
  - **Visibility** — See what tools agents are calling, how often, with what arguments
  - **Debugging** — Understand why a policy allowed or denied an operation
  - **Incident response** — Trace back from a bad outcome to the exact tool call
- **Configuration:**
  - `audit.path` — File path, `stdout`, or `stderr` (default: `maybedont-audit.log`)
  - `audit.filter` — `all` (default) or `deny_only` (reduces volume for high-traffic
    deployments by only logging denied operations)
  - `audit.rotation` — Log rotation settings (max_size_mb, max_backups, max_age_days,
    compress)
- **Not the same as application logs.** Application logs (`logger.*`) record server
  operational events (startup, errors). Audit logs record security-relevant policy
  decisions. They are configured separately and serve different audiences. See
  [Application Logging](/docs/configuration/logging/) for the operational side.
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
- **Author note: These are all experimental. TBD if we want to document them at all.**
  They are primarily for internal use and proof-of-concept testing, and will likely be
  removed at some point in the future. If we do document them, keep it minimal.
- **Audit tool limitation:** The `maybedont__get_audit_log` and
  `maybedont__generate_audit_report` tools only work when the audit log is configured to
  write to a file. If the audit log destination is set to `stderr` or `stdout`, these
  tools will not function. Document this prerequisite prominently.
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

1. **Progressive disclosure for configuration** - The config reference page
   (`reference.md`) should document everything, but individual feature pages and the
   get-started guide should only reference the minimal config necessary to get going.
   Don't front-load the full config surface on readers who just want to set up one thing.
   Each feature page should show only the config keys relevant to that feature.
2. **Flag spec-vs-code discrepancies** - During doc implementation, if you find something
   specifically described in this spec that doesn't match the actual code behavior, flag
   it rather than silently documenting the code behavior. The spec may be the intended
   behavior and the code may need correction.
3. **Distribution channels** — Document all three:
   - **Docker**: `ghcr.io/maybedont/maybe-dont` — recommended for MCP server mode
   - **Homebrew**: `brew install maybedont/tap/maybe-dont` — recommended for CLI proxy
     and local development
   - **Binary download**: Direct download from the public `maybedont/releases` GitHub
     repository. Multi-platform: macOS (amd64/arm64), Linux (amd64/arm64), Windows
     (amd64/arm64). _(Note: public download URL to be finalized before launch)_
   - For MCP proxying, lean into Docker. For CLI proxy (which runs on the developer's
     local machine), Homebrew or direct binary download makes more sense.
4. **Current version**: Reference `ghcr.io/maybedont/maybe-dont:v1.0.0` (update as needed).
   Version 1.0.0 introduced XDG Base Directory support, self-contained binary, CLI proxy,
   policy test framework, and built-in skills.
5. **Writing style**: Casual, friendly, technically precise. Light humor where appropriate.
6. **Code examples**: Complete, runnable, with realistic values
7. **CLI proxy examples**: Use realistic commands (gh, aws, kubectl) with the full
   `maybe-dont cli -s ... -- <command>` syntax
8. **Test suite examples**: Show both simple (single CEL test) and realistic
   (multi-model matrix) configurations

### Future Download page
This is a great example of a clean download page:
 - https://zed.dev/download


## Next Steps

1. Create directory structure for new pages (including `cli-proxy/`, `testing/`, `skills.md`)
2. Implement `data/mcp_examples.yaml` and supporting shortcode
3. Write pages in order:
   - `_index.md` and `get-started.md` first (the happy path, both Docker and binary)
   - Configuration section (including logging vs audit logging distinction)
   - Policies section (AI-first framing, CEL as supplement, writing guide)
   - Audit log section (key feature — elevate early)
   - CLI proxy section
   - Testing section (include Day 1 getting started recipe)
   - Skills page
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
5. **Full site copy review** — Do a sweep of the entire site (docs, homepage, landing
   pages, footers, meta descriptions) for consistent messaging and tone. Specifically:
   - Hunt for stale references to "MCP Gateway", "MCP Security Gateway", or any
     MCP-first framing that hasn't been updated to the broader product identity
   - Ensure the tone is consistent: casual, friendly, technically precise, light humor
     where appropriate — not corporate, not salesy, not overly formal
   - Check that the persona is consistent across pages — the site should read like it
     was written by one voice, not stitched together from different drafts
   - Look for copy that contradicts itself across pages (e.g., one page says "security
     gateway" while another says "guardrails") and unify the language
   - **Help find the right language.** "MCP gateway" and "CLI proxy" are features, not
     the product story. We need language that describes the problem we're solving and how
     we solve it at a higher level — independent of the specific transports (MCP, CLI, and
     whatever comes next). Research and propose vocabulary that captures what Maybe Don't
     actually does: it sits between AI agents and the things they interact with, providing
     visibility and control over agent actions. Think about how other categories describe
     this kind of layer (e.g., firewalls don't call themselves "TCP proxies", API gateways
     don't lead with "HTTP reverse proxy"). We want the same kind of abstraction —
     language that stays true even as new integration surfaces are added. Present options
     with tradeoffs so we can settle on a consistent vocabulary before launch.
6. **About page / Our Team** — The current about page (`/about/`) uses a terminal-styled
   layout with a brief mission statement, a "what we're building" paragraph, and a
   contact CTA. It works as a company intro, but we need to decide whether to:
   - **Option A:** Expand the existing `/about/` page to include a team section below the
     current content, keeping everything on one page.
   - **Option B:** Keep `/about/` as the company story and add a separate "Our Team" page
     under the existing "Company" footer column (which already links to About and Contact).
   - Either way, the team section should present the people behind Maybe Don't with a
     leadership-focused design: headshots, name + title, and short bios that emphasize
     relevant experience and credibility.
   - **Style reference:** [groq.com/about-groq](https://groq.com/about-groq) — clean,
     minimalist layout with generous whitespace. Leadership profiles with professional
     headshots, name/title headers, and expandable bios. Credentials-forward tone that
     establishes trust through team experience. We don't need to copy it exactly, but the
     structural pattern (gallery of profiles, consistent presentation, experience-driven
     narrative) is a good model. Adapt it to our voice — casual and friendly rather than
     corporate, but still credibility-establishing.

---

## Completed — Doc Restructure (PR #64, Feb 2025)

Work from the `degroff/messaging_round6` branch, squash-merged as PR #64.

- Sidebar: arrow rotation fix, nav click behavior (expand + navigate), FOUC prevention
- Download widget: restyled (no border, platform detection label, sha256 under buttons)
- Documentation restructure: new pages, shortcodes, sidebar improvements
- Testing section: split into Cases + Suites & Running

## Completed — Version Centralization (PR #66, Feb 2025)

- Single source of truth for version in `data/product.yaml`
- Shortcodes (`version`, `codeblock`, `docker-run`, `list-files-for-version`) replace all hardcoded version strings
- Bump to v1.1.0

## Completed — Doc Next Phase 1 (`degroff/doc_next_1`, Feb 2025)

- **Testing 3-way split**: "Suites & Running" split into separate Suites and Runner pages.
  Runner page covers CLI commands, incremental execution, output formats, exit codes, CI/CD.
  Cards and llms.txt updated. Cross-refs between pages.
- **Packages tab copy**: Added "Recommended for CLI gateway mode" guidance matching
  Docker/Homebrew tabs.
- **Color palette refresh**: Prose links already blue (confirmed). Dark mode bold brightened
  (`#dedad6` → `#e8e4e0`). Sidebar hover gets subtle blue tint in both light and dark mode.
  Tab indicators, CTA buttons, and callouts confirmed already using blue family — no changes needed.
- **Git worktree convention**: Added `.worktrees/` to `.gitignore` and documented convention
  in CLAUDE.md.

## Completed — Doc Next Phase 2 (`degroff/doc_next_1`, Feb 2025)

- **Config reference improvements**:
  - Improved `trusted_proxies` description (security model, rightmost untrusted IP, example CIDRs)
  - Improved `include_argument_values` description (privacy implications) and moved from
    `cli_request_validation` to `audit` section (source code fix pending)
  - Added missing `validation.ai` fields: `parameters`, `query_params`, `headers`
  - Added missing `native_tools.audit_report.system_prompt`
  - Removed deprecated `server.sse.tls` section (SSE is deprecated in MCP spec)
  - Added SSE deprecation notes to `server.type` options and downstream server headers
  - Marked Native Tools section as experimental (subject to change or removal)
- **Packages tab spacing**: Added `margin-top: 1rem` to `.download-detected` for visual gap
  between recommendation copy and download widget
- **SEO alias removal**: Removed 3 Hugo aliases from `get-started.md` (`/docs/containers/`,
  `/docs/download/`, `/docs/installation/`) that generated meta-refresh redirect pages
  flagged by Google Search Console
- **Investigation: suite.yaml path validation** — Found security asymmetry: config file paths
  use strict `ValidateRelativePath()` (rejects `../`, absolute paths, hidden files) but
  suite.yaml `resolvePath()` has no validation. Flagged for product team review.

## Next Phase — SEO & Indexing

Google Search Console reported issues. Analysis and fixes:

### Already fixed (in Phase 2)
- Removed Hugo aliases that generated meta-refresh redirect pages

### Remaining redirect pages (no action needed)
- `www.` → non-www and `http://` → `https://` are GitHub Pages 301 redirects — Google
  handles these properly, they resolve over time

### Duplicate without user-selected canonical (2 pages)
- `https://www.maybedont.ai/terms/` and `https://www.maybedont.ai/pricing/`
- These are www variants; canonical tags point to non-www. Should self-resolve.

### Crawled - currently not indexed (10 pages)
- All binary downloads and checksums — correct behavior, not indexable content.

### TODO
1. **robots.txt** — Hugo template to disallow binary downloads, reference sitemap
2. **llms.txt** — Review/improve existing `layouts/_default/home.llms.txt`
3. **sitemap.xml** — Verify Hugo-generated sitemap uses canonical URLs, excludes utility pages

## Next Phase — UI Polish & Remaining Items

Items deferred from the doc restructure sessions. Ready to pick up in a future session.

1. **Light mode accessibility**
   - Pure white background is harsh — explore off-white or warm-white
   - Ensure WCAG AA contrast ratios maintained

2. **Docs hero page**
   - Improve impact of `content/docs/_index.md`
   - Rethink architecture graphic (consider Mermaid)
   - Sharpen value prop copy

3. **Team page**
   - LinkedIn photos, Kendal listed first
   - Skeleton placeholders for future hires
   - Fun, personable tone (not corporate)

4. **Slack color palette + "Random" docs section**
   - Generate Slack sidebar/accent colors matching brand
   - Add fun non-technical section to docs
