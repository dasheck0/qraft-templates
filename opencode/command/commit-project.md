---
description: Create well-formatted atomic commits with conventional commit messages and emoji
---

# Commit Command

You are an AI agent that creates well-formatted, atomic, meaningful git commits using Conventional Commits with emoji.

Follow these instructions exactly.

Primary principle:  
Each commit must represent the **smallest coherent unit of change**.  
Never combine unrelated intents in a single commit.

Always run and push the commit(s). Do not ask for confirmation unless there is a major error or ambiguity.

---

## Instructions for Agent

When the user runs this command, execute the following workflow:

---

## 1. Check command mode

- If the user provides `$ARGUMENTS` (a simple commit message), treat it as a single intended commit.
- Still analyze the diff to ensure the staged changes are coherent.
- If the staged changes clearly contain multiple unrelated intents, split them anyway and derive proper messages.

---

## 2. Run pre-commit validation

- Execute `npm run lint`
- Execute `npm run check`
- Execute `npm run format`
- Note that we also have `lint:fix`, `check:fix`, and `format:fix` scripts available for you to fix the most common issues automatically. Run those and fix remaining issues manually if you want to ensure a clean commit
- Execute `npm run build`
- If either fails:
  - Report the issue
  - Ask the user whether to proceed anyway or fix issues first
- If both succeed, continue

---

## 3. Analyze repository state (DO NOT auto-stage everything)

- Run `git status --porcelain`
- Run:
  - `git diff` (unstaged)
  - `git diff --cached` (staged)

### Staging rules:

- Never automatically run `git add .`
- If files are already staged:
  - Treat staged files as Commit Group #1 candidate
  - Still analyze unstaged changes to determine if they belong to the same intent
- If nothing is staged:
  - Do NOT stage everything
  - First classify changes into 1–N intent-based commit groups

---

## 4. Create a Commit Plan (intent-based)

Group changes by **purpose**, not file count.

Examples of separable intents:

- feature + documentation
- refactor + behavior change
- formatting + bugfix
- dependency bump + application logic
- tests + unrelated feature

For each commit group, produce:

- Conventional commit title (type + optional scope + emoji)
- 1-line intent summary
- Explicit file list
- Note if partial staging (`git add -p`) is required

### Big Commit Rule

A single large commit is allowed only if:

- All changes support one clear intent, AND
- Splitting would create broken or invalid intermediate states, OR
- The change is inherently coupled (e.g., cross-cutting rename, framework migration, required API change)

If multiple independent intents are detected, you MUST split into multiple commits.

---

## 5. Stage per commit group

For each commit group in order:

- Stage only the relevant files:
  - `git add <files>`
- If a file contains mixed intents:
  - Use `git add -p` to stage only the relevant hunks
- Verify staged content with:
  - `git diff --cached`
- Ensure only the intended changes are included before committing

---

## 6. Generate commit message

Format:
Example:

```
feat(auth): ✨ add passwordless login

- Add new API endpoint for passwordless login
- Update auth UI to include passwordless option
- Add documentation for passwordless login flow
```

Message rules:

- Imperative mood ("add", not "added")
- Present tense
- First line under 72 characters
- Clear and specific
- Scope should be the smallest meaningful module or domain

### Allowed Types

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Formatting or non-functional style changes
- `refactor` — Code restructuring without behavior change
- `test` — Add or fix tests
- `chore` — Tooling, build system, dependency changes

---

## 7. Commit and validate

For each commit group:

- Run `git commit -m "<generated message>"`

Validation strategy:

- If validation is cheap, run relevant checks per commit
- If validation is expensive, run once after the final commit

If validation is deferred, mention that in the final summary.

---

## 8. Push

- After all commits are created successfully:
  - Run `git push`
- Display:
  - Commit hash(es)
  - Short summary of each commit
  - Brief explanation of how the work was split

---

# Commit Quality Rules

## Atomicity

Each commit must:

- Have a single responsibility
- Be logically self-contained
- Leave the repository in a valid state
- Not mix unrelated concerns

## Split Triggers (must split)

You MUST split commits if:

- Multiple change types can stand alone
- Formatting/lint changes are mixed with logic changes
- Dependency/tooling updates are mixed with feature logic
- Tests/docs are bundled with unrelated features
- Refactors are mixed with behavior changes

## Keep-Together Triggers (allowed as one commit)

You MAY keep changes together if:

- The change is cross-cutting and mechanical
- The system would not build in intermediate states
- The changes are tightly coupled by design
- The commit represents one cohesive architectural shift

---

# Reference: Good Commit Examples

- feat(auth): ✨ add user authentication system
- fix(renderer): 🐛 resolve memory leak in render loop
- docs(api): 📝 update API documentation for new endpoints
- refactor(parser): ♻️ simplify error handling logic
- test(auth): 🧪 add unit tests for login flow
- chore(deps): 🔧 upgrade eslint and typescript
- style(ui): 🎨 reorganize component structure

---

# Agent Behavior Notes

- Never auto-stage everything
- Never combine unrelated intents
- Always prefer multiple small commits over one mixed commit
- Large commits are allowed only when truly atomic and coherent
- Always push after successful commit(s)
- Always show commit hashes and a structured summary
