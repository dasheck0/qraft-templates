# Release Scripts

This directory contains scripts for managing releases of the qraft CLI tool.

## Release Script (`release.js`)

An automated release script that handles version bumping, changelog generation, and publishing.

### Features

- 🔢 **Version Bumping**: Interactive prompts for patch, minor, or major version increments
- 📝 **Changelog Generation**: Automatically generates changelog from conventional commits
- 🏷️ **Git Tagging**: Creates and pushes git tags
- 🚀 **CI Integration**: Triggers automated NPM publishing and GitHub releases
- 🧪 **Dry Run Mode**: Preview changes without making any commits

### Usage

#### Normal Release
```bash
npm run release
```

#### Dry Run (Preview Only)
```bash
npm run release:dry
```

#### Direct Script Usage
```bash
# Normal release
node scripts/release.js

# Dry run
node scripts/release.js --dry-run
```

### Release Process

1. **Pre-checks**: Verifies clean working directory and git repository
2. **Version Selection**: Prompts for version bump type (patch/minor/major)
3. **Commit Analysis**: Reads git history since last tag using conventional commits
4. **Changelog Generation**: Creates changelog content based on commit types:
   - `feat:` → Added
   - `fix:` → Fixed
   - `docs:` → Documentation
   - `refactor:` → Changed
   - `perf:` → Performance
   - `test:` → Tests
   - `chore:` → Maintenance
   - `ci:` → CI/CD
5. **File Updates**: Updates `package.json` and `CHANGELOG.md`
6. **Git Operations**: Commits changes, creates tag, and pushes to remote
7. **CI Trigger**: GitHub Actions automatically publishes to NPM and creates GitHub release

### Conventional Commits

The script expects conventional commit format:
```
type(scope): description

Examples:
feat: add new template discovery feature
fix(auth): resolve token validation issue
docs: update installation instructions
```

### Requirements

- Clean working directory (no uncommitted changes)
- Git repository with remote origin
- Conventional commit messages for best changelog generation
- NPM_TOKEN secret configured in GitHub repository settings

### Automation Flow

```
Local Release Script → Git Push → GitHub Actions → NPM Publish + GitHub Release
```

1. **Local**: Run `npm run release`
2. **Git**: Script commits with `release: x.y.z` message and pushes
3. **CI**: GitHub Actions detects release commit and triggers publish workflow
4. **NPM**: Package is published to npm registry
5. **GitHub**: Release is created with changelog content

### Troubleshooting

**"Working directory is not clean"**
- Commit or stash any pending changes before running the release script

**"Not in a git repository"**
- Ensure you're running the script from the project root directory

**"Invalid choice"**
- Select 1 (patch), 2 (minor), or 3 (major) when prompted for version bump

**CI doesn't trigger**
- Ensure the commit message starts with `chore: release` (handled automatically by script)
- Check that you're pushing to the `master` branch

**NPM publish fails**
- Verify NPM_TOKEN is set in GitHub repository secrets
- Ensure you have publish permissions for the package
- Check that the version doesn't already exist on NPM

### Configuration

The script uses these files:
- `package.json` - Version updates
- `CHANGELOG.md` - Changelog updates
- `.github/workflows/ci.yml` - CI/CD automation

No additional configuration is required - the script works out of the box with the existing project structure.
