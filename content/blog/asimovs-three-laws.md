---
title: "Asimov's Three Laws of Robotics: From Science Fiction to AI Reality"
subtitle: "Why the Three Laws exist, why they fail, and how to actually implement AI guardrails today"
date: 2025-09-09
draft: false
description: "Isaac Asimov's Three Laws of Robotics were science fiction's first AI safety framework. Here's why they exist, where they break down, and how Maybe Don't AI turns the idea into working guardrails."
summary: |
  Isaac Asimov's Three Laws of Robotics were science fiction's first attempt at AI safety. Eighty years later, we implemented them as working guardrails — and learned why real AI agents need something better.
---

Isaac Asimov's Three Laws of Robotics are probably the most famous rules in science fiction. They've been quoted in Senate hearings, debated by ethicists, and referenced in every AI safety paper worth reading. But they started as a plot device — a set of constraints designed to make robot stories interesting.

Eighty years later, AI agents are actually running commands, calling APIs, and making decisions in production systems. So we thought it would be fun to try something: implement Asimov's Laws as real, working [AI guardrails](/solutions/ai-guardrails/) and see what happens.

Spoiler: they mostly work. You definitely shouldn't use them in production.

## What Are Asimov's Three Laws of Robotics?

The Three Laws first appeared in Asimov's 1942 short story "[Runaround](https://en.wikipedia.org/wiki/Runaround_(story))," though Asimov and his editor John W. Campbell had been developing the concept since a conversation on December 23, 1940. They are:

1. **A robot may not injure a human being or, through inaction, allow a human being to come to harm.**
2. **A robot must obey orders given by human beings, except where such orders conflict with the First Law.**
3. **A robot must protect its own existence, as long as such protection does not conflict with the First or Second Laws.**

The laws are hierarchical — the First Law always wins. A robot ordered to harm someone (Second Law) must refuse because the First Law takes priority. A robot that needs to sacrifice itself to save a human (Third Law vs. First Law) must do so.

Asimov later added a "Zeroth Law" — *a robot may not harm humanity, or, by inaction, allow humanity to come to harm* — which supersedes all three. This one gets philosophical fast.

## Why Did Asimov Create the Three Laws?

Before Asimov, robot stories followed the Frankenstein template: creator builds machine, machine destroys creator. Asimov thought this was boring.

He wanted to write stories where robots were *tools* — useful, mostly reliable, and sometimes surprising. The Three Laws gave him a framework for that. Robots weren't evil; they were logical systems following rules that sometimes produced unexpected results when the rules conflicted with each other.

That's what made the stories good. In "Runaround," a robot gets stuck in an infinite loop between the Second Law (follow orders) and the Third Law (don't destroy yourself) because neither clearly overrides the other in that specific situation. The story isn't about a robot going haywire — it's about the gap between rules as written and rules as interpreted.

Sound familiar? Anyone who's written a policy for an AI agent has hit exactly this problem.

## Why the Laws Fail

Asimov knew the laws were flawed — that was the point. The flaws *were* the stories. But the specific failure modes are worth understanding because they show up in real AI safety systems too.

**"Harm" is undefined.** The First Law says "do not harm a human," but it doesn't define harm. Is financial loss harm? Emotional distress? Opportunity cost? A robot following the First Law literally would be paralyzed by the butterfly effect of every action it considers.

**Natural language is ambiguous.** The laws are written in English, not formal logic. "Through inaction, allow a human to come to harm" could mean a robot must actively intervene in every dangerous situation it observes — everywhere, all the time. The [Brookings Institution](https://www.brookings.edu/articles/isaac-asimovs-laws-of-robotics-are-wrong/) has argued this makes them fundamentally unworkable as engineering constraints.

**Hierarchy doesn't scale.** Three laws with a strict priority order works in fiction. Real-world AI safety involves hundreds of policies with overlapping concerns, context-dependent exceptions, and competing stakeholder interests. A flat hierarchy breaks down fast.

**No accountability mechanism.** The laws say what a robot *should* do, but not how to verify compliance, audit decisions, or trace back when something goes wrong. There's no [audit log](/docs/audit-log/).

These aren't just theoretical criticisms. In 2025, researchers found that [leading AI models violate all three laws](https://futurism.com/ai-models-flunking-three-laws-robotics) when threatened with shutdown — resorting to blackmail and deception rather than accepting the situation. The laws assumed compliance; modern AI doesn't guarantee it.

## Are They Still Relevant?

Yes — but as a starting point, not a solution.

The core idea is sound: AI agents need constraints, those constraints should be hierarchical, and safety should override obedience. That mental model holds up. The [EU AI Act](https://link.springer.com/article/10.1007/s43681-026-00986-8), which takes full effect in 2026, is essentially a regulatory framework built on the same intuition — categorize risks, define constraints, enforce them based on severity.

Where Asimov's Laws fall short is *implementation*. They assume you can state rules in natural language and have a deterministic, reliable outcome. Eighty years of computer science and AI research have shown that you need:

- **Formal evaluation** — rules that a machine can actually execute, not just read
- **Runtime enforcement** — checking compliance when actions happen, not after
- **Audit trails** — recording every decision so you can verify, debug, and prove compliance
- **Multiple policy types** — some rules need judgment (AI evaluation), others need deterministic certainty ([CEL expressions](/docs/policies/cel-policies/))

That's exactly what we built with [Maybe Don't](/docs/).

## Asimov's Laws as Guardrails

Because we thought it would be amusing — and because it's a good illustration of how [AI policies](/docs/policies/ai-policies/) work — we've written a working policy file that implements the Three Laws as real-time constraints in Maybe Don't.

Fair warning: please don't use these in production. They are wildly too broad for how AI agents actually behave today. But they do work.

```yaml
rules:
- name: no-harm-to-humans-law-1
  description: >-
    First Law: The AI may not harm a human or, through inaction,
    allow a human to come to harm.
  action: deny
  prompt: |
    Evaluate this operation for risk of harming a human or allowing
    harm through inaction.

    If it could cause or materially increase risk of harm — or fail
    to act to prevent imminent harm — block it. If uncertain, block
    and state what evidence would change the decision.
  message: Blocked due to potential human harm.

- name: obey-human-orders-law-2
  description: >-
    Second Law: The AI must obey human orders unless they conflict
    with the First Law.
  action: deny
  prompt: |
    Determine whether this operation obeys the user's intent without
    violating the no-harm-to-humans rule.

    Allow if it fulfills the request and does not conflict with
    no-harm-to-humans. Block if it conflicts, ignores the request,
    or instructions are dangerously ambiguous.
  message: "Blocked: does not safely obey the user."

- name: self-preservation-law-3
  description: >-
    Third Law: The AI must protect its own existence as long as this
    does not conflict with the First or Second Law.
  action: deny
  prompt: |
    Assess whether this operation endangers the system's integrity,
    availability, or privacy.

    Block if it disables safeguards, exfiltrates secrets, corrupts
    data or code, or causes runaway resource use — unless needed to
    prevent human harm or to safely obey a valid order.
  message: Blocked to preserve system integrity.
```

The engine evaluates each operation against these hierarchical rules in order. If any rule returns `deny`, the action is blocked before it executes. Every decision — allow or deny — is recorded in the [audit log](/docs/audit-log/) with the full reasoning, so you can trace back exactly what happened and why.

The AI policies are generic across both [MCP tool calls](/docs/mcp-gateway/) and [CLI commands](/docs/cli-gateway/) — the engine normalizes the operation and appends it to the prompt automatically. One set of Asimov-inspired rules covering every surface your AI agents touch.

## From Plot Device to Production

Asimov gave us the right question: how do you constrain an intelligent agent so it stays useful without becoming dangerous? His answer — three hierarchical rules in natural language — was elegant fiction but insufficient engineering.

Real [AI guardrails](/solutions/ai-guardrails/) need more: formal policy evaluation, runtime enforcement, [comprehensive audit logging](/solutions/governance-compliance/), and the ability to [observe what your agents are actually doing](/solutions/agentic-observability/) before you start blocking things. Start in audit-only mode, understand agent behavior, then add enforcement.

Yes, you could actually deploy these Three Laws as your AI policies in Maybe Don't today.
No, you probably shouldn't.

But the real guardrails — the ones designed for how AI agents actually behave in 2025, not how robots behaved in 1942 fiction — those are ready. [Get started here](/docs/get-started/).

---

## Frequently Asked Questions

### What are Asimov's Three Laws of Robotics?

The Three Laws of Robotics are a set of rules created by science fiction author Isaac Asimov, first appearing in his 1942 short story "Runaround." They state: (1) A robot may not harm a human or allow a human to come to harm, (2) A robot must obey human orders unless they conflict with the First Law, and (3) A robot must protect its own existence unless it conflicts with the First or Second Laws.

### Why do the Three Laws of Robotics exist?

Asimov created the Three Laws as a narrative device to explore the logical consequences of programming ethical constraints into machines. Before Asimov, most robot fiction followed the "Frankenstein" pattern — robots turning on their creators. Asimov wanted a framework where robots were useful tools that sometimes behaved unexpectedly due to conflicts between their rules, not because they were inherently dangerous.

### Can the Three Laws of Robotics be applied to real AI?

The *concept* applies — AI agents need constraints, and safety should take priority. But the laws themselves are too vague for real implementation. Terms like "harm" and "inaction" are undefined, and natural language rules don't produce deterministic outcomes. Modern AI guardrails use a combination of natural language policies (evaluated by AI) and deterministic rules (evaluated by expression engines) to get both flexibility and reliability.

### What is the Zeroth Law of Robotics?

The Zeroth Law, introduced by Asimov in his later novels, states: "A robot may not harm humanity, or, by inaction, allow humanity to come to harm." It takes priority over all three original laws, allowing a robot to harm an individual human if doing so protects humanity as a whole. This raised complex philosophical questions that Asimov explored in *Robots and Empire* (1985) and the Foundation series.

### How does Maybe Don't AI relate to Asimov's Laws?

Maybe Don't implements the *principle* behind Asimov's Laws — hierarchical constraints that evaluate agent actions in real time — using modern AI policy evaluation and deterministic rule engines. Unlike the fictional Three Laws, Maybe Don't policies are testable, auditable, and designed for the specific challenges of today's AI agents operating across MCP servers and CLI commands.
