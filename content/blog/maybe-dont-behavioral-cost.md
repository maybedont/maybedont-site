---
title: Your AI Agent Had Permission. It Still Did It Wrong.
subtitle: The Category Nobody Is Talking About
date: 2026-03-04
draft: false
summary: |
  Access control and authority management are solved problems. But there's a third category nobody is talking about: behavioral cost. The gap between "allowed to act" and "acted well"—and why LLMs need a new layer of guardrails to catch it.
---

There's a conversation happening in every engineering org deploying AI agents right now, and it goes something like this: "How do we make sure the agent can't do anything it shouldn't?"

Good question. Wrong framing.

Access control is a solved problem. You know how to scope credentials, enforce least-privilege, rotate tokens. Your agent can only touch the systems you let it touch. That's table stakes, and your existing IAM tooling handles it fine.

Authority is similarly well-understood. You've defined which actions the agent is allowed to take — read but not write, update but not delete, query but not drop. Permissions, policies, approval gates. We've been building these systems for decades.

So you've locked down access. You've scoped authority. Your agent can only reach the database it's supposed to reach, and it's only allowed to modify records. You're covered, right?

Here's where it gets interesting.

You tell the agent to resolve a duplicate customer record. It has access to the database. It has authority to modify records. So it deletes 10,000 rows and re-inserts the correct one. Problem solved. Technically.

That's not an access violation. It's not an authority violation. No policy was breached. No permission was exceeded. The agent did exactly what it was allowed to do — it just did it in the most catastrophically disproportionate way imaginable. Ten thousand delete operations instead of one update. An irreversible sledgehammer where a scalpel would've done.

This is the category nobody is talking about: **behavioral cost**. The gap between "allowed to act" and "acted well."

Prompt validation doesn't catch this either. Prompt checks verify that the agent is doing the right *thing* — confirming intent, validating inputs, ensuring the task matches the user's request. They don't evaluate *method*. They don't ask whether the approach is proportionate, reversible, or efficient. They check the "what," not the "how."

And here's the part that makes this uniquely an AI problem: humans don't need guardrails against solving tasks in catastrophically expensive ways. A junior engineer might write slow code, but they don't instinctively reach for `DROP TABLE` when asked to update a row. Humans have an intuitive sense of proportionality. LLMs don't. They optimize for task completion, not for the cost of getting there. Every path that reaches the goal looks roughly equivalent from the model's perspective — and some of those paths are ruinous.

This is the space we built [Maybe Don't](https://maybedont.ai) to occupy. Not access control. Not authority management. The third thing — the layer that watches *how* your agent executes and flags when the approach is disproportionate, irreversible, or unnecessarily expensive before the damage is done.

Think of it as intelligent coaching for your agents. Observability that doesn't just log what happened, but understands whether what's *about to happen* is a reasonable way to accomplish the goal. Guardrails that know the difference between "you can't do that" and "you *can* do that, but maybe don't."

We're not angry at your agent. We're just disappointed.

If you're deploying agentic AI into systems where a wrong *method* costs as much as a wrong *action*, we should talk. **Book a demo at [maybedont.ai](https://maybedont.ai).**
