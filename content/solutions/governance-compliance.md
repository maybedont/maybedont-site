---
title: "Governance & Compliance — Meet Regulatory Standards for AI Agents"
linkTitle: "Governance & Compliance"
weight: 3
description: "Governance and compliance for agentic AI. Maybe Don't helps you meet ISO 42001, SOX, HIPAA, and FINRA requirements with policy enforcement, audit trails, and human oversight."
---

Regulators are catching up to agentic AI. ISO 42001, SOX, HIPAA, FINRA — frameworks across industries now require documentation, controls, and human oversight for AI systems that take actions on your behalf. If your AI agents interact with production systems, customer data, or regulated infrastructure, you need provable governance.

Maybe Don't gives you the controls and the evidence. Policies enforce your rules. Audit logs prove they were followed.

## The Regulatory Landscape

### ISO 42001
The international standard for AI management systems requires organizations to identify AI risks, implement operational controls, maintain monitoring and logging, and ensure human oversight of AI decisions. Maybe Don't addresses each of these requirements directly.

### SOX (Sarbanes-Oxley)
Financial reporting integrity requires traceability for any automated system that touches financial data. If AI agents access accounting systems, modify records, or generate reports, every action must be auditable.

### HIPAA
Healthcare organizations must track every access to protected health information, including accesses made by AI agents. Audit trails must capture who accessed what, when, and for what purpose.

### FINRA
FINRA's 2026 oversight priorities explicitly include AI governance, requiring firms to capture prompts, outputs, and version histories to support supervision, audits, and investigations of AI-driven operations.

### GDPR
When AI agents process personal data, data protection regulations require documentation of automated decision-making, lawful basis for processing, and the ability to explain decisions to affected individuals.

## How Maybe Don't Helps

### Policy enforcement as documented controls
Your policies aren't just configuration — they're your documented controls. Each policy is a clear statement of what your AI agents can and cannot do, evaluated on every operation. Auditors can review your policies to understand your control framework.

### Audit trails as evidence
Every operation your AI agents perform is logged with complete context: what was requested, which policies were evaluated, what they decided, and why. This is the evidence that your controls are working — not a claim, but a verifiable record.

### Human oversight through review
Audit logs enable after-the-fact human review of AI decisions. Compliance frameworks require that humans can intervene, review, and adjust. Maybe Don't's audit data gives reviewers the full picture for any operation.

### Audit-only mode for assessment
Before enforcing policies, run in audit-only mode to understand your current risk exposure. See what agents are doing, identify gaps in your controls, and build your governance framework based on observed behavior rather than assumptions.

## ISO 42001 Mapping

| ISO 42001 Requirement | How Maybe Don't Addresses It |
|----------------------|----------------------------|
| **Risk Controls (6.1.4)** | Policies define risk thresholds. Audit logs document which risks materialized and how policies addressed them. |
| **Operational Controls (8.4)** | Policy engine enforces controls on every agent operation. Policy definitions serve as documented procedures. |
| **Monitoring & Logging (9.1)** | Comprehensive audit logging captures every MCP tool call and CLI command with full evaluation context. |
| **Human Oversight (6.2.2)** | Audit logs enable human review. Policy adjustments based on observed behavior demonstrate active oversight. |
| **Continual Improvement (10.1)** | Audit data reveals patterns — what gets blocked, what gets allowed, where policies need refinement. |

Read more about [ISO 42001 compliance with Maybe Don't](/blog/iso-42001-compliance-runtime-controls/).

## FAQ

**Does Maybe Don't make us "compliant"?**
No tool can make you compliant on its own. Compliance requires organizational processes, policies, and documentation beyond any single product. Maybe Don't provides the runtime controls and audit evidence that support your compliance program.

**What compliance evidence does Maybe Don't produce?**
Structured audit logs for every AI agent operation, including timestamps, agent identity, operation details, policy evaluations, decisions, and reasoning. These logs can be forwarded to your SIEM or compliance platform. See the [log schema reference](/docs/audit-log/log-schema/).

**Can auditors access the audit data directly?**
Audit logs are structured JSON records written to your configured destination. You control access, retention, and distribution through your existing infrastructure.

**How does audit-only mode support compliance readiness?**
Audit-only mode logs everything without blocking. This lets you assess your current AI agent risk landscape, identify control gaps, and build policies based on observed behavior — all before enforcement begins.

---

Build your AI governance framework. [Get started](/docs/get-started/) or [book a demo](https://cal.com/kmillermd/30min).
