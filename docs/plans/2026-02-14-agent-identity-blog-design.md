# Agent Identity Blog Post — Design Document

**Date**: 2026-02-14
**Author**: daniel
**Status**: Draft — awaiting review

## Overview

A single long-form blog post demonstrating how to use FusionAuth entities with the Maybe Don't gateway to solve agent identity, audit attribution, and least-privilege enforcement for delegated access.

The post uses real GitHub examples (MCP server + `gh` CLI) with a self-contained Docker Compose stack. Product features that don't exist yet are explicitly labeled as coming enhancements.

## Goals

1. **Audit identity attestation**: Every agent action attributed to a verified human principal (the "sponsor") who authorized the session via an interactive authentication event.
2. **Least-privilege enforcement for delegated access**: When a human's credentials (PAT, API key) are delegated to an agent, the effective permissions are scoped down to reflect the delegated context.
3. **Demonstrate the architecture end-to-end**: FusionAuth setup, device grant, client credentials, gateway integration, real GitHub operations.

## Target Audience

Both security/compliance decision-makers (exec summary) and platform/DevOps engineers (hands-on tutorial). The post leads with the business case and follows with a complete proof-of-concept.

## Key Framing

- **FusionAuth is highlighted as the IdP, but any OAuth2/OIDC provider that supports entities (or equivalent), client credentials grant, and device authorization grant will work.**
- **The PAT problem**: Short-lived tokens don't solve this. Whether a token lives 60 seconds or 60 days, it represents the user's permissions — not what an agent acting on behalf of that user should be allowed to do. The threat model for delegated agent access is the same regardless of token lifetime.
- **The human sponsor model**: The user delegates their credentials to an agent. The agent acts on their behalf. The gateway enforces what the agent can do within that delegation — separate from what the downstream service (GitHub) allows.

## Architecture

### Components

| Component | Role | Runs In |
|-----------|------|---------|
| FusionAuth | Identity provider. Issues tokens via device grant (human auth) and client credentials grant (agent identity). Manages entities and permission grants. | Docker Compose |
| PostgreSQL | FusionAuth database. | Docker Compose |
| Maybe Don't gateway | MCP gateway + CLI proxy. Inspects FusionAuth token, logs identity in audit, enforces authz policies. Forwards PAT to downstream GitHub. | Docker Compose |
| GitHub MCP server | Real GitHub MCP server (downstream of Maybe Don't). Uses PAT for GitHub API access. | Docker Compose or host |
| `gh` CLI | Real GitHub CLI. Proxied through Maybe Don't CLI validation endpoint. Uses PAT for GitHub API access. | Host machine |

### Auth Flow

```
Developer              FusionAuth            Maybe Don't Gateway      GitHub API
    |                      |                        |                     |
    |-- Device Auth ------>|                        |                     |
    |   Grant Request      |                        |                     |
    |<-- Device Code ------|                        |                     |
    |   + Verification URL |                        |                     |
    |                      |                        |                     |
    |  [Opens browser,     |                        |                     |
    |   authenticates]     |                        |                     |
    |                      |                        |                     |
    |-- Poll for token --->|                        |                     |
    |<-- Access Token -----|                        |                     |
    |   (JWT with:         |                        |                     |
    |    sub=user_id       |                        |                     |
    |    entity grants     |                        |                     |
    |    permissions)      |                        |                     |
    |                      |                        |                     |
    |-- MCP tool call or CLI command -------------->|                     |
    |   + Authorization: Bearer <fusionauth_token>  |                     |
    |   + X-GitHub-Token: <pat>                     |                     |
    |                      |                        |                     |
    |                      |         Validate token |                     |
    |                      |         (JWKS verify)  |                     |
    |                      |                        |                     |
    |                      |         Extract claims:|                     |
    |                      |         - user identity|                     |
    |                      |         - entity grants|                     |
    |                      |         - permissions  |                     |
    |                      |                        |                     |
    |                      |         Run authz      |                     |
    |                      |         function:      |                     |
    |                      |         token + action |                     |
    |                      |         -> allow/deny  |                     |
    |                      |                        |                     |
    |                      |                        |-- Forward request ->|
    |                      |                        |   (PAT only, no    |
    |                      |                        |    FusionAuth token)|
    |                      |                        |                     |
    |                      |                        |<-- GitHub response -|
    |                      |                        |                     |
    |<-- Result ----------------------------------------|                 |
    |                      |                        |                     |
    |   Audit log entry:                            |                     |
    |   sponsor=daniel@co.com                       |                     |
    |   agent_session=device_grant                  |                     |
    |   tool=gh__list_repos                         |                     |
    |   action=allow                                |                     |
    |   entity_grants=[read_repos,create_pr]        |                     |
```

### Key Design Decisions

1. **The FusionAuth token never reaches GitHub.** The gateway inspects it for identity and authz. The PAT (pass-through auth) is what goes downstream. These are separate auth layers.

2. **GitHub enforces what the user can do. Maybe Don't enforces what the agent can do.** The entity grants in the FusionAuth token define the agent-scoped boundary. This is additive security, not a replacement.

3. **The authz evaluation function is user-provided JavaScript**, executed in a sandboxed runtime (goja — pure Go, no CGo). The function receives the decoded token (claims, permissions, entity grants) and the action context (tool name, CLI command, arguments) and returns allow/deny. This avoids hard-coding validation logic and gives CISOs/VPEs full control over the policy.

4. **FusionAuth Kickstart bootstraps the entire IdP setup.** The reader doesn't need to manually configure anything in the FusionAuth UI — the Docker Compose + Kickstart JSON creates the entity types, entities, permissions, application, and test user.

## FusionAuth Entity Model

### Entity Type: "Agent Integration"

Represents a downstream service that agents access on behalf of users.

**Permissions** (defined on the entity type):
- `read_repos` — List and read repository content
- `list_issues` — List and read issues
- `create_pr` — Create pull requests
- `create_issue` — Create issues
- `delete_repo` — Delete repositories
- `manage_workflows` — Manage GitHub Actions workflows

### Entity: "github"

An instance of "Agent Integration" representing GitHub access (both MCP and CLI).

### Entity Grant

Links a user to the "github" entity with specific permissions:
- User "daniel" → `read_repos`, `list_issues`, `create_pr`, `create_issue`
- Notably **missing**: `delete_repo`, `manage_workflows`

### Token Contents (decoded JWT)

```json
{
  "sub": "user-uuid",
  "email": "daniel@example.com",
  "iat": 1739500000,
  "exp": 1739503600,
  "iss": "https://fusionauth.local",
  "permissions": ["read_repos", "list_issues", "create_pr", "create_issue"],
  "entity": {
    "id": "github-entity-uuid",
    "type": "Agent Integration",
    "name": "github"
  }
}
```

> Note: Exact JWT claim structure depends on FusionAuth's entity grant token format. The Kickstart setup and blog will use the actual claim names.

## Blog Post Outline

### 1. The Problem (~400 words)

- Agents inherit user credentials with no separate identity
- Can't distinguish human vs agent in audit logs — fails SOC 2 / ISO 42001 non-repudiation requirements
- PAT/API key scope is all-or-nothing for agents
- The CISO question: "Who did this, and should an agent have been allowed to?"
- Short-lived tokens don't fix it: token lifetime != authorization scope for delegated access

### 2. The Architecture (~300 words + diagram)

- Four components: FusionAuth, Maybe Don't gateway, GitHub MCP, `gh` CLI
- Two auth layers: FusionAuth token (identity + permissions) vs PAT (downstream access)
- The FusionAuth token never touches GitHub — gateway inspects it, PAT goes downstream
- "This tutorial uses FusionAuth. Any OAuth2/OIDC provider supporting entities, client credentials, and device authorization grants will work."

### 3. Quick Start (~200 words + code)

- One-command setup (curl | bash for Linux/Mac, PowerShell for Windows)
- Docker Compose brings up FusionAuth + Postgres + Maybe Don't
- Kickstart auto-configures everything
- "You'll need: Docker, a GitHub PAT with `repo` scope, ~5 minutes"

### 4. What the Kickstart Creates (~600 words + code)

- Walk through the Kickstart JSON
- Entity type with permissions
- Entity "github"
- Application configured for device auth + client credentials grants
- Test user with entity grants
- Show the FusionAuth admin UI screenshots (optional — could be too much)

### 5. The Device Authorization Grant (~400 words + code)

- Why: forces a human authentication event before any agent session
- `curl` to request device code
- Browser-based login
- `curl` to poll for token
- Decode the JWT — show the entity grants

### 6. Wiring Up the Gateway (~500 words + code)

- `maybe-dont.yaml` configuration
- GitHub MCP server as downstream (pass-through auth for PAT)
- CLI validation for `gh`
- **[Enhancement: Token Validation]** JWKS endpoint config for FusionAuth token verification
- **[Enhancement: JS Authorization]** JavaScript function that evaluates token grants against the action

### 7. Real GitHub Examples (~600 words + code)

All examples use real GitHub APIs:

- **MCP — Allowed**: Agent calls `gh__list_repos` → token has `read_repos` → allowed → audit log shows sponsor identity
- **MCP — Denied**: Agent calls `gh__delete_repo` → token lacks `delete_repo` → denied by authz function → audit log records denial with reason **[Enhancement]**
- **CLI — Allowed**: `gh pr list` through Maybe Don't CLI proxy → allowed
- **CLI — Denied**: `gh repo delete` → denied **[Enhancement]**
- Show audit log entries for each case with identity attestation fields

### 8. What This Enables (~300 words)

- **Identity attestation**: SOC 2, ISO 42001 compliance for agent actions
- **Least-privilege delegation**: Agent permissions scoped independently from user permissions
- **Separation of concerns**: GitHub manages access control, Maybe Don't manages agent governance
- **Works for any downstream service**: Same pattern applies to AWS, Slack, internal APIs
- The "human sponsor" model generalizes beyond GitHub

### 9. Enhancement Roadmap (~200 words)

Explicit summary of what's shipping now vs coming:
- **Now**: FusionAuth entity setup, device grant, client credentials, Docker Compose stack, Maybe Don't audit logging with caller attribution, pass-through auth
- **Coming**: JWT/JWKS token validation at gateway, JavaScript authorization engine, entity-grant-aware audit entries, device grant helper CLI command

## Deliverables

### In the blog repo (maybedont-site)

- `content/blog/agent-identity-fusionauth.md` — the blog post (draft: true initially)
- Supporting assets TBD (architecture diagram)

### In a separate repo or directory (TBD)

- `docker-compose.yml` — FusionAuth + Postgres + Maybe Don't
- `kickstart/kickstart.json` — FusionAuth Kickstart configuration
- `config/maybe-dont.yaml` — Gateway configuration for the demo
- `config/authorization.js` — Example authorization function (aspirational)
- `setup.sh` — Linux/Mac fast-path setup script
- `setup.ps1` — Windows fast-path setup script

### Private (not published)

Enhancement tracker for product changes — see next section.

## Product Enhancement List (Private)

These are the product changes needed to fully realize the blog's architecture. They do NOT go in the blog post but inform the roadmap.

| # | Enhancement | Description | Complexity | Dependency |
|---|-------------|-------------|------------|------------|
| 1 | JWT/JWKS validation middleware | New middleware that validates incoming Bearer tokens against a configured JWKS endpoint (e.g., FusionAuth's `/.well-known/jwks.json`). Extracts claims to request context. Config: `auth.token_validation.jwks_url`, `auth.token_validation.issuer`, `auth.token_validation.audience`. | Medium | None |
| 2 | Token claims in audit entries | Decoded token claims (sponsor email/id, entity grants, session info) written to `upstream_request` in audit log entries. New fields alongside existing `client_id`, `client_ip`. | Low | #1 |
| 3 | JavaScript authorization engine | Goja-based JS runtime embedded in the gateway. Loads a user-provided `.js` file at startup. On each request, calls an `evaluate(token, action)` function with decoded token claims and action context (tool name/params or CLI command/args). Returns `{allow: bool, reason: string}`. Config: `auth.authorization.script`. | High | #1 |
| 4 | Device grant helper | CLI subcommand (`maybe-dont auth device`) that performs the device authorization grant flow against a configured IdP. Caches the token locally (XDG state dir). Subsequent MCP/CLI requests attach the cached token automatically. | Medium | #1 |
| 5 | Config: `auth` section | New top-level config section: `auth.token_validation` (JWKS URL, issuer, audience, claim mappings) and `auth.authorization` (script path, function name). | Low | None |
| 6 | FusionAuth Kickstart development | Create and test the Kickstart JSON that bootstraps the entity type, entity, permissions, application, grants, and test user. Not a product change — blog artifact. | Medium | None |
| 7 | Docker Compose stack | Compose file with FusionAuth (database search), Postgres, Maybe Don't. Wired with Kickstart, config, and health checks. Blog artifact. | Medium | None |
| 8 | Setup scripts | Cross-platform scripts (bash + PowerShell) for one-command setup. Blog artifact. | Low | #7 |

### Implementation Priority

For a "concept + coming soon" blog release: **#6, #7, #8** only (blog artifacts). The blog ships with FusionAuth fully working and Maybe Don't features labeled as enhancements.

For a "fully working" blog release: **#1 → #5 → #2 → #3 → #4** then **#6, #7, #8**.

## Open Questions

1. **FusionAuth entity grant token format**: Need to verify the exact JWT claim structure when using entity grants with the device authorization grant. The `permissions` and `entity` claims above are hypothetical — need to test against a real FusionAuth instance.

2. **FusionAuth lambda for authz**: FusionAuth has reconcile lambdas and JWT populate lambdas. Could a FusionAuth lambda enrich the token with an `allowed_tools` claim at issuance time, moving some policy into the IdP? Worth exploring as an alternative to the JS authorization engine in Maybe Don't.

3. **Where to host the Docker Compose / setup scripts**: Options: (a) in the blog repo under `static/blog/agent-identity/`, (b) in a separate public repo like `maybedont/agent-identity-demo`, (c) in the `maybedont/releases` repo. A separate public repo seems cleanest.

4. **Architecture diagram format**: ASCII in the blog post? SVG? Mermaid? The site has `{{< inline-svg >}}` shortcode support.

5. **FusionAuth version**: Which FusionAuth Docker image tag to pin in the compose file? Should use a recent stable release.
