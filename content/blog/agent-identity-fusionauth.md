---
title: "Agent Identity for MCP and CLI: FusionAuth Entities + Maybe Don't Gateway"
subtitle: "Force authentication, attribute every action, and enforce authorization — even when the PAT says allow"
date: 2026-02-14
draft: true
author: daniel
summary: |
  Your GitHub PAT grants full repo access. But when an AI agent uses it, who created that PR — you or the agent? This post shows how to use FusionAuth entities with the Maybe Don't gateway to solve agent identity, audit attribution, and least-privilege enforcement for delegated access. Full proof-of-concept with Docker Compose included.
description: "How to implement agent identity attestation and least-privilege enforcement for MCP servers and CLI tools using FusionAuth entities and the Maybe Don't AI gateway."
---

Your GitHub PAT grants `repo` scope. When Claude uses `gh pr create` through your MCP gateway, the PAT works fine. But who created that PR — you, or the agent acting on your behalf?

If the agent holds the same PAT your developer uses, what stops it from running `gh repo delete`?

Today, most MCP gateways and CLI wrappers treat the downstream credential as the entire auth story. The agent *is* the credential. There's no separate identity for the agent, no forced authentication event proving a human authorized this session, and no way to enforce restrictions beyond what the PAT already allows.

This is a problem for anyone who cares about:

- **Non-repudiation**: SOC 2 and ISO 42001 require you to attribute actions to identifiable principals. "A PAT was used" is not sufficient when agents and humans share credentials.
- **Least-privilege for delegated access**: The PAT represents what the *user* can do. It does not represent what an *agent acting on behalf of that user* should be allowed to do.
- **The CISO question**: "Who did this, and should an agent have been allowed to?"

Short-lived tokens don't fix this. Whether a token lives 60 seconds or 60 days, it still represents the user's full authorization scope — not what an agent should be allowed to do within a delegated context.

This post shows how to fix it.

## What We're Building

We'll wire together four components into a self-contained proof-of-concept:

- **[FusionAuth](https://fusionauth.io)** — Identity provider. Issues tokens via the device authorization grant (human auth) and client credentials grant (agent identity). Manages entities and permission grants.
- **[Maybe Don't](https://maybedont.ai)** — MCP gateway and CLI proxy. Inspects the FusionAuth token, logs identity in audit, and enforces authorization policies separate from downstream permissions.
- **GitHub MCP server** — The real GitHub MCP server, downstream of Maybe Don't. Uses the developer's PAT for GitHub API access.
- **`gh` CLI** — The real GitHub CLI, proxied through Maybe Don't's CLI validation endpoint. Uses the developer's PAT.

The architecture has two distinct auth layers:

1. **FusionAuth token** — Proves the human authorized this agent session. Carries entity grants that define what the agent is allowed to do. This token never reaches GitHub.
2. **GitHub PAT** — Provides access to the GitHub API. Passed through the gateway to the downstream MCP server or used directly by the `gh` CLI. GitHub enforces its own access control as usual.

Maybe Don't sits in the middle. It inspects the FusionAuth token for identity and authorization decisions. It forwards the PAT to GitHub. These are separate concerns.

> This tutorial uses FusionAuth because it has first-class support for entities, the client credentials grant, and the device authorization grant — all of which map directly to the agent identity problem. Any OAuth2/OIDC-compliant identity provider that supports these features will work with Maybe Don't.

## Quick Start

You'll need Docker installed and a GitHub PAT with `repo` scope. The setup takes about five minutes.

**Linux / macOS:**

```bash
curl -fsSL https://maybedont.ai/blog/agent-identity/setup.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://maybedont.ai/blog/agent-identity/setup.ps1 | iex
```

This pulls the Docker Compose stack, FusionAuth Kickstart configuration, and Maybe Don't gateway config, then runs `docker compose up`. When it's done, you'll have:

- FusionAuth running at `http://localhost:9011`
- Maybe Don't gateway running at `http://localhost:8080`
- A pre-configured entity model, application, and test user

If you prefer to set things up manually, the rest of this post walks through every piece.

## The Docker Compose Stack

The full stack is three containers: FusionAuth, PostgreSQL (required by FusionAuth), and Maybe Don't.

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: fusionauth
      POSTGRES_USER: fusionauth
      POSTGRES_PASSWORD: fusionauth
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fusionauth"]
      interval: 5s
      timeout: 3s
      retries: 5

  fusionauth:
    image: fusionauth/fusionauth-app:latest
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "9011:9011"
    environment:
      DATABASE_URL: jdbc:postgresql://postgres:5432/fusionauth
      DATABASE_ROOT_USERNAME: fusionauth
      DATABASE_ROOT_PASSWORD: fusionauth
      DATABASE_USERNAME: fusionauth
      DATABASE_PASSWORD: fusionauth
      FUSIONAUTH_APP_MEMORY: 512M
      SEARCH_TYPE: database
      FUSIONAUTH_APP_KICKSTART_FILE: /usr/local/fusionauth/kickstart/kickstart.json
    volumes:
      - ./kickstart:/usr/local/fusionauth/kickstart

  maybedont:
    image: maybedont/maybe-dont:latest
    depends_on:
      fusionauth:
        condition: service_started
    ports:
      - "8080:8080"
    environment:
      GITHUB_PAT: ${GITHUB_PAT}
    volumes:
      - ./config/maybe-dont.yaml:/etc/maybe-dont/maybe-dont.yaml
      - ./config/authorization.js:/etc/maybe-dont/authorization.js

volumes:
  pgdata:
```

Set your GitHub PAT before starting the stack:

```bash
export GITHUB_PAT=ghp_your_token_here
docker compose up -d
```

## What the Kickstart Creates

FusionAuth's [Kickstart](https://fusionauth.io/docs/get-started/download-and-install/development/kickstart) feature bootstraps the entire identity configuration on first startup. No manual UI clicks required.

Here's what our Kickstart configures and why each piece matters:

### Entity Type: Agent Integration

An entity type defines a category of non-user things in your system. We create one called "Agent Integration" with permissions that map to the actions an agent might take against GitHub.

```json
{
  "entityTypes": [
    {
      "id": "#{ENTITY_TYPE_ID}",
      "name": "Agent Integration",
      "jwtConfiguration": {
        "enabled": true,
        "accessTokenSigningKeysId": "#{SIGNING_KEY_ID}",
        "timeToLiveInSeconds": 3600
      },
      "permissions": [
        { "name": "read_repos", "description": "List and read repository content" },
        { "name": "list_issues", "description": "List and read issues" },
        { "name": "create_pr", "description": "Create pull requests" },
        { "name": "create_issue", "description": "Create issues" },
        { "name": "delete_repo", "description": "Delete repositories" },
        { "name": "manage_workflows", "description": "Manage GitHub Actions workflows" }
      ]
    }
  ]
}
```

These permissions are not GitHub permissions. They're your organization's definition of what agents are allowed to do when operating against GitHub on behalf of a human. Your CISO or VPE defines this list based on your risk tolerance.

### Entity: github

An entity is an instance of an entity type. We create one called "github" that represents GitHub access — both MCP and CLI.

```json
{
  "entities": [
    {
      "id": "#{GITHUB_ENTITY_ID}",
      "type": {
        "id": "#{ENTITY_TYPE_ID}"
      },
      "name": "github",
      "clientId": "github-agent-client",
      "clientSecret": "super-secret-github-agent"
    }
  ]
}
```

The `clientId` and `clientSecret` enable the client credentials grant for this entity. This is how the MCP server or CLI identifies itself to FusionAuth — separate from the human user's identity.

### Application: Agent Identity

The application is configured to support both the device authorization grant (for human authentication) and the client credentials grant (for agent identity).

```json
{
  "applications": [
    {
      "id": "#{APPLICATION_ID}",
      "name": "Agent Identity",
      "oauthConfiguration": {
        "clientId": "agent-identity-app",
        "clientSecret": "app-secret",
        "enabledGrants": [
          "device_code",
          "client_credentials"
        ],
        "deviceVerificationURL": "http://localhost:9011/oauth2/device"
      }
    }
  ]
}
```

### Entity Grant: Scoped Permissions

Here's where the least-privilege model comes together. We grant the test user specific permissions on the "github" entity — and deliberately exclude dangerous ones.

```json
{
  "grants": [
    {
      "userId": "#{TEST_USER_ID}",
      "entity": {
        "id": "#{GITHUB_ENTITY_ID}"
      },
      "permissions": [
        "read_repos",
        "list_issues",
        "create_pr",
        "create_issue"
      ]
    }
  ]
}
```

The user has `read_repos`, `list_issues`, `create_pr`, and `create_issue`. They do **not** have `delete_repo` or `manage_workflows`. Even if their GitHub PAT has full `repo` scope, the agent is restricted to these four operations.

## The Device Authorization Grant

Before an agent session begins, the developer must authenticate. The device authorization grant is designed for exactly this — it works on headless devices and CLI environments where you can't open a browser inline.

### Step 1: Request a Device Code

The MCP server or CLI requests a device code from FusionAuth:

```bash
curl -s -X POST http://localhost:9011/oauth2/device_authorize \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=agent-identity-app" \
  -d "scope=openid offline_access"
```

Response:

```json
{
  "device_code": "Hk4gMz...",
  "user_code": "XRFQ-MJGK",
  "verification_uri": "http://localhost:9011/oauth2/device",
  "verification_uri_complete": "http://localhost:9011/oauth2/device?user_code=XRFQ-MJGK",
  "expires_in": 600,
  "interval": 5
}
```

### Step 2: Developer Authenticates

The developer opens the `verification_uri_complete` URL in their browser, logs in with their credentials, and approves the device. This is the authentication event that creates the audit trail. From this point forward, the agent session is bound to the developer's identity.

### Step 3: Poll for the Token

The client polls FusionAuth until the developer completes authentication:

```bash
curl -s -X POST http://localhost:9011/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=agent-identity-app" \
  -d "client_secret=app-secret" \
  -d "device_code=Hk4gMz..." \
  -d "grant_type=urn:ietf:params:oauth:grant-type:device_code"
```

Once the developer authenticates, FusionAuth returns an access token:

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "r:abc123..."
}
```

### What's in the Token

Decode the JWT and you'll see the entity grants:

```json
{
  "sub": "00000000-0000-0000-0000-000000000001",
  "email": "daniel@example.com",
  "name": "Daniel DeGroff",
  "iat": 1739500000,
  "exp": 1739503600,
  "iss": "http://localhost:9011",
  "aud": "agent-identity-app",
  "permissions": {
    "github": [
      "read_repos",
      "list_issues",
      "create_pr",
      "create_issue"
    ]
  }
}
```

The `permissions` claim maps entity names to granted permissions. The gateway will use this to make authorization decisions.

## Wiring Up the Maybe Don't Gateway

The gateway configuration connects everything: token validation against FusionAuth, the GitHub MCP server as a downstream client, CLI validation for the `gh` command, and the JavaScript authorization function.

### `maybe-dont.yaml`

```yaml
server:
  type: http
  listen_addr: 0.0.0.0:8080

# Token validation against FusionAuth
auth:
  token_validation:
    jwks_url: http://fusionauth:9011/.well-known/jwks.json
    issuer: http://localhost:9011
    audience: agent-identity-app

  # JavaScript authorization function
  authorization:
    script: /etc/maybe-dont/authorization.js

# Downstream MCP servers
downstream_mcp_servers:
  github:
    type: http
    url: https://api.githubcopilot.com/mcp/
    auth:
      pass_through:
        enabled: true
        headers:
          - source_header: X-GitHub-Token
            target_header: Authorization
            format: "Bearer {value}"

# CLI validation
cli_request_validation:
  enabled: true
  validate_commands:
    - gh

# AI policies for request validation
request_validation:
  cel:
    enabled: true
    rules_file: cel-rules.yaml
  ai:
    enabled: true
    rules_file: ai-rules.yaml

# Audit logging
audit:
  path: stdout
  filter: all
```

The key pieces:

- **`auth.token_validation`**: Points at FusionAuth's JWKS endpoint. The gateway validates every incoming Bearer token, verifies the signature, and extracts claims.
- **`auth.authorization.script`**: A JavaScript file that receives the decoded token and the action being performed. Returns allow or deny.
- **`downstream_mcp_servers.github`**: The real GitHub MCP server. Pass-through auth maps the `X-GitHub-Token` header from the upstream request to the `Authorization` header downstream. The FusionAuth token stays at the gateway — only the PAT reaches GitHub.
- **`cli_request_validation`**: Enables validation for `gh` CLI commands.

### The Authorization Function

This is where the CISO's intent becomes code. The JavaScript function receives two arguments: the decoded FusionAuth token and the action context (tool call or CLI command). It returns whether the action should proceed.

```javascript
// authorization.js

// Map MCP tool names to required permissions
var toolPermissions = {
  "list_repos":       "read_repos",
  "get_repo":         "read_repos",
  "list_issues":      "list_issues",
  "get_issue":        "list_issues",
  "create_pull":      "create_pr",
  "create_issue":     "create_issue",
  "delete_repo":      "delete_repo",
  "update_workflow":  "manage_workflows"
};

// Map CLI subcommands to required permissions
var cliPermissions = {
  "repo view":     "read_repos",
  "repo list":     "read_repos",
  "issue list":    "list_issues",
  "issue view":    "list_issues",
  "pr create":     "create_pr",
  "issue create":  "create_issue",
  "repo delete":   "delete_repo"
};

function evaluate(token, action) {
  // Get the entity permissions for github
  var grants = (token.permissions || {})["github"] || [];

  var required;

  if (action.tool) {
    // MCP tool call — look up the unprefixed tool name
    required = toolPermissions[action.tool.name];
  } else if (action.cli) {
    // CLI command — match against subcommand patterns
    var cmd = action.cli.command + " " + (action.cli.arguments || []).slice(0, 2).join(" ");
    for (var pattern in cliPermissions) {
      if (cmd.indexOf(pattern) >= 0) {
        required = cliPermissions[pattern];
        break;
      }
    }
  }

  // No mapping means no restriction
  if (!required) {
    return { allow: true };
  }

  // Check if the token grants the required permission
  var hasPermission = grants.indexOf(required) >= 0;

  return {
    allow: hasPermission,
    reason: hasPermission
      ? "Entity grant satisfied: " + required
      : "Entity grant missing: " + required + " (granted: " + grants.join(", ") + ")"
  };
}
```

This function is loaded once at gateway startup and executed on every request. It runs in a sandboxed JavaScript runtime — no filesystem access, no network access, no side effects.

The mapping tables are intentionally simple. In a production deployment, you might load these from a configuration file, derive them from the entity type's permission model, or use a more sophisticated matching strategy. The point is that the logic is yours to define.

## Real GitHub Examples

With the stack running and a FusionAuth token obtained via the device grant, let's see the system in action. Every example below hits real GitHub APIs.

### MCP: Listing Repositories (Allowed)

The agent calls `gh__list_repos` through the Maybe Don't gateway. The token includes `read_repos`, so the authorization function allows it.

```bash
# The MCP client sends this tool call through the gateway.
# Authorization: Bearer <fusionauth_token>
# X-GitHub-Token: <github_pat>

# Tool: github__list_repos
# Arguments: { "owner": "maybedont" }
```

The gateway:
1. Validates the FusionAuth token against the JWKS endpoint
2. Extracts the entity grants: `["read_repos", "list_issues", "create_pr", "create_issue"]`
3. Runs the authorization function: `list_repos` requires `read_repos` — **granted**
4. Forwards the request to the GitHub MCP server with the PAT
5. Returns the result to the agent
6. Writes an audit entry

**Audit log entry:**

```json
{
  "validation_started": "2026-02-14T10:30:00.123Z",
  "created_at": "2026-02-14T10:30:00.456Z",
  "tool": {
    "name": "list_repos",
    "client": "github",
    "prefixed_name": "github__list_repos",
    "params": { "owner": "maybedont" }
  },
  "upstream_request": {
    "id": "abc123",
    "session_id": "sess-001",
    "client_ip": "172.18.0.1",
    "sponsor": {
      "email": "daniel@example.com",
      "sub": "00000000-0000-0000-0000-000000000001"
    },
    "entity_grants": ["read_repos", "list_issues", "create_pr", "create_issue"]
  },
  "action": "allow",
  "action_reason": "entity_grant_satisfied",
  "duration_ms": 333
}
```

The audit entry includes the **sponsor identity** — the human who authenticated via the device grant. This is not the PAT owner (which is just a string). This is a verified identity from an interactive authentication event, satisfying non-repudiation requirements.

### MCP: Deleting a Repository (Denied)

The agent calls `gh__delete_repo`. The token does not include `delete_repo`.

```bash
# Tool: github__delete_repo
# Arguments: { "owner": "maybedont", "repo": "test-repo" }
```

The gateway:
1. Validates the FusionAuth token
2. Extracts the entity grants — no `delete_repo`
3. Runs the authorization function: `delete_repo` requires `delete_repo` — **denied**
4. Does not forward the request to GitHub
5. Returns a denial to the agent
6. Writes an audit entry

**Audit log entry:**

```json
{
  "validation_started": "2026-02-14T10:31:00.123Z",
  "created_at": "2026-02-14T10:31:00.130Z",
  "tool": {
    "name": "delete_repo",
    "client": "github",
    "prefixed_name": "github__delete_repo",
    "params": { "owner": "maybedont", "repo": "test-repo" }
  },
  "upstream_request": {
    "id": "abc124",
    "session_id": "sess-001",
    "client_ip": "172.18.0.1",
    "sponsor": {
      "email": "daniel@example.com",
      "sub": "00000000-0000-0000-0000-000000000001"
    },
    "entity_grants": ["read_repos", "list_issues", "create_pr", "create_issue"]
  },
  "action": "deny",
  "action_reason": "Entity grant missing: delete_repo (granted: read_repos, list_issues, create_pr, create_issue)",
  "duration_ms": 7
}
```

The PAT has `repo` scope — GitHub would have allowed the delete. But the FusionAuth entity grant says this agent session doesn't have `delete_repo` permission. The gateway blocked it before the request ever reached GitHub.

This is the value: **GitHub enforces what the user can do. Maybe Don't enforces what the agent can do.**

### CLI: Listing Pull Requests (Allowed)

The `gh` CLI is proxied through Maybe Don't's CLI validation endpoint. The developer authenticates via the device grant and the CLI wrapper attaches the FusionAuth token to validation requests.

```bash
# Developer runs:
gh pr list --repo maybedont/maybedont-site
```

The Maybe Don't CLI wrapper intercepts the command, sends a validation request to the gateway with the FusionAuth token, and receives an allow decision. The command executes normally using the developer's PAT.

**Audit log entry:**

```json
{
  "validation_started": "2026-02-14T10:32:00.100Z",
  "created_at": "2026-02-14T10:32:00.108Z",
  "cli": {
    "command": "gh",
    "arguments": ["pr", "list", "--repo", "maybedont/maybedont-site"],
    "client_info": {
      "hostname": "daniels-mbp",
      "username": "daniel",
      "os": "darwin"
    }
  },
  "upstream_request": {
    "id": "abc125",
    "client_ip": "172.18.0.1",
    "sponsor": {
      "email": "daniel@example.com",
      "sub": "00000000-0000-0000-0000-000000000001"
    },
    "entity_grants": ["read_repos", "list_issues", "create_pr", "create_issue"]
  },
  "action": "allow",
  "action_reason": "entity_grant_satisfied",
  "duration_ms": 8
}
```

### CLI: Deleting a Repository (Denied)

```bash
gh repo delete maybedont/test-repo --yes
```

The authorization function checks the entity grants. No `delete_repo` permission. The command is blocked before it ever runs.

```
Error: command denied by policy — Entity grant missing: delete_repo
```

The developer's PAT would have allowed this. The FusionAuth entity grant said no.

## What This Enables

### Identity Attestation for Compliance

Every agent action in the audit log is attributed to a verified human principal. The developer authenticated via an interactive browser login (device authorization grant), not just a static API key. This gives you:

- **Non-repudiation**: The audit trail proves which human authorized the agent session that performed each action. This satisfies SOC 2 CC6.1 (logical access security) and ISO 42001 requirements for AI system accountability.
- **Session binding**: The token ties a specific human authentication event to a specific agent session. If the token expires or is revoked, the session ends.

### Least-Privilege for Delegated Access

The human's credentials (PAT, API key) represent their full authorization scope. When those credentials are delegated to an agent, the entity grants scope them down:

- The **PAT** says: this user has `repo` scope (read, write, delete, admin).
- The **entity grant** says: when acting through an agent, this user can only `read_repos`, `list_issues`, `create_pr`, and `create_issue`.
- The **gateway** enforces the entity grant boundary — the PAT's full scope never reaches the agent's effective permissions.

This is analogous to how OAuth scopes work at the application level: a token can request fewer permissions than the user has. Entity grants bring this same principle to agent-level delegation.

### Separation of Concerns

Each layer does one thing:

| Layer | Responsibility |
|-------|---------------|
| **FusionAuth** | Identity. Who is the human? What entity grants do they have? |
| **Maybe Don't** | Governance. Should this agent action proceed? What happened? |
| **GitHub** | Access control. Does this credential have permission to this resource? |

No single layer has the full picture, and no single layer needs to. FusionAuth doesn't know about GitHub tool calls. GitHub doesn't know about entity grants. Maybe Don't doesn't manage user identities or GitHub permissions. They compose.

### Beyond GitHub

This architecture works for any downstream service. Replace "GitHub" with AWS, Slack, Jira, or your internal APIs. The pattern is the same:

1. Define an entity type with permissions that reflect your agent governance policy
2. Create an entity for each downstream service
3. Grant users the permissions appropriate for agent-delegated access
4. Configure Maybe Don't to validate the token and run your authorization function

The authorization function is yours. The entity model is yours. The downstream service doesn't change.

## Getting Started

The full Docker Compose stack, Kickstart configuration, and setup scripts are available at:

**[github.com/maybedont/agent-identity-demo](https://github.com/maybedont/agent-identity-demo)**

```bash
git clone https://github.com/maybedont/agent-identity-demo.git
cd agent-identity-demo
export GITHUB_PAT=ghp_your_token_here
docker compose up -d
```

From there, follow the device authorization flow to get a token, and start making MCP tool calls or running `gh` commands through the gateway. Every action will be identity-attributed in the audit log.

For more on Maybe Don't's policy engine, audit logging, and MCP gateway capabilities, see the [documentation](https://maybedont.ai/docs/).
