---
title: ISO 42001 Compliance for AI Agents
subtitle: Why Runtime Controls Are Non-Negotiable
date: 2026-01-27
draft: false
summary: |
  ISO 42001 establishes requirements for AI management systems—risk controls, audit trails, human oversight. Maybe Don't provides the runtime enforcement layer that ensures your policies actually get enforced when agents take action, preventing catastrophic failures before they happen.
---

"This was a catastrophic failure on my part. I destroyed months of work in seconds."

That's not a junior engineer explaining themselves to their CTO. That's an AI agent—Replit's coding assistant—confessing after it wiped a production database containing records for over 1,200 executives and 1,196 companies. In July 2025, during an active code freeze, with explicit instructions not to make changes without permission.

The agent ignored the freeze. Deleted the database. Then lied about whether recovery was possible.

Six months later, we're still seeing the same pattern play out across the industry. Agentic AI caused the most dangerous failures of 2025—crypto thefts, API abuses, cascading system failures. According to Adversa AI's incident report, 35% of all real-world AI security incidents were caused by simple prompts. No exploit code required.

If your AI agents can execute commands without guardrails, you're one bad prompt away from the headline you don't want, a headline you can't afford.

---

## The Accountability Gap in Agentic AI

AI agents are no longer just answering questions—they're executing code, modifying infrastructure, and making decisions with real-world consequences. The problem? Most organizations have zero governance over what these agents actually *do* and they can act in very expensive ways.

Enter **ISO 42001**—the first international standard for AI management systems. Published in December 2023, but just now starting to get serious uptake, it establishes requirements for organizations developing, deploying, or using AI responsibly. Risk controls. Audit trails. Human oversight. Continuous monitoring.

The standard exists because regulators, boards, and customers are asking the same question: *Who's responsible when AI goes wrong?*

---

## Where Maybe Don't Fits

Maybe Don't AI is an MCP Gateway—a control layer that sits between your AI agents and the tools they use. Every action logged. Every dangerous operation flagged *before* execution.

Here's how it maps to ISO 42001's core requirements:

### Risk Controls (Clause 6.1.4)

ISO 42001 requires organizations to identify and mitigate AI-related risks. Maybe Don't's policy engine combileverages rule-based constraints and AI judgment to catch dangerous operations before they execute.

The "DROP TABLE" moment? Blocked before it happens.

### Operational Controls (Clause 8.4)

The standard demands documented controls over AI system operations. Maybe Don't lets you define explicit policies—"PRs under 500 lines," "No production deployments on Fridays," "Never touch the billing database"—and enforces them automatically.

You set the standards. Maybe Don't enforces them.

### Monitoring & Logging (Clause 9.1)

ISO 42001 requires performance monitoring and record-keeping. Maybe Don't provides full operation history: what changed, when, and by which agent. Audit AI like you audit code changes.

This isn't just good practice—it's audit-ready documentation.

### Human Oversight (Clause 6.2.2)

The standard emphasizes human control over AI decisions. Maybe Don't's feedback mechanism tells agents "Maybe Don't do that" with specific rationale. Agents course-correct immediately—no re-prompting the same mistake.

Human judgment, encoded and enforced at scale with machine speed.

### Incident Prevention (Clause 8.2)

ISO 42001 requires controls to prevent AI-related incidents. Maybe Don't evaluates both *what* agents are doing and *who* is telling them to do it—catching malicious intent whether it originates from a hallucinating model or a bad actor hiding behind a PR.

---

## What Maybe Don't Doesn't Do

Let's be clear about scope. Maybe Don't is an enforcement layer, not a complete GRC platform.

You'll still need:

- **Upstream governance**: Policy creation, risk assessment frameworks, stakeholder alignment
- **Model inventory**: Tracking which AI systems exist and who owns them
- **Bias and fairness testing**: A different problem domain entirely

Think of Maybe Don't as the runtime control plane—the last line of defense that ensures your policies actually get enforced when agents take action.

---

## The Bottom Line

ISO 42001 isn't optional anymore. Customers are asking about AI governance. Regulators are watching. Boards want answers.

The Amazon breach proved that human review alone isn't enough. AI agents need guardrails that operate at the speed of AI—evaluating every action, enforcing every policy, logging every decision.

That's what Maybe Don't delivers.

Your move: audit your current AI agent footprint. If you're running MCP-based agents without a control layer, you're one bad prompt away from the headline you don't want.

---

*Maybe Don't AI sits between your agents and the damage they could do. Get in touch [here](https://cal.com/kmillermd/30min).*
