## Relevant Files

- `src/commands/create.ts` - Main command handler for the `qraft create` command
- `src/commands/create.test.ts` - Unit tests for the create command
- `src/core/localDirectoryProcessor.ts` - Handles local directory scanning, validation, and content processing
- `src/core/localDirectoryProcessor.test.ts` - Unit tests for local directory processor
- `src/core/metadataGenerator.ts` - Smart detection and generation of box metadata
- `src/core/metadataGenerator.test.ts` - Unit tests for metadata generator
- `src/core/conflictResolver.ts` - Handles conflict detection and resolution workflows
- `src/core/conflictResolver.test.ts` - Unit tests for conflict resolver
- `src/core/repositoryManager.ts` - Manages GitHub repository operations, permissions, and PR creation
- `src/core/repositoryManager.test.ts` - Unit tests for repository manager
- `src/interactive/createInteractive.ts` - Interactive prompts and user input handling for create command
- `src/interactive/createInteractive.test.ts` - Unit tests for interactive create functionality
- `src/utils/sensitiveFileDetector.ts` - Detects and warns about sensitive files
- `src/utils/sensitiveFileDetector.test.ts` - Unit tests for sensitive file detector
- `src/utils/diffGenerator.ts` - Generates git-style diffs for conflict resolution
- `src/utils/diffGenerator.test.ts` - Unit tests for diff generator

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `create.ts` and `create.test.ts` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Implement Core Create Command Infrastructure
  - [x] 1.1 Add create command to CLI with argument parsing for `<path> [box-name]`
  - [x] 1.2 Implement minimal command options for interactive mode (--registry for override)
  - [x] 1.3 Add create command to main CLI router in `src/cli.ts`
  - [x] 1.4 Create basic command validation (path exists, registry accessible)
  - [x] 1.5 Implement dry-run preview with confirmation prompt (show what will be created, then ask to proceed)
  - [x] 1.6 Add comprehensive error handling and user-friendly error messages

- [x] 2.0 Build Local Directory Processing and Smart Detection
  - [x] 2.1 Create local directory scanner that validates and reads directory contents
  - [x] 2.2 Implement comprehensive tag detection: file types (TypeScript, JavaScript, Python, Docker) and semantic tags (ai, architecture, documentation, config, workflow, etc.)
  - [x] 2.3 Build directory structure analysis for defaultTarget suggestions
  - [x] 2.4 Create exclusion pattern detection (node_modules, .git, build artifacts)
  - [x] 2.5 Implement sensitive file detection (.env, keys, tokens, credentials)
  - [x] 2.6 Build metadata generator with smart defaults and override capabilities
  - [x] 2.7 Create box name derivation logic with nested structure support (scripts/aws/lambda)

- [x] 3.0 Implement Conflict Resolution and Diff Visualization
  - [x] 3.1 Create content comparison engine for existing vs new box content
  - [x] 3.2 Implement git-style diff generator for file changes
  - [x] 3.3 Build change analysis system (additions, deletions, modifications)
  - [x] 3.4 Create version bump suggestion logic with user confirmation
  - [x] 3.5 Implement conflict resolution workflow (overwrite, version bump, cancel)
  - [x] 3.6 Add clear summary display of what will change

- [x] 4.0 Build Repository Management and Permission Handling
  - [x] 4.1 Implement write permission checking for target repositories
  - [x] 4.2 Create automatic repository forking for users without write access
  - [x] 4.3 Build pull request creation with auto-generated descriptions
  - [x] 4.4 Implement branch management for box updates
  - [x] 4.5 Add commit message generation with meaningful descriptions
  - [x] 4.6 Create PR URL provision and next steps guidance

- [ ] 5.0 Create Interactive User Experience and Integration
  - [x] 5.1 Build interactive prompting system for metadata input
  - [x] 5.2 Implement progress indicators for long operations
  - [x] 5.3 Create confirmation workflows for sensitive operations
  - [x] 5.4 Add metadata override prompts with detected defaults
  - [x] 5.5 Implement sensitive file warning and confirmation system
  - [x] 5.6 Integrate all components into cohesive create command workflow
  - [ ] 5.7 Add comprehensive integration testing for end-to-end scenarios

- [ ] 6.0 Create Documentation and User Guidance
  - [ ] 6.1 Write comprehensive documentation for the `qraft create` command
  - [ ] 6.2 Create workflow guide for downloading and creating boxes
  - [ ] 6.3 Document best practices for setting up personal template repositories
  - [ ] 6.4 Add examples of common box creation scenarios (configs, scripts, workflows)
  - [ ] 6.5 Create troubleshooting guide for common issues (permissions, conflicts, sensitive files)
  - [ ] 6.6 Document integration with existing qraft commands and workflows
  - [ ] 6.7 Add README section explaining the create feature and its benefits
