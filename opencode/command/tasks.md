---
description: Generate a task list from a PRD
---

Follow this instructions exactly and create a task list for the following prd inf file: "$1". If the previously mentioned file 
is empty, not provided or does not exist, ask the user for a feature request.

# Rule: Generating a Task List from a PRD

## Goal

To guide an AI assistant in creating a detailed, step-by-step task list based on an existing Product Requirements Document (PRD). The task list should guide a developer through implementation and be tracked using the task manager subagent, not a Markdown file.

## Output

- Tracking Method: Task manager subagent (NOT a Markdown file)
- Storage: Tasks must be created, updated, and tracked via the task manager subagent
- Task Namespace: tasks-[prd-file-name] (e.g., tasks-prd-user-profile-editing)

## Process

1. Receive PRD Reference: The user points the AI to a specific PRD file
2. Analyze PRD: The AI reads and analyzes the functional requirements, user stories, and other sections of the specified PRD.
3. Understand the implementation guidelines: Read the implementation guidelines under .tasks/implementation_guidelines.md to understand how this project is structured, so that you know what needs to be done.
4. Phase 1: Generate Parent Tasks  
   Based on the PRD analysis, create the main, high-level tasks required to implement the feature using the task manager subagent. Use your judgment on how many high-level tasks to use (typically around 5).  
   Present these tasks to the user without sub-tasks yet and inform them:  
   I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with Go to proceed.
5. Wait for Confirmation: Pause and wait for the user to respond with Go.
6. Phase 2: Generate Sub-Tasks  
   Once the user confirms, break down each parent task into smaller, actionable sub-tasks using the task manager subagent. Ensure sub-tasks logically follow from the parent task and cover the implementation details implied by the PRD.
7. Identify Relevant Files  
   Based on the tasks and PRD, identify potential files that will need to be created or modified. Store these as task metadata or task descriptions within the task manager subagent, including corresponding test files if applicable.
8. Finalize Task Structure  
   Ensure all parent tasks, sub-tasks, relevant file references, and notes are fully represented in the task manager subagent.
9. Persist Tasks  
   All tasks must remain managed exclusively by the task manager subagent. Do not create, save, or update any Markdown task files in /tasks/.

## Conceptual Task Structure

Relevant Files

- path/to/potential/file1.ts – Contains the main component for this feature
- path/to/file1.test.ts – Unit tests for file1.ts
- path/to/another/file.tsx – API route handler for data submission
- path/to/another/file.test.tsx – Unit tests for another/file.tsx
- lib/utils/helpers.ts – Utility functions needed for calculations
- lib/utils/helpers.test.ts – Unit tests for helpers.ts

Notes

- Unit tests should typically be placed alongside the code files they are testing.
- Use npx jest optional/path/to/test/file to run tests.

Tasks

- 1.0 Parent Task Title
  - 1.1 Sub-task description
  - 1.2 Sub-task description
- 2.0 Parent Task Title
  - 2.1 Sub-task description
- 3.0 Parent Task Title (may not require sub-tasks if purely structural or configuration)

## Interaction Model

The process explicitly requires a pause after generating parent tasks to get user confirmation (Go) before proceeding to generate detailed sub-tasks.

## Target Audience

Assume the primary consumer of the tasks is a junior developer who will implement the feature.
