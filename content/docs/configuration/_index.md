---
title: Configuration
weight: 35
---

Maybe Don't is configured through a YAML file, environment variables, or a combination of both. This section covers how configuration works and the options available.

## Configuration File

By default, the gateway looks for `maybe-dont.yaml` in these locations (in order):

1. Path specified by `--config-dir` CLI flag
2. Path specified by `MAYBE_DONT_CONFIG_DIR` environment variable
3. `$XDG_CONFIG_HOME/maybe-dont/` (typically `~/.config/maybe-dont/`)
4. `$HOME/.config/maybe-dont/`

The first file found wins. If no config file exists on first run, default files are generated.

## Configuration Precedence

Values are resolved in this order (later overrides earlier):

| Priority | Source | Example |
|----------|--------|---------|
| 1 (lowest) | Config file | `maybe-dont.yaml` |
| 2 | Environment variables | `MAYBE_DONT_SERVER_TYPE=http` |
| 3 (highest) | CLI flags | `--config-dir /custom/path` |

This means you can set defaults in your config file and override specific values with environment variables - useful for Docker deployments where secrets shouldn't be in files.

## Environment Variables

Any configuration option can be set via environment variable using the pattern:

```
MAYBE_DONT_{PATH}
```

Where `{PATH}` is the YAML path with dots replaced by underscores, in uppercase. For example:

| YAML Path | Environment Variable |
|-----------|---------------------|
| `server.type` | `MAYBE_DONT_SERVER_TYPE` |
| `server.listen_addr` | `MAYBE_DONT_SERVER_LISTEN_ADDR` |
| `validation.ai.api_key` | `MAYBE_DONT_VALIDATION_AI_API_KEY` |
| `audit.path` | `MAYBE_DONT_AUDIT_PATH` |

## Variable Substitution

You can reference environment variables in your config file using `${VAR_NAME}` syntax:

```yaml
validation:
  ai:
    api_key: "${OPENAI_API_KEY}"

downstream_mcp_servers:
  github:
    type: http
    url: "${GITHUB_MCP_URL}"
```

This is expanded at load time, allowing you to keep secrets out of config files while maintaining readable configuration.

## Configuration Sections

{{< cards >}}
  {{< card link="logging" title="Logging" icon="document-text" subtitle="Application log configuration" >}}
  {{< card link="reference" title="Reference" icon="book-open" subtitle="Complete configuration reference" >}}
{{< /cards >}}
