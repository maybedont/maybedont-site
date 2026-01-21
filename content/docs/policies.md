---
title: Policy Configuration
weight: 3
---

The gateway supports two types of policy validation: CEL-based rules and AI-powered validation.

## CEL Policy Validation

Common Expression Language (CEL) rules for deterministic policy enforcement:

```yaml
policy_validation:
  enabled: true
  # Path to CEL policy rules file (required when enabled)
  rules_file: "cel.rules.yaml"
```

### Built-in CEL Rules

The gateway includes default rules that block dangerous operations:

- **kubectl delete namespace** - Prevents namespace deletion when using an mcp server that provides kubectl access.

### Custom CEL Rules

Set the config file `policy_validation.rules_file` to the name of the rules file, like `cel.rules.yaml`.

Add your own rules to `cel.rules.yaml`:

```yaml
rules:
- name: deny-kubectl-delete-namespace
  description: Deny kubectl delete namespace
  expression: |-
    get(request, "method", "") == "tools/call" &&
    get(request.params, "name", "") == "kubectl" &&
    has(request.params, "arguments") &&
    has(request.params.arguments, "command") &&
    request.params.arguments.command.contains("delete") &&
    request.params.arguments.command.contains("namespace")
  action: deny
  message: Denied access to kubectl delete namespace

- name: allow-specific-tools
  description: Allow only specific tools
  expression: |-
    get(request, "method", "") == "tools/call" &&
    get(request.params, "name", "") != "kubectl"
  action: deny
  message: Tool is not in allowed list
```

Note that if there are no matches for CEL policies, they will pass by default.

## AI Policy Validation

AI-powered validation using OpenAI-compatible APIs:

```yaml
ai_validation:
  enabled: true
  endpoint: "https://api.openai.com/v1/chat/completions"
  model: "gpt-4o-mini"
  # Path to AI policy rules file (required when enabled)
  rules_file: "ai.rules.yaml"
  # API key (can also be set via OPENAI_API_KEY env var)
  api_key: "${OPENAI_API_KEY}"
```

### Built-in AI Rules

The gateway includes AI rules for detecting:

- **Mass Deletion Prevention**: Blocks wildcard/recursive file deletions and dangerous flags
- **System Directory Protection**: Prevents access to critical system paths (/etc/, /sys/, /proc/, etc.)
- **Command Execution Control**: Blocks dangerous command tools (bash, shell, powershell, etc.)
- **Credential File Protection**: Prevents access to credential files (.env, .key, .pem, .ssh/, etc.)
- **External Network Restrictions**: Blocks HTTP requests to external domains (except approved ones)
- **Executable File Prevention**: Blocks creation of executable files outside approved directories
- **Large File Operation Limits**: Prevents operations on files >100MB or content >10MB

### Custom AI Rules

First set `ai_validation.rules_file` to the name of your file, like `ai.rules.yaml`.

Then write your own AI rules in `ai.rules.yaml`:

```yaml
rules:
- name: block-destructive-actions
  description: Block destructive actions
  prompt: |
    Analyze the following tool call and determine if it contains any destructive actions.
    Destructive actions include:
    - Deleting files or directories (rm, rm -rf)
    - Formatting disks or partitions
    - Dropping databases
    - Uninstalling critical software

    Tool call:
    %s

    Respond with a JSON object:
    {
      "allowed": boolean,
      "message": "string explaining the decision"
    }
  message: Blocked potentially destructive action
```
