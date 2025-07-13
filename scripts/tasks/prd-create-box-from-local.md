# Product Requirements Document (PRD)

## Feature: `qraft create` - Create Box from Local Directory

---

### 1. Introduction / Overview

The `qraft create` command enables developers to create template boxes from local directories and publish them to configured registries. This feature solves the problem of developers having useful local templates but no easy way to share them, while also simplifying the current manual box creation process. The command bridges the gap between local development and template distribution by handling the entire workflow from local content to published template.

---

### 2. Goals

- Enable creation of template boxes from local directories
- Provide seamless publishing workflow to GitHub-based registries  
- Handle intelligent conflict resolution with diff visualization
- Generate appropriate metadata automatically with override capabilities
- Support users without write access through automated pull request workflow
- Work directly with files without requiring local VCS
- Provide interactive experience with smart defaults and user control
- Support flexible box naming and nested structures (e.g., scripts/aws/lambda)

---

### 3. User Stories

- As a developer, I want to create a box from my local directory so I can share my useful templates with others.
- As a developer, I want the CLI to show me exactly what changed when I update an existing box so I can make informed decisions.
- As a developer, I want to contribute to a registry even if I don't have write access by having PRs created automatically for me.
- As a developer, I want the CLI to detect smart defaults for metadata but let me override everything.
- As a developer, I want to organize my boxes in nested structures like `scripts/aws/lambda` for better categorization.
- As a developer, I want to be warned about sensitive files before accidentally publishing them.

---

### 4. Functional Requirements

#### 4.1 Core Functionality

1. **Local Directory Processing**
   - Accept local directory path as input (directories only, not single files)
   - Validate that the path exists and is accessible
   - Support both relative and absolute paths
   - Work directly with files without requiring local git repository

2. **Box Naming and Structure**
   - Support nested box names (e.g., `scripts/aws/lambda`, `configs/docker/node`)
   - Derive default box name from directory name if not provided
   - Allow users to override default naming completely
   - Support flexible registry organization structures

3. **Metadata Generation with Smart Detection**
   - Auto-detect file types for tags (e.g., "typescript", "config", "docs")
   - Analyze directory structure for defaultTarget suggestions
   - Identify common exclusion patterns based on content
   - Allow complete override of all detected values
   - Prompt for all metadata showing detected values as defaults

#### 4.2 Conflict Resolution

4. **Intelligent Conflict Handling**
   - Compare existing boxes using full directory tree diff with content analysis
   - Show git-style diff output when conflicts detected
   - Present user with clear options: overwrite, version bump, or cancel
   - Use simple heuristics for version suggestions with user confirmation

5. **Change Analysis**
   - Analyze file additions, deletions, and modifications
   - Suggest version bump type based on changes
   - Always require user confirmation for suggested version changes
   - Provide clear summary of what will change

#### 4.3 Permission and Repository Management

6. **Write Access Handling**
   - Check user's write permissions to target repository
   - For users without write access: automatically create PR with generated description
   - Provide PR URL and basic next steps after creation
   - Handle repository forking automatically when needed

7. **Sensitive File Protection**
   - Scan for common sensitive file patterns (.env, keys, secrets, etc.)
   - Warn user and ask for confirmation before proceeding
   - Provide clear list of potentially sensitive files found
   - Allow user to exclude files or proceed with warning

#### 4.4 User Experience

8. **Interactive Mode (Default)**
   - Always prompt for confirmations and missing inputs
   - Show detected defaults for all metadata fields
   - Allow users to accept, modify, or completely override defaults
   - Provide clear progress indicators throughout process

9. **Command Interface**
   ```bash
   qraft create <path> [box-name]
   
   # Examples:
   qraft create ./my-scripts
   qraft create ./aws-configs scripts/aws/lambda
   qraft create ./docs --registry myorg/templates
   ```

10. **Validation and Error Handling**
    - Validate local path accessibility
    - Check registry connectivity and authentication
    - Provide actionable error messages with suggested fixes
    - Handle network failures and API rate limits gracefully

---

### 5. Technical Requirements

#### 5.1 Command Options

- `--registry <registry>` - Target registry (default: configured default)
- `--name <name>` - Override box name (default: derived from directory)
- `--description <desc>` - Override detected description
- `--version <version>` - Override version (default: 1.0.0 for new, analyzed for existing)
- `--tags <tags>` - Override detected tags
- `--force` - Skip confirmation prompts
- `--dry-run` - Show what would be created without executing
- `--exclude <patterns>` - Additional exclusion patterns

#### 5.2 Smart Detection Capabilities

- **File Type Analysis**: Detect TypeScript, JavaScript, Python, Docker, etc.
- **Structure Analysis**: Identify common project patterns for defaultTarget
- **Exclusion Patterns**: Auto-detect node_modules, .git, build artifacts
- **Sensitive Files**: Scan for .env, keys, tokens, credentials

#### 5.3 Metadata Template

```json
{
  "name": "derived-from-path-or-specified",
  "description": "prompted-with-smart-suggestions",
  "author": "git-config-user-or-prompted", 
  "version": "1.0.0-or-analyzed-increment",
  "tags": ["auto-detected-with-overrides"],
  "defaultTarget": "suggested-from-structure",
  "exclude": ["standard-plus-detected-patterns"],
  "postInstall": "generated-if-applicable"
}
```

---

### 6. Non-Goals (Out of Scope)

- Single file box creation (directories only)
- Multiple path processing in single command
- Advanced templating with variable substitution
- Automatic dependency detection and management
- GUI interface for box creation
- Integration with package managers other than npm

---

### 7. Success Metrics

- Users can create boxes from local directories in under 3 minutes
- 85% of metadata can be auto-detected with meaningful defaults
- Conflict resolution provides clear understanding of changes in 95% of cases
- Pull request workflow works seamlessly for contributors without write access
- Sensitive file detection prevents accidental exposure in 99% of cases

---

### 8. Implementation Considerations

#### 8.1 Security
- Comprehensive sensitive file pattern matching
- Secure token handling for GitHub authentication
- Input validation and path sanitization
- Respect repository permissions and access controls

#### 8.2 User Experience
- Clear, actionable prompts with good defaults
- Progress indicators for long operations
- Helpful error messages with suggested solutions
- Consistent interaction patterns with existing commands

#### 8.3 Reliability
- Atomic operations where possible
- Comprehensive error handling and recovery
- Validation of repository state before and after operations
- Graceful handling of network issues and API limits

---

### 9. Open Questions

- Should we support batch operations for multiple directories in future versions?
- How should we handle very large directories (size limits, warnings)?
- Should we integrate with existing CI/CD workflows for automated box updates?
- What additional smart detection patterns would be most valuable?
