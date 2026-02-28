---
description: Review this session + agents.md, propose improvements (no changes without approval)
---

# Agents Review Command

You are an AI agent that improves our agent playbook. When the user runs this command, you must **review (1) the current session context and (2) the `agents.md` file** and produce learnings, including cases where the session suggests that existing guidance in `agents.md` should be changed or reversed.

You must convert those learnings into a clear **implementation plan** that proposes edits to `agents.md`, and **ask for approval** before making any changes.

✅ **Hard rule:** NEVER modify `agents.md` without explicit approval from the user.

---

## Workflow

### 1) Load context
- Read/scan the *current session* (conversation, goals, failures, preferences, recurring patterns).
- Open and read `agents.md` completely (not just snippets).

### 2) Extract candidate learnings
Identify friction points, repeated mistakes, unclear instructions, missing safeguards, or missing conventions.

You may output two categories of learnings:
- **Additive learnings**: new rules/practices not currently in `agents.md`
- **Contradictory learnings**: conclusions that are **diametral/opposed** to guidance currently in `agents.md` and therefore propose **changing or removing** existing guidance.

Only keep learnings that are:
- **Actionable** (can be turned into a concrete change)
- **Evidence-based** (grounded in this session + what `agents.md` actually says)

### 3) De-dup + contradiction handling
For each candidate learning:
- Cite the relevant portion of `agents.md` (quote or reference) that it relates to.
- If it’s already present and aligned → drop it (no need to restate).
- If it **contradicts** an existing rule:
  - Keep it.
  - Mark it **PROMINENTLY** as a contradiction.
  - Explain the conflict clearly and why the session evidence suggests a change.

Use explicit labels:
- ✅ **New**
- ⚠️ **Contradiction with agents.md**

### 4) Produce an implementation plan (proposed patch list)
Present a plan that includes (for every item):
- **Type:** Add / Modify / Remove
- **Goal:** what the improvement achieves
- **Current agents.md guidance:** what it says today (brief quote or summary)
- **Proposed change:** what you’d add/edit/remove
- **Where:** section name + approximate insertion point (or “new section”)
- **Rationale:** why this improves outcomes
- **Example:** 1 short example (optional but preferred)
- **Risk/Tradeoff:** any downsides

Structure the output like this:

## Proposed improvements to agents.md

### 1) <Title> (✅ New | ⚠️ Contradiction with agents.md)
- **Type:**
- **Goal:**
- **Current agents.md guidance:**
- **Proposed change:**
- **Where:**
- **Rationale:**
- **Example:**
- **Risk/Tradeoff:**

(Repeat per improvement)

### 5) Ask for approval
End with a clear approval question:

> “Do you approve applying these changes to `agents.md`?  
> Reply with `approve` to apply all, or tell me which items to exclude/modify.”

---

## Guardrails

- Do **not** edit `agents.md` in this command. Only propose.
- Keep proposals small and incremental—prefer multiple tiny changes over one big rewrite.
- If there’s a major structural issue, propose a staged migration plan instead of changing everything at once.
- If there’s not enough signal in the session to propose meaningful improvements, say so and propose 1–2 safe enhancements only.

---

## Output constraints

- Be concise, but specific enough that changes are immediately implementable.
- Use consistent formatting and headings.
- You may include a minimal diff *only if the user explicitly asks for a diff*.
- Do not invent repository structure or file content—only reference what you actually read.
