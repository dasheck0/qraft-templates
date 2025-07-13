 
# Product Requirements Document (PRD)

## Feature: `unbox` Template Unboxer CLI

---

### 1. Introduction / Overview

`unbox` is a Node-based CLI tool designed to simplify the process of applying standardized project templates, known as "boxes," at any stage of development. These boxes can contain context-engineering files, documentation scaffolds, or other reusable resources. Unlike traditional project generators limited to setup phases, `unbox` allows pulling these boxes anytime during a project's lifecycle. The tool targets personal workflows initially, with future plans for open-source expansion and community-driven template sharing.

---

### 2. Goals

- Provide an easy-to-use CLI to "unbox" pre-configured file sets (boxes) into projects.
- Support applying boxes both during project setup and mid-development.
- Allow listing available boxes with descriptions.
- Enable interactive box selection and preview via CLI.
- Design with extendability so others can fork and add custom boxes.
- Prepare for potential future use of scoped packages for box distribution (e.g., `@username/n8n`).

---

### 3. User Stories

- As a developer, I want to pull the `.tasks` directory into my project so I can kick off my AI workflow.
- As a developer, I want to pull `readme` starter files to bootstrap project documentation.

---

### 4. Functional Requirements

1. The system must allow users to pull a specific box into the current directory:
   ```
   npx unbox --dir .tasks
   ```
2. The system must allow pulling boxes with default target locations to simplify usage:
   ```
   npx unbox n8n
   ```
3. The system must support listing all available boxes with short descriptions:
   ```
   npx unbox list
   ```
4. The system must provide an interactive mode using Inquirer for box selection and detailed previews:
   ```
   npx unbox -i
   ```
5. The system must support specifying a custom target directory:
   ```
   npx unbox --dir .n8n --target ./my-subfolder
   ```
6. The system must confirm before overwriting existing files unless a `--force` flag is provided.
7. The system must read a `manifest.json` inside each box to obtain metadata (e.g., description, usage notes) for interactive mode.
8. The manifest file must not be copied into the target project.
9. The system must provide clear, styled output messages (e.g., success, errors) but keep it minimal and professional.
10. The system must handle missing boxes or invalid names with helpful error messages.

---

### 5. Non-Goals (Out of Scope)

- No GUI interface; CLI-only in this version.
- No advanced templating logic like variable replacements or dynamic content generation.
- No remote fetching of templates from GitHub or other sources (local file-based only).

---

### 6. Design Considerations (Optional)

- Use basic colored console output for success, error, and info messages (e.g., `chalk`).
- Interactive mode to use `inquirer` for intuitive navigation.
- Boxes organized as directories within the repo, each containing files and a `manifest.json`.
- Allow others to fork the tool and maintain their own boxes directory.
- Explore potential for npm-scoped packages in the future (e.g., `@dasheck0/n8n`).

---

### 7. Technical Considerations (Optional)

- CLI implemented with Node.js, packaged to run via `npx`.
- Use `fs-extra` for safe file operations and directory copying.
- Modular structure to separate core logic, CLI handling, and box management.
- Manifest example structure:
  ```json
  {
    "name": "n8n",
    "description": "Standard files for n8n backend projects",
    "author": "Your Name",
    "version": "1.0.0"
  }
  ```

---

### 8. Success Metrics

- After running `npx unbox --dir .tasks`, the corresponding files appear in the project.
- Interactive mode (`npx unbox -i`) successfully lists and applies boxes.
- Overwrite protection works as intended, prompting users before file replacement.
- Clear console output confirms successful operations or errors.
- No unnecessary files (e.g., `manifest.json`) are copied to the target.

---

### 9. Open Questions

- Should interactive mode support filtering boxes by tags or categories in the future?
- How will versioning of individual boxes be handled if the tool expands to scoped packages?
- Should default target locations for common boxes be configurable?
