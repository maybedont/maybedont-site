# Agents Documentation Section — Design Spec

## Goal

Consolidate all agent integration documentation into a top-level "Agents" section. Document the new hooks feature, reposition skills as a policy-authoring tool, and move the existing MCP connection guides out of `mcp-gateway/examples/` into the new section. Each integration type (MCP, Hooks, Skills) gets its own subsection with per-agent pages where applicable.

## Sidebar Structure

```
Agents (weight 9, _index.md)
├── MCP (_index.md, weight 1) — moved from mcp-gateway/examples/
│   ├── Claude Code (weight 1)
│   ├── Cursor (weight 2)
│   ├── Gemini Code Assist (weight 3)
│   ├── GitHub Copilot (weight 4)
│   ├── OpenAI Codex (weight 5)
│   ├── OpenHands (weight 6)
│   └── Cody (weight 7)
├── Hooks (_index.md, weight 2) — NEW
│   ├── Claude Code (weight 1)
│   ├── Cursor (weight 2)
│   ├── Gemini CLI (weight 3)
│   ├── Cline (weight 4)
│   └── GitHub Copilot (weight 5)
└── Skills (skills.md, weight 3) — moved from top-level docs/skills.md
```

Weight 9 places Agents between CLI Gateway (weight 8) and API (weight 10) in the main sidebar, inside the "Gateways" separator group (weight 4–10). This is intentional — Agents is an integration topic and belongs alongside the other gateway/integration docs, not in the Reference section.

## File Moves

| From | To | Notes |
|------|----|-------|
| `content/docs/skills.md` | `content/docs/agents/skills.md` | Add Hugo alias for `/docs/skills/` |
| `content/docs/mcp-gateway/examples/_index.md` | `content/docs/agents/mcp/_index.md` | Rewrite intro; add Hugo alias for `/docs/mcp-gateway/examples/` |
| `content/docs/mcp-gateway/examples/connecting-claude-code.md` | `content/docs/agents/mcp/claude-code.md` | Add alias for old URL |
| `content/docs/mcp-gateway/examples/connecting-cursor.md` | `content/docs/agents/mcp/cursor.md` | Add alias for old URL |
| `content/docs/mcp-gateway/examples/connecting-gemini.md` | `content/docs/agents/mcp/gemini-code-assist.md` | Add alias for old URL |
| `content/docs/mcp-gateway/examples/connecting-github-copilot.md` | `content/docs/agents/mcp/github-copilot.md` | Add alias for old URL |
| `content/docs/mcp-gateway/examples/connecting-openai-codex.md` | `content/docs/agents/mcp/openai-codex.md` | Add alias for old URL |
| `content/docs/mcp-gateway/examples/connecting-openhands.md` | `content/docs/agents/mcp/openhands.md` | Add alias for old URL |
| `content/docs/mcp-gateway/examples/connecting-cody.md` | `content/docs/agents/mcp/cody.md` | Add alias for old URL |

After moving, delete the `content/docs/mcp-gateway/examples/` directory entirely.

## Pages

### 1. Agents Index (`content/docs/agents/_index.md`, weight 9)

Brief intro: the gateway supports multiple integration points for AI coding agents. This section covers how to connect your agent.

**"Choosing an Integration" section** with a comparison table:

| Approach | MCP Tools | CLI Tools | Notes |
|----------|-----------|-----------|-------|
| MCP Gateway + Hooks (recommended) | MCP gateway proxy | Hooks via intercept endpoint | Best coverage. MCP gateway intercepts responses before they reach the agent. Hooks enforce CLI commands deterministically. |
| Hooks only | Hooks via intercept endpoint | Hooks via intercept endpoint | Simpler setup — no proxy required. Works when agent supports hooks for both MCP and CLI tool calls. Agent must honor deny decisions. |
| MCP Gateway only | MCP gateway proxy | CLI skill or `maybe-dont cli` | For agents without hook support. CLI enforcement relies on LLM compliance. |

**Callout** explaining the MCP gateway advantage for response-phase enforcement: responses are intercepted at the proxy layer before reaching the agent, providing stronger enforcement than hooks where the agent receives the response and must honor the deny decision.

**Navigation cards** linking to the three subsections (MCP, Hooks, Skills).

### 2. MCP Index (`content/docs/agents/mcp/_index.md`, weight 1)

Rewritten from the old `mcp-gateway/examples/_index.md`. Same content (prerequisites, common pattern, gateway configuration) but updated title to "MCP" and intro reframed to clarify this is one integration path. Links back to the [MCP Gateway](/docs/mcp-gateway/) docs for gateway-level documentation.

Per-agent subpages move with front matter changes (new weights, aliases for old URLs, remove `connecting-` prefix from filenames) and internal body link updates (e.g., prerequisite links from `/docs/mcp-gateway/examples/` to `/docs/agents/mcp/`).

### 3. Hooks Index (`content/docs/agents/hooks/_index.md`, weight 2)

Sections:

- **What Are Hooks?** — Scripts that integrate AI agents with the Maybe Don't gateway via the `POST /api/v1/intercept` endpoint. When an agent is about to use a tool (pre-tool) or has finished using one (post-tool), the hook script sends the tool call to the gateway for policy evaluation and translates the response into the agent's expected format.

- **Reference implementations** — The shipped hook scripts are reference implementations written in bash. You can write your own in any language — the only requirement is calling the [intercept endpoint](/docs/api/intercept/) and translating the response for your agent.

- **How hooks work** — Brief description of the pre-tool / post-tool flow:
  1. Agent fires a hook event before/after tool execution
  2. Hook script extracts tool name, arguments (and result for post-tool)
  3. Script POSTs to `/api/v1/intercept` on the gateway
  4. Gateway evaluates CEL and AI policies, returns verdict
  5. Script translates verdict into agent-specific format (allow/deny)

- **Fail-open behavior** — If the gateway is unreachable, hooks allow the tool call with a warning to stderr. The gateway is opt-in guardrails, not a hard gate.

- **Prerequisites:**
  - Gateway running in `http` or `sse` mode
  - `MAYBE_DONT_URL` environment variable set (e.g., `http://localhost:8080`)
  - `jq` and `curl` on PATH (for the reference bash scripts)

- **CLI commands:**
  ```bash
  # List available hook scripts
  maybe-dont hooks list

  # Export hook script
  maybe-dont hooks export --agent claude-code > maybe-dont-hook.sh
  chmod +x maybe-dont-hook.sh

  # Export agent config snippet
  maybe-dont hooks export --agent claude-code --config
  ```

- **Supported agents** — Table with links to per-agent subpages, using `{{< cards >}}` shortcode to match the MCP section pattern.

### 4. Per-Agent Hook Subpages (5 pages)

Each page follows a consistent structure modeled on the existing MCP per-agent pages:

1. **Prerequisites** — What you need before starting
2. **Install the Hook** — Export script, make executable
3. **Configure [Agent]** — Export config snippet, paste into agent config file, set `MAYBE_DONT_URL`
4. **Supported Events** — Table of hook events (e.g., `PreToolUse`, `PostToolUse`)
5. **Verify It Works** — How to confirm the hook is active
6. **Agent-Specific Notes** — Anything unique to this agent

Agent-specific details:

- **Claude Code** — Events: `PreToolUse`, `PostToolUse`. Config: `.claude/settings.json`.
- **Cursor** — Events: `beforeShellExecution`, `afterShellExecution`, `beforeMCPExecution`, `afterMCPExecution`. Most granular hook support. Unique: `afterMCPExecution` supports output mutation/redaction. Config: `.cursor/hooks/`.
- **Gemini CLI** — Events: `BeforeTool`, `AfterTool`. Config: `settings.json`.
- **Cline** — Events: `preToolUse`, `postToolUse`. Config: `.clinerules/hooks/`. Note: macOS/Linux only.
- **GitHub Copilot** — Events: `PreToolUse`, `PostToolUse`. Config: `.github/hooks/*.json`. Note: Same hooks work for Cody and VS Code Copilot.

### 5. Skills Page (`content/docs/agents/skills.md`, weight 3)

Relocated from `content/docs/skills.md` (delete the old file after moving).

Changes to existing content:

- **Add Hugo alias** in front matter: `aliases: ["/docs/skills/"]`
- **Add callout at top:** "For runtime policy enforcement, use [Hooks](/docs/agents/hooks/). Skills are for teaching agents to author policies and test cases."
- **`cli` skill row in the table:** Add note — "Use [hooks](/docs/agents/hooks/) instead when available. The CLI skill is a fallback for agents that don't support hooks."
- **Title stays "Skills"**, weight changes to 3 (within the Agents section).
- All other content (schemas, workflow, export formats) stays as-is.

## Updates to Existing Pages

### CLI Gateway (`content/docs/cli-gateway/_index.md`)

Add a callout after the "What Is the CLI Gateway?" section:

> **Prefer hooks for CLI enforcement.** If your agent supports hooks, use [agent hooks](/docs/agents/hooks/) instead of routing commands through `maybe-dont cli`. Hooks call the gateway's intercept endpoint directly and enforce policy decisions deterministically — no LLM compliance required. The CLI gateway remains available for agents without hook support.

### MCP Gateway (`content/docs/mcp-gateway/_index.md`)

After removing `examples/`, update any links that pointed to `examples/` to point to `/docs/agents/mcp/` instead. If the MCP gateway index links to its examples section, update those links.

### Internal Link Migration

Update all internal links that reference `/docs/skills/` to `/docs/agents/skills/`:
- `content/docs/policies/cel-policies.md`
- `content/docs/policies/writing-policies.md`
- `content/docs/policies/ai-policies.md`
- `content/docs/testing/_index.md`
- `content/docs/testing/test-cases.md` (note: preserves `#schema-reference` anchor — heading is unchanged)

Update all internal links that reference `/docs/mcp-gateway/examples/` to `/docs/agents/mcp/`:
- `content/docs/get-started.md`
- `content/docs/api/action-validate.md`
- `content/docs/mcp-gateway/_index.md` (card shortcode linking to `examples`)
- `content/solutions/ai-guardrails.md` (index link + per-agent links: claude-code, cursor, github-copilot)
- `content/solutions/agentic-observability.md` (index link + per-agent links: claude-code, cursor, github-copilot)

Update the moved MCP per-agent pages themselves — each contains a prerequisite link to `/docs/mcp-gateway/examples/` that must point to `/docs/agents/mcp/`.

Update `layouts/_default/home.llms.txt` — contains 7 hardcoded links to `/docs/mcp-gateway/examples/connecting-*` and 1 link to `/docs/skills/`. This is a layout template, not content, so Hugo aliases do not apply — the URLs must be updated directly.

Hugo aliases on the moved content pages handle external/bookmarked URLs.

### Docs Home Page (`content/docs/_index.md`)

Add a card for the Agents section. The docs home page already has cards for Get Started, MCP Gateway, CLI Gateway, Configuration, Policies, Audit Log, and Testing.

### Get Started (`content/docs/get-started.md`)

The "What's Next" section currently offers two paths (MCP proxy and CLI validation). Consider adding a third path mentioning hooks, or linking to the Agents index so users see all integration options.

## Out of Scope

- Cursor mutation path documentation (feature not yet fully integrated per the worklist)
- Changes to the intercept endpoint docs (already documented at `/docs/api/intercept/`)
- New CSS or shortcodes
- Gemini Code Assist hooks support (IDE extension does not support hooks; Gemini CLI does)
