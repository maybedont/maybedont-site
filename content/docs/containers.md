---
title: Container Deployment
weight: 4
---

The latest container image is available at `ghcr.io/maybedont/maybe-dont:v1.1.0`.

## Basic Container Usage

Mount your config directory containing all configuration and rules files:

```bash
# Using Docker
docker run \
  -e OPENAI_API_KEY \
  -v $(pwd)/config:/config \
  -p 8080:8080 \
  ghcr.io/maybedont/maybe-dont:v1.1.0 start --config-path /config

# Using Podman
podman run \
  -e OPENAI_API_KEY \
  -v $(pwd)/config:/config \
  -p 8080:8080 \
  ghcr.io/maybedont/maybe-dont:v1.1.0 start --config-path /config
```

**Your config directory should contain:**
- `gateway-config.yaml` - Main gateway configuration (required)
- `cel.rules.yaml` - Custom CEL policy rules (optional, if referenced in gateway-config.yaml)
- `ai.rules.yaml` - Custom AI validation rules (optional, if referenced in gateway-config.yaml)

{{< callout type="info" >}}
**Important Notes:**
- Make sure your `gateway-config.yaml` server is listening on `0.0.0.0:8080` for the exposed port to work
- Consider sending audit logs to stdout instead of a file, or mount the audit log directory as an additional volume
- All environment variables referenced in your config files (e.g., `${GITHUB_TOKEN}`, `${OPENAI_API_KEY}`) should be passed via `-e` flags
{{< /callout >}}
