# Tasks for `unbox` Template Unboxer CLI

Based on the PRD: `prd-setup-unboxing-tool.md`

## Relevant Files

- `src/cli.ts` - Main CLI entry point that handles command parsing and routing ✓
- `src/cli.test.ts` - Unit tests for CLI functionality
- `src/commands/list.ts` - List available boxes command ✓
- `src/commands/copy.ts` - Copy boxes to target directory command ✓
- `src/commands/config.ts` - Configuration management commands ✓
- `src/commands/auth.ts` - Authentication management commands ✓
- `src/commands/cache.ts` - Cache management commands ✓
- `bin/unbox.js` - Binary entry point for npm package ✓
- `src/core/boxManager.ts` - Core logic for managing boxes (listing, copying, validation) ✓ (GitHub-enabled)
- `src/core/boxManager.test.ts` - Unit tests for box management
- `src/core/fileOperations.ts` - File system operations (copying, overwrite protection) ✓
- `src/core/fileOperations.test.ts` - Unit tests for file operations ✓
- `src/core/registryManager.ts` - GitHub registry management and API integration ✓
- `src/core/registryManager.test.ts` - Unit tests for registry management ✓
- `src/core/cacheManager.ts` - Local caching for downloaded boxes ✓
- `src/core/cacheManager.test.ts` - Unit tests for cache management ✓
- `src/interactive/inquirer.ts` - Interactive mode implementation using inquirer
- `src/interactive/inquirer.test.ts` - Unit tests for interactive mode
- `src/utils/console.ts` - Styled console output utilities using chalk
- `src/utils/console.test.ts` - Unit tests for console utilities
- `src/utils/config.ts` - Configuration management for registries and settings ✓
- `src/utils/config.test.ts` - Unit tests for configuration management ✓
- `src/types/index.ts` - TypeScript type definitions for the project ✓
- `package.json` - Package configuration with dependencies and bin entry ✓
- `bin/unbox.js` - Compiled executable script for npx usage
- `tsconfig.json` - TypeScript configuration ✓
- `jest.config.js` - Jest configuration for TypeScript testing ✓
- `.unboxrc` - Global configuration file for default registry and settings
- `~/.cache/unbox/` - Local cache directory for downloaded boxes
- `README.md` - Project documentation and usage instructions
- `.npmignore` - Files to exclude from npm package
- `.github/workflows/publish.yml` - GitHub Action for automated npm publishing
- `CHANGELOG.md` - Version history and release notes

### Notes

- Unit tests should be placed alongside the code files they are testing
- Use `npm test` to run all tests (Jest with TypeScript support)
- TypeScript files in `src/` will be compiled to `dist/` for distribution
- Boxes are fetched from GitHub repositories on-demand (no local storage in npm package)
- Default registry: `dasheck0/unbox-templates` (configurable globally and per-command)
- Registry format: `owner/repo` (e.g., `dasheck0/unbox-templates`, `myorg/custom-templates`)
- Box format: `[registry/]boxname` (e.g., `myorg/n8n` or just `n8n` for default registry)
- Public repositories require no authentication, private repos need GitHub token
- Local caching improves performance for repeated box usage
- The executable `bin/unbox.js` will reference the compiled TypeScript output

## Tasks

- [x] 1.0 Project Setup and Configuration
  - [x] 1.1 Initialize Node.js project with TypeScript configuration
  - [x] 1.2 Install and configure dependencies (commander, inquirer, chalk, fs-extra)
  - [x] 1.3 Install and configure development dependencies (TypeScript, Jest, @types packages)
  - [x] 1.4 Set up TypeScript configuration (tsconfig.json) with appropriate compiler options
  - [x] 1.5 Configure Jest for TypeScript testing (jest.config.js)
  - [x] 1.6 Set up package.json with proper bin entry and build scripts
  - [x] 1.7 Create basic project directory structure (src/, dist/, boxes/, bin/)
- [x] 2.0 Core Box Management System (Local Implementation - To be refactored)
  - [x] 2.1 Define TypeScript interfaces for Box manifest and configuration
  - [x] 2.2 Implement box discovery and listing functionality
  - [x] 2.3 Implement manifest.json parsing and validation
  - [x] 2.4 Create file operations module with overwrite protection
  - [x] 2.5 Implement box copying logic with target directory support
  - [x] 2.6 Add error handling for missing boxes and invalid operations
- [x] 2.5 GitHub Registry Integration
  - [x] 2.5.1 Add GitHub API dependencies and types
  - [x] 2.5.2 Implement RegistryManager for GitHub API integration
  - [x] 2.5.3 Add configuration management for registries and authentication
  - [x] 2.5.4 Implement local caching system for downloaded boxes
  - [x] 2.5.5 Update BoxManager to support remote GitHub repositories
  - [x] 2.5.6 Add registry resolution logic (default vs custom registries)
  - [x] 2.5.7 Handle authentication for private repositories
- [x] 3.0 CLI Interface Implementation
  - [x] 3.1 Set up commander.js for command parsing and routing
  - [x] 3.2 Implement basic box pulling command (npx unbox <boxname>)
  - [x] 3.3 Implement registry-specific pulling (npx unbox registry/boxname)
  - [x] 3.4 Add registry override option (--registry flag)
  - [x] 3.5 Add target directory option (--target flag)
  - [x] 3.6 Implement force overwrite flag (--force)
  - [x] 3.7 Create list command for available boxes (npx unbox list)
  - [x] 3.8 Add registry configuration commands (config set/get)
  - [x] 3.9 Add help and version commands
- [x] 4.0 Interactive Mode Development
  - [x] 4.1 Set up inquirer.js for interactive prompts
  - [x] 4.2 Create box selection interface with descriptions
  - [x] 4.3 Implement box preview functionality
  - [x] 4.4 Add confirmation prompts for file operations
  - [x] 4.5 Integrate interactive mode with core box management
- [x] 5.0 GitHub Template Repository Setup and Testing
  - [x] 5.1 Create GitHub repository for default templates (dasheck0/unbox-templates)
  - [x] 5.2 Set up repository structure with boxes as subdirectories
  - [x] 5.3 Create .tasks box with manifest.json and sample files
  - [x] 5.4 Create n8n box with manifest.json and relevant templates
  - [x] 5.5 Create readme box with manifest.json and documentation templates
  - [x] 5.6 Write comprehensive unit tests for all core modules
  - [x] 5.7 Write integration tests for CLI commands and GitHub integration
  - [x] 5.8 Test interactive mode functionality
  - [x] 5.9 Test registry configuration and authentication
- [x] 6.0 Documentation and NPM Package Deployment Preparation
  - [x] 6.1 Write comprehensive README.md with installation and usage instructions
  - [x] 6.2 Create .npmignore file to exclude development files from package
  - [x] 6.3 Set up GitHub Actions workflow for automated testing and publishing
  - [x] 6.4 Create CHANGELOG.md for version tracking
  - [x] 6.5 Configure package.json for proper npm publishing (files, keywords, etc.)
  - [x] 6.6 Add TypeScript declaration files generation to build process
  - [x] 6.7 Test package installation and usage via npx locally
  - [x] 6.8 Prepare for initial npm package publication
