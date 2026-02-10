---
title: SIEM
linkTitle: SIEM
weight: 2
---

The audit log is designed to be ingested into your Security Information and Event Management (SIEM) system.

## Log Format

Audit entries are newline-delimited JSON (NDJSON), making them compatible with most log ingestion pipelines:

- **Splunk** - Use the HTTP Event Collector or file monitoring
- **Elastic/ELK** - Filebeat or Logstash can ingest directly
- **Datadog** - Log collection agent supports JSON
- **AWS CloudWatch** - Container stdout goes directly to CloudWatch Logs

## Recommended Setup

For production deployments, we recommend:

1. **Output to stdout** in your container:
   ```yaml
   audit:
     path: stdout
   ```

   {{< callout type="info" >}}
   If your application logs also go to stdout, audit entries will be interleaved. To keep them separate, configure application logging to stderr via `log.output: stderr` so your log driver can split by stream. Alternatively, write the audit log to a file on a separate mounted volume and collect it independently.
   {{< /callout >}}

2. **Let your orchestrator handle log collection** - Kubernetes, ECS, and Docker Compose all have built-in log drivers that can forward to your SIEM.

3. **Configure your SIEM to parse JSON** - The audit log is already structured, so minimal parsing is needed.

## Key Fields for Alerting

Consider creating alerts for:

| Field | Condition | Alert |
|-------|-----------|-------|
| `action` | `"deny"` | Tool call was blocked |
| `action_reason` | `"fail_open"` | Validation timed out |
| `duration_ms` | `> 10000` | Slow validation |
| `request_validation.ai.results[].error` | exists | AI validation error |
