#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function exec(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✓ ${description} completed`);
  } catch (error) {
    console.error(`✗ ${description} failed`);
    process.exit(1);
  }
}

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🚀 PROJAX Release Script\n');
  
  // Check git status
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status) {
      console.log('⚠️  You have uncommitted changes:');
      console.log(status);
      const proceed = await question('\nContinue anyway? (y/N): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('Aborted.');
        process.exit(0);
      }
    }
  } catch (error) {
    console.error('Error checking git status');
    process.exit(1);
  }

  // Get version bump type
  const bumpType = await question('Version bump type (patch/minor/major) [patch]: ') || 'patch';
  
  if (!['patch', 'minor', 'major'].includes(bumpType)) {
    console.error('Invalid bump type. Use patch, minor, or major.');
    process.exit(1);
  }

  console.log(`\n🎯 Starting ${bumpType} release...\n`);

  // 1. Bump version
  exec(`npm run version:${bumpType}`, 'Version bump');

  // Get the new version
  const packageJson = require('../package.json');
  const newVersion = packageJson.version;
  
  // Sync remaining packages
  exec(`node scripts/bump-version.js ${newVersion}`, 'Sync all package versions');

  // 2. Install dependencies
  exec('npm install', 'Install dependencies');

  // 3. Build all packages
  exec('npm run build', 'Build all packages');

  // 3.5 Package VS Code extension
  console.log('\n📦 Packaging VS Code extension...');
  exec('mkdir -p release', 'Create release directory');
  exec('npm run package --workspace=packages/vscode-extension', 'Package .vsix file');
  console.log('✓ VS Code extension packaged to ./release/');

  // 3.6 Test with npm link
  console.log('\n🧪 Testing commands with npm link...');
  exec('cd packages/cli && npm link', 'Link CLI for testing');
  
  console.log('\n  Testing core commands:');
  exec('prx --version', '  - prx --version');
  exec('prx list', '  - prx list');
  exec('prx api', '  - prx api');
  exec('prx web --help', '  - prx web --help');
  exec('prx docs --help', '  - prx docs --help');
  
  console.log('\n  Testing prxi (Terminal UI):');
  console.log('  ℹ️  Skipping interactive test for prx i (requires TTY)');
  console.log('  ✓ All commands tested successfully\n');

  // 4. Commit changes
  const commitMsg = await question(`\nCommit message [Release v${newVersion}]: `) || `Release v${newVersion}`;
  exec('git add -A', 'Stage changes');
  exec(`git commit -m "${commitMsg}"`, 'Commit changes');

  // 5. Create git tag
  exec(`git tag -a v${newVersion} -m "Release v${newVersion}"`, 'Create git tag');

  // 6. Push to GitHub
  const pushConfirm = await question('\nPush to GitHub? (Y/n): ');
  if (pushConfirm.toLowerCase() !== 'n') {
    exec('git push origin main', 'Push to main branch');
    exec(`git push origin v${newVersion}`, 'Push tag');
  }

  // 7. Publish to npm
  const publishConfirm = await question('\nPublish to npm? (Y/n): ');
  if (publishConfirm.toLowerCase() !== 'n') {
    exec('cd packages/cli && npm publish --access public', 'Publish to npm');
  }

  // 8. Deploy docs
  const docsConfirm = await question('\nDeploy documentation to gh-pages? (Y/n): ');
  if (docsConfirm.toLowerCase() !== 'n') {
    exec('cd packages/docsite && npm run deploy', 'Deploy documentation');
  }

  console.log(`\n✨ Release v${newVersion} complete!\n`);
  console.log('📦 npm: https://www.npmjs.com/package/projax');
  console.log('🌐 Docs: https://projax.dev');
  console.log('📂 GitHub: https://github.com/josetwentyfour/projax');
  
  rl.close();
}

main().catch(error => {
  console.error('Release failed:', error);
  rl.close();
  process.exit(1);
});

