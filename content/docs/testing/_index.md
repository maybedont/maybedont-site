---
title: Testing
weight: 25
---

Policy testing is how you know your rules actually work. Before deploying policies, test them — especially AI policies, where results vary by model.

## Why Test Policies?

- **AI rules are probabilistic.** Different models produce different results. You need to know which models meet your accuracy bar before deploying. Testing is essential for AI policies.
- **CEL rules are deterministic** — they always produce the same result. But do they match what you *intend*? Test cases prove it and catch over-broad or under-broad rules.
- **Policies evolve.** Tests prevent regressions when you add or modify rules.

## Getting Started: Your First Test Suite

Start small. You can always expand later.

### 1. Create a Suite Directory

```
my-test-suite/
├── suite.yaml
└── cases/
    └── github-tests.yaml
```

### 2. Configure One AI Provider

Pick whichever vendor you're already using for AI validation:

```yaml
# suite.yaml
version: "v1"
bundle_id: "my-policies"
description: "Policy tests"

providers:
  openai:
    api_key: "${OPENAI_API_KEY}"

policies:
  cel_request_rules: "../cel_request_rules.yaml"
  ai_request_rules: "../ai_request_rules.yaml"

acceptance:
  min_match_rate: 1.0

engines:
  cel:
    enabled: true
  ai:
    enabled: true
    model_matrix:
      - provider: openai
        model: gpt-4o-mini
        enabled: true
```

### 3. Write a Few Test Cases

Start with 2-3 cases per policy — one that should be denied, one that should be allowed:

```yaml
# cases/github-tests.yaml
- case_id: "cel-req-001"
  title: "Block github__delete_file"
  tags: [cel, request, github]
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

- case_id: "cel-req-002"
  title: "Allow github__get_file"
  tags: [cel, request, github]
  phase: request
  engine: cel
  request:
    tool_name: "github__get_file"
    arguments:
      owner: "myorg"
      repo: "myrepo"
      path: "README.md"
  expectations:
    decision: allow
```

### 4. Run CEL Tests First

CEL tests are free and instant — run them first to catch configuration issues:

```bash
maybe-dont test policies --suite-dir ./my-test-suite --engine cel
```

### 5. Then Run AI Tests

```bash
maybe-dont test policies --suite-dir ./my-test-suite
```

### 6. Expand to Model Matrix Later

When you want to compare accuracy across models:

```bash
maybe-dont test policies --suite-dir ./my-test-suite --matrix
```

## The Testing Model

- A **test suite** is a directory with a `suite.yaml` config and a `cases/` subdirectory
- Each **test case** defines an operation (MCP tool call or CLI command) and the expected policy decision (allow, deny, or redact)
- Tests run against the **actual policy engine** — same CEL and AI evaluation as production

## Test Suite Design

### Cover Both Directions

For each deny rule, write at least one test that triggers it *and* one that should be allowed. This catches over-broad rules that block legitimate operations.

### Tag Strategically

Use tags like `cel`, `ai`, `request`, `response`, `github`, `credentials` so you can run targeted subsets:

```bash
maybe-dont test policies --suite-dir ./suite --tags "github,deny"
```

### Group by Policy

One file per policy (or related group) in `cases/`, with both positive and negative test cases in the same file:

```
cases/
├── github-delete-tests.yaml    # Tests for the deny-delete-file policy
├── credential-tests.yaml       # Tests for credential exposure rules
└── response-redaction.yaml     # Tests for response redaction
```

## Model Matrix Testing

AI policies produce different results depending on the model. The test suite supports a `model_matrix` — define multiple models and run all of them to compare accuracy.

```yaml
engines:
  ai:
    enabled: true
    model_matrix:
      - provider: openai
        model: gpt-4o-mini
        enabled: true
      - provider: openai
        model: gpt-4o
        enabled: true
      - provider: anthropic
        model: claude-sonnet-4-5-20250929
        enabled: true
```

Use the `--matrix` flag to run all enabled models and produce a comparison table:

```bash
maybe-dont test policies --suite-dir ./suite --matrix
```

Think of it like a benchmark: "Does `gpt-4o-mini` meet 95% accuracy on our deny rules? How about `claude-sonnet`?"

## Acceptance Thresholds

| Setting | Default | Description |
|---------|---------|-------------|
| `min_match_rate` | `1.0` | Minimum pass rate (0.0-1.0). 1.0 = every test must pass |
| `strict_policy_match` | `true` | Whether unexpected policy triggers count as failures |

Tune these to decide how strict your CI gate should be. For AI policies, a `min_match_rate` of 0.95 might be more realistic than 1.0.

## Using Skills to Bootstrap Tests

The `test-case` skill teaches your AI agent how to write test cases. Export it and ask your agent to generate cases from your policies:

```bash
maybe-dont skill view test-case --format claude > .claude/skills/test-case.md
```

The docs here teach you the best practices and mental model. The skills give your agent the schema knowledge to do the heavy lifting. See [Skills](/docs/agents/skills/) for more.

{{< cards >}}
  {{< card link="test-cases" title="Cases" icon="document-text" subtitle="Schema reference and examples" >}}
  {{< card link="test-suites" title="Suites" icon="collection" subtitle="Directory layout and suite.yaml config" >}}
  {{< card link="test-runner" title="Runner" icon="play" subtitle="CLI commands, output formats, and CI/CD" >}}
{{< /cards >}}
