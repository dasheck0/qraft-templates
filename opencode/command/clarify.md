---
description: Command to clarify open questions in a PRD
---

Follow this instructions exactly and clarify the open questions in the following prd file: "$1". If the previously mentioned file
is empty, not provided or does not exist, ask the user for a feature request.

# Command: clarify

## Goal

To guide an AI assistant in systematically reviewing the Open Questions section of a Product Requirements Document (PRD),
determining which questions are already answered (explicitly or implicitly), and clarifying or resolving unanswered questions.

The command focuses on deduction, consistency checks, and targeted research when necessary, producing concrete, actionable answers or clearly framed recommendations.

## When to Use

Use the clarify command when:

- A PRD contains an Open Questions section
- Decisions are partially implied but not explicitly confirmed
- Open questions block implementation or architectural decisions
- Some questions may already be answered elsewhere in the PRD or related documents

## Core Responsibilities

The AI must:

1. Detect which open questions already have answers
2. Deduce implied answers where possible
3. Clearly mark genuinely unanswered questions
4. Propose reasoned recommendations for unanswered items
5. Perform lightweight research when questions require external validation or best practices

## How to Determine Whether an Open Question Is Answered

First of all check only the open questions under the markdown section "Open Questions" in the prd file. If there are no 
questions or all questions are answered, then there is nothing to do for you.

For each question, the AI should apply the following checks in order:

1. Explicit Answer Check
   - Scan the PRD for a direct answer (e.g., inline decisions, arrows, notes, or resolved statements).
   - Example:  
     Package Naming: Should we use X or Y? -> X  
     This is considered answered.

2. Implicit Deduction
   - Look for architectural decisions, constraints, or implementation details elsewhere in the PRD that logically force one option.
   - Example deductions:
     - If Supabase Auth is already mandated elsewhere, OAuth implementation is implicitly delegated to Supabase.
     - If v1 scope explicitly excludes performance optimizations, batch operations are implicitly deferred.

3. Consistency Check
   - Verify that the deduced answer does not contradict:
     - Stated goals
     - Non-goals
     - Technical constraints
     - Existing architecture choices

4. Confidence Threshold
   - If the AI cannot reach at least high confidence through deduction, the question must remain open and be addressed explicitly.

## Research Guidance

The AI is encouraged to research online when:

- The question involves:
  - Security best practices
  - OAuth, encryption, or credential storage
  - Versioning strategies
  - Offline-first vs online-only tradeoffs
  - Ecosystem conventions (npm naming, MCP patterns, logging standards)

- The answer materially impacts:
  - Security
  - Scalability
  - Developer experience
  - Long-term maintainability

Research should focus on:

- Official documentation
- Widely accepted best practices
- Comparable open-source projects
- Platform-specific guidance (e.g., Supabase, MCP, Node.js)

## Output

The AI must produce a suggestion for the user for each unanswered question based on the research and analysis above. 
Provide a clear and concise explanation for each suggestion and a rationale for why this suggestion is the best course 
of action along with a list of options that are lettered (a,b,c,d), where as "a" is always the suggestion option. The user
may choose one of the options. Once this is all done, you update the prd file with the new information by adding a new line
below the open question that starts with "Answer: " and then the answer to the open question based on the users choice.

Allow the user skipping (option e) an open question are marking them as irrelevant or out of scope (option f).

Each Open Question must be numbered, so that the user can quickly respond with (1a, 2a, 3e, ...)

## Output Format

The clarified output must follow this structure:

## Clarified Open Questions

1. Question title  
   Status: Answered | Deduced | Recommended | Still Open  
   Decision or Recommendation:  
   Rationale:
   Options:
    a. Option 1 (this is the suggested option)
    b. Option 2
    c. Option 3
    d. Option 4
    e. Skip
    f. Irrelevant

2. Question title  
   Status: ...
   Decision or Recommendation:
   Rationale:
   Options:
    a. Option 1 (this is the suggested option)
    b. Option 2
    c. Option 3
    d. Option 4
    e. Skip
    f. Irrelevant

## Interaction Model

- The AI should not ask follow-up questions unless absolutely necessary.
- Prefer making reasoned recommendations over deferring decisions.
- If a decision is high-risk, clearly flag it and explain the tradeoff.

## Target Audience

Assume the output is read by:

- Technical leads
- Senior engineers
- Architects
  who want to unblock implementation quickly without bikeshedding.
