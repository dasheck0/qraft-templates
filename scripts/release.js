#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

class ReleaseManager {
  constructor(isDryRun = false) {
    this.isDryRun = isDryRun;
    this.packagePath = path.join(process.cwd(), 'package.json');
    this.changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    
    if (isDryRun) {
      log.warning('🧪 DRY RUN MODE - No changes will be committed');
    }
  }

  async run() {
    try {
      log.title('🚀 Release Manager');
      
      // Check if we're in a git repository
      this.checkGitRepo();
      
      // Check for uncommitted changes
      this.checkWorkingDirectory();
      
      // Get current version
      const currentVersion = this.getCurrentVersion();
      log.info(`Current version: ${currentVersion}`);
      
      // Prompt for version bump
      const bumpType = await this.promptVersionBump();
      const newVersion = this.calculateNewVersion(currentVersion, bumpType);
      log.info(`New version will be: ${colors.green}${newVersion}${colors.reset}`);
      
      // Get git commits since last tag
      const commits = this.getCommitsSinceLastTag();
      
      // Generate changelog content
      const changelogContent = this.generateChangelogContent(commits, newVersion);
      
      if (this.isDryRun) {
        this.showDryRunPreview(currentVersion, newVersion, changelogContent);
        return;
      }
      
      // Confirm release
      const confirmed = await this.confirmRelease(newVersion);
      if (!confirmed) {
        log.warning('Release cancelled');
        return;
      }
      
      // Update package.json
      this.updatePackageVersion(newVersion);
      log.success('Updated package.json');
      
      // Update CHANGELOG.md
      this.updateChangelog(changelogContent, newVersion);
      log.success('Updated CHANGELOG.md');
      
      // Commit changes
      this.commitChanges(newVersion);
      log.success('Committed changes');
      
      // Create tag
      this.createTag(newVersion);
      log.success(`Created tag v${newVersion}`);
      
      // Push changes
      this.pushChanges(newVersion);
      log.success('Pushed changes and tag to remote');
      
      log.title(`🎉 Release v${newVersion} completed successfully!`);
      log.info('The CI pipeline will now publish to NPM and create a GitHub release.');
      
    } catch (error) {
      log.error(`Release failed: ${error.message}`);
      process.exit(1);
    }
  }

  checkGitRepo() {
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    } catch {
      throw new Error('Not in a git repository');
    }
  }

  checkWorkingDirectory() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        throw new Error('Working directory is not clean. Please commit or stash changes first.');
      }
    } catch (error) {
      if (error.message.includes('Working directory')) {
        throw error;
      }
      throw new Error('Failed to check git status');
    }
  }

  getCurrentVersion() {
    const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    return packageJson.version;
  }

  async promptVersionBump() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const currentVersion = this.getCurrentVersion();

    return new Promise((resolve) => {
      console.log('\nSelect version bump type:');
      console.log(`1. patch (${this.calculateNewVersion(currentVersion, 'patch')}) - Bug fixes`);
      console.log(`2. minor (${this.calculateNewVersion(currentVersion, 'minor')}) - New features`);
      console.log(`3. major (${this.calculateNewVersion(currentVersion, 'major')}) - Breaking changes`);

      rl.question('\nEnter choice (1-3): ', (answer) => {
        rl.close();
        const choices = { '1': 'patch', '2': 'minor', '3': 'major' };
        const choice = choices[answer.trim()];
        if (!choice) {
          throw new Error('Invalid choice. Please select 1, 2, or 3.');
        }
        resolve(choice);
      });
    });
  }

  calculateNewVersion(currentVersion, bumpType) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    switch (bumpType) {
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'major':
        return `${major + 1}.0.0`;
      default:
        throw new Error(`Invalid bump type: ${bumpType}`);
    }
  }

  getCommitsSinceLastTag() {
    try {
      // Get the latest tag
      const latestTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
      // Get commits since the latest tag
      const commits = execSync(`git log ${latestTag}..HEAD --pretty=format:"%s"`, { encoding: 'utf8' });
      return commits.split('\n').filter(commit => commit.trim());
    } catch {
      // If no tags exist, get all commits
      const commits = execSync('git log --pretty=format:"%s"', { encoding: 'utf8' });
      return commits.split('\n').filter(commit => commit.trim());
    }
  }

  generateChangelogContent(commits, version) {
    const today = new Date().toISOString().split('T')[0];
    const categories = {
      feat: { title: 'Added', items: [] },
      fix: { title: 'Fixed', items: [] },
      docs: { title: 'Documentation', items: [] },
      style: { title: 'Style', items: [] },
      refactor: { title: 'Changed', items: [] },
      perf: { title: 'Performance', items: [] },
      test: { title: 'Tests', items: [] },
      chore: { title: 'Maintenance', items: [] },
      ci: { title: 'CI/CD', items: [] }
    };

    // Parse conventional commits
    commits.forEach(commit => {
      const match = commit.match(/^(\w+)(\(.+\))?: (.+)$/);
      if (match) {
        const [, type, scope, description] = match;
        if (categories[type]) {
          const scopeText = scope ? ` ${scope}` : '';
          categories[type].items.push(`- ${description}${scopeText}`);
        }
      } else {
        // Non-conventional commits go to maintenance
        categories.chore.items.push(`- ${commit}`);
      }
    });

    // Build changelog content
    let content = `## [${version}] - ${today}\n\n`;
    
    Object.values(categories).forEach(category => {
      if (category.items.length > 0) {
        content += `### ${category.title}\n`;
        content += category.items.join('\n') + '\n\n';
      }
    });

    return content.trim();
  }

  showDryRunPreview(currentVersion, newVersion, changelogContent) {
    log.title('🧪 DRY RUN PREVIEW');
    
    console.log(`${colors.bright}Version Change:${colors.reset}`);
    console.log(`  ${currentVersion} → ${colors.green}${newVersion}${colors.reset}\n`);
    
    console.log(`${colors.bright}Changelog Content:${colors.reset}`);
    console.log(changelogContent);
    
    console.log(`\n${colors.bright}Actions that would be performed:${colors.reset}`);
    console.log('  1. Update package.json version');
    console.log('  2. Update CHANGELOG.md');
    console.log(`  3. Commit with message: "release: ${newVersion}"`);
    console.log(`  4. Create tag: v${newVersion}`);
    console.log('  5. Push changes and tag to remote');
    
    log.info('Run without --dry-run to execute these changes');
  }

  async confirmRelease(version) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`\nProceed with release v${version}? (y/N): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  updatePackageVersion(version) {
    const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    packageJson.version = version;
    fs.writeFileSync(this.packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  }

  updateChangelog(newContent, version) {
    const changelog = fs.readFileSync(this.changelogPath, 'utf8');
    
    // Find the position after the "## [Unreleased]" section
    const unreleasedMatch = changelog.match(/(## \[Unreleased\][\s\S]*?)(\n## \[)/);
    
    if (unreleasedMatch) {
      // Insert new version after unreleased section
      const beforeUnreleased = changelog.substring(0, unreleasedMatch.index + unreleasedMatch[1].length);
      const afterUnreleased = changelog.substring(unreleasedMatch.index + unreleasedMatch[1].length);
      
      const updatedChangelog = beforeUnreleased + '\n\n' + newContent + '\n' + afterUnreleased;
      fs.writeFileSync(this.changelogPath, updatedChangelog);
    } else {
      // If no unreleased section found, add at the beginning after the header
      const lines = changelog.split('\n');
      const headerEndIndex = lines.findIndex(line => line.startsWith('## '));
      
      if (headerEndIndex > 0) {
        lines.splice(headerEndIndex, 0, '', newContent, '');
        fs.writeFileSync(this.changelogPath, lines.join('\n'));
      } else {
        throw new Error('Could not find appropriate place to insert changelog content');
      }
    }
  }

  commitChanges(version) {
    execSync('git add package.json CHANGELOG.md');
    execSync(`git commit -m "chore: release ${version}"`);
  }

  createTag(version) {
    execSync(`git tag v${version}`);
  }

  pushChanges(version) {
    execSync('git push origin master');
    execSync(`git push origin v${version}`);
  }
}

// CLI handling
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');
const releaseManager = new ReleaseManager(isDryRun);

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nRelease cancelled by user');
  process.exit(0);
});

releaseManager.run().catch(error => {
  log.error(error.message);
  process.exit(1);
});
