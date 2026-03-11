---
title: CLI Gateway
linkTitle: CLI
weight: 8
---

The CLI gateway extends policy enforcement beyond MCP to traditional command-line tools: `gh`, `aws`, `kubectl`, `terraform`, `docker`, and anything else an AI agent might run. The same policy engine that evaluates MCP tool calls also evaluates CLI commands — one set of rules, two surfaces.

## How It Works

There are two ways to enforce policies on CLI commands. Both use the same gateway, the same policies, and the same audit log — they differ in how the command reaches the gateway.

- [**Hooks**](#hooks) — the agent's hook script sends the command to the gateway's intercept endpoint before execution. Enforcement is deterministic — the agent cannot bypass the decision.
- [**Skills**](#skills) — the agent runs commands through the `maybe-dont cli` subcommand, which validates before executing. Enforcement depends on the LLM choosing to use the skill.

## Hooks

Hooks are the recommended approach for CLI enforcement. Most major agents support them — Claude Code, Cursor, Gemini CLI, Cline, and GitHub Copilot — and because the hook runs before the command executes, policy decisions are enforced deterministically.

<div class="solutions-hero-graphic" style="margin: 1.5rem 0;">
<svg viewBox="0 0 760 160" xmlns="http://www.w3.org/2000/svg" class="solutions-flow-svg">
  <rect x="10" y="50" width="120" height="50" rx="6" class="flow-box flow-agent"/>
  <text x="70" y="80" text-anchor="middle" class="flow-label">AI Agent</text>
  <line x1="140" y1="75" x2="185" y2="75" class="flow-line"/>
  <polygon points="180,70 190,75 180,80" class="flow-dot" style="fill: currentColor; opacity: 0.3;"/>
  <rect x="195" y="50" width="130" height="50" rx="6" class="flow-box flow-agent"/>
  <text x="260" y="72" text-anchor="middle" class="flow-label" style="font-family: ui-monospace, monospace; font-size: 12px;">Hook Script</text>
  <text x="260" y="90" text-anchor="middle" class="flow-label flow-label-sm">intercept endpoint</text>
  <line x1="335" y1="75" x2="375" y2="75" class="flow-line"/>
  <polygon points="370,70 380,75 370,80" class="flow-dot" style="fill: currentColor; opacity: 0.3;"/>
  <rect x="385" y="30" width="160" height="90" rx="10" class="flow-box flow-shield"/>
  <text x="465" y="65" text-anchor="middle" class="flow-label flow-label-bold">Gateway</text>
  <text x="465" y="88" text-anchor="middle" class="flow-label flow-label-sm">Policy Engine + Audit</text>
  <line x1="555" y1="60" x2="610" y2="40" class="flow-line flow-line-allow"/>
  <circle cx="584" cy="49" r="5" class="flow-dot flow-dot-allow"/>
  <line x1="555" y1="90" x2="610" y2="120" class="flow-line flow-line-deny"/>
  <circle cx="584" cy="106" r="5" class="flow-dot flow-dot-deny"/>
  <rect x="620" y="15" width="130" height="50" rx="6" class="flow-box flow-tool"/>
  <text x="685" y="45" text-anchor="middle" class="flow-label">Command Runs</text>
  <rect x="620" y="95" width="130" height="50" rx="6" class="flow-box flow-tool-deny"/>
  <text x="685" y="125" text-anchor="middle" class="flow-label flow-label-deny">Blocked</text>
</svg>
</div>

1. The agent is about to execute a CLI command (e.g., `gh pr create`)
2. The agent fires a pre-tool hook event
3. The hook script sends the command to the gateway's `POST /api/v1/intercept` endpoint
4. The gateway evaluates CEL and AI policies against the command
5. **Allow** — the hook exits successfully and the agent executes the command
6. **Deny** — the hook returns a deny response and the agent sees the denial message

Because the hook runs before the command executes, the decision is enforced deterministically — the agent cannot bypass it.

### Filtering

Which tool calls trigger the hook depends on your agent configuration. Most agents support a `matcher` field that filters by tool name using regex — for example, Claude Code defaults to `"Bash"` to match only CLI tools. See the [agent-specific hook guides](/docs/agents/hooks/) for matcher syntax and examples.

### Setup

See the [Hooks documentation](/docs/agents/hooks/) for setup instructions, including how to export hook scripts and configure your agent.

## Skills

For agents that don't support hooks, the `maybe-dont cli` subcommand routes commands through the gateway for validation. The agent calls `maybe-dont cli` instead of calling the command directly — a skill teaches the agent to use it. Because enforcement depends on the LLM choosing to invoke the skill, hooks are preferred when available.

<div class="solutions-hero-graphic" style="margin: 1.5rem 0;">
<svg viewBox="0 0 760 160" xmlns="http://www.w3.org/2000/svg" class="solutions-flow-svg">
  <rect x="10" y="50" width="120" height="50" rx="6" class="flow-box flow-agent"/>
  <text x="70" y="80" text-anchor="middle" class="flow-label">AI Agent</text>
  <line x1="140" y1="75" x2="185" y2="75" class="flow-line"/>
  <polygon points="180,70 190,75 180,80" class="flow-dot" style="fill: currentColor; opacity: 0.3;"/>
  <rect x="195" y="50" width="130" height="50" rx="6" class="flow-box flow-agent"/>
  <text x="260" y="72" text-anchor="middle" class="flow-label" style="font-family: ui-monospace, monospace; font-size: 12px;">maybe-dont cli</text>
  <text x="260" y="90" text-anchor="middle" class="flow-label flow-label-sm">HTTP to gateway</text>
  <line x1="335" y1="75" x2="375" y2="75" class="flow-line"/>
  <polygon points="370,70 380,75 370,80" class="flow-dot" style="fill: currentColor; opacity: 0.3;"/>
  <rect x="385" y="30" width="160" height="90" rx="10" class="flow-box flow-shield"/>
  <text x="465" y="65" text-anchor="middle" class="flow-label flow-label-bold">Gateway</text>
  <text x="465" y="88" text-anchor="middle" class="flow-label flow-label-sm">Policy Engine + Audit</text>
  <line x1="555" y1="60" x2="610" y2="40" class="flow-line flow-line-allow"/>
  <circle cx="584" cy="49" r="5" class="flow-dot flow-dot-allow"/>
  <line x1="555" y1="90" x2="610" y2="120" class="flow-line flow-line-deny"/>
  <circle cx="584" cy="106" r="5" class="flow-dot flow-dot-deny"/>
  <rect x="620" y="15" width="130" height="50" rx="6" class="flow-box flow-tool"/>
  <text x="685" y="45" text-anchor="middle" class="flow-label">Command Runs</text>
  <rect x="620" y="95" width="130" height="50" rx="6" class="flow-box flow-tool-deny"/>
  <text x="685" y="125" text-anchor="middle" class="flow-label flow-label-deny">Blocked</text>
</svg>
</div>

1. The agent calls `maybe-dont cli -s <gateway-url> -- <command> [args...]`
2. Everything after `--` is the command to validate — similar to how `sudo` separates its own flags from the command it runs
3. The CLI sends the command to the gateway's REST endpoint for validation
4. The gateway evaluates CEL and AI policies against the command
5. **Allow** — the command executes via `syscall.Exec`, which replaces the `maybe-dont` process with the target command. The command runs exactly as if invoked directly — same PID, same environment, same stdio
6. **Deny** — the command is blocked and the agent sees the denial message

### Setup

#### 1. Enable CLI Validation on the Gateway

Add the `cli_request_validation` section to your `maybe-dont.yaml`:

```yaml
cli_request_validation:
  enabled: true
  validate_commands:
    - gh
    - aws
    - kubectl
    - terraform
    - docker
```

The `validate_commands` list specifies which commands the gateway will validate. Commands not on this list pass through without evaluation.

#### 2. Ensure the Gateway Is Accessible

The CLI gateway communicates with the server over HTTP. The server must be running in `http` or `sse` mode (not `stdio`) for the REST endpoint to be available.

```yaml
server:
  type: http
  listen_addr: ":8080"
```

#### 3. Run Commands Through the Proxy

```bash
maybe-dont cli -s http://localhost:8080 -- gh pr create --title "Feature X"
```

The `--` separator is required. Everything before it is flags for `maybe-dont cli` itself; everything after it is the command to validate and run.

### CLI Flags

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--server` | `-s` | `http://localhost:8080` | Gateway base URL |
| `--timeout` | | `30s` | Validation request timeout |
| `--dry-run` | | `false` | Validate only, don't execute |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MAYBE_DONT_CLIENT_ID` | Client identifier for audit attribution (e.g., user email or agent name) |

### Examples

```bash
# Validate and run a GitHub CLI command
maybe-dont cli -s http://localhost:8080 -- gh pr create --title "Feature X"

# Validate and run a kubectl command
maybe-dont cli -s http://localhost:8080 -- kubectl delete pod my-pod

# Dry run — validate without executing
maybe-dont cli -s http://localhost:8080 --dry-run -- aws s3 rm s3://bucket/key

# Custom timeout
maybe-dont cli -s http://localhost:8080 --timeout 10s -- terraform apply
```

### Handling Denials

Use `--dry-run` to test what a denial looks like without executing anything:

```bash
maybe-dont cli -s http://localhost:8080 --dry-run -- rm -rf /tmp/something
```

```
Error: Command denied by policy
  Request ID: 56ae55a7686cf693d2d9eef34b33240c
  Reason: Recursive rm operations are not permitted
  Policy: deny-destructive-rm (cel) - Recursive rm operations are not permitted
```

The command does not execute. The output includes the request ID (for audit log correlation), the reason, and the policy that triggered the denial. The agent can adjust its approach or request a policy exception.

## Fail-Open Behavior

If the gateway is unreachable, both hooks and `maybe-dont cli` allow the command with a warning to stderr. This is by design — the gateway is opt-in guardrails, not a hard gate. You're choosing to add safety, not creating a single point of failure.

## Audit Integration

CLI validations appear in the [audit log](/docs/audit-log/) alongside MCP tool calls. CLI entries use a `cli` field instead of `tool`:

```json
{
  "timestamp": "2025-02-04T10:30:00Z",
  "type": "cli_request",
  "cli": {
    "command": "gh",
    "arguments": ["pr", "create", "--title", "Feature X"],
    "working_directory": "/home/user/project"
  },
  "decision": "allow",
  "duration_ms": 1250
}
```

## Writing Policies for CLI

- **AI policies work automatically.** AI policies are generic — the engine normalizes the operation and appends it to the prompt. A single AI policy covers both MCP and CLI with no extra work.

- **CEL rules need explicit expressions.** CEL rules use `cli_expression` for CLI commands and `mcp_expression` for MCP tool calls. A single CEL rule can have both fields — the engine evaluates the right one based on the request type.

See [Policies](/docs/policies/) for the full guide, and [CEL Policies](/docs/policies/cel-policies/) for the CLI-specific variables available in CEL expressions.

{{< cards >}}
  {{< card link="/docs/api/cli-validate" title="CLI Validate API" icon="document-text" subtitle="Endpoint details, schemas, and error codes" >}}
{{< /cards >}}
