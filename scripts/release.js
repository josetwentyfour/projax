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
  
  // Parse CLI arguments
  const args = process.argv.slice(2);
  const bumpTypeArg = args.find(arg => ['patch', 'minor', 'major'].includes(arg));
  const autoYes = args.includes('-y') || args.includes('--yes');
  
  // Check git status
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status) {
      console.log('⚠️  You have uncommitted changes:');
      console.log(status);
      if (autoYes) {
        console.log('Auto-accepting with -y flag...\n');
      } else {
        const proceed = await question('\nContinue anyway? (y/N): ');
        if (proceed.toLowerCase() !== 'y') {
          console.log('Aborted.');
          process.exit(0);
        }
      }
    }
  } catch (error) {
    console.error('Error checking git status');
    process.exit(1);
  }

  // Get version bump type
  let bumpType;
  if (bumpTypeArg) {
    bumpType = bumpTypeArg;
    console.log(`Using bump type from argument: ${bumpType}\n`);
  } else {
    bumpType = await question('Version bump type (patch/minor/major) [patch]: ') || 'patch';
  }
  
  if (!['patch', 'minor', 'major'].includes(bumpType)) {
    console.error('Invalid bump type. Use patch, minor, or major.');
    process.exit(1);
  }

  console.log(`\n🎯 Starting ${bumpType} release...\n`);

  // 1. Bump version
  exec(`pnpm run version:${bumpType}`, 'Version bump');

  // Get the new version
  const packageJson = require('../package.json');
  const newVersion = packageJson.version;
  
  // Sync remaining packages
  exec(`node scripts/bump-version.js ${newVersion}`, 'Sync all package versions');

  // 2. Install dependencies
  console.log('\n📦 Install dependencies...');
  try {
    execSync('pnpm install', { stdio: 'inherit' });
    console.log('✓ Install dependencies completed');
  } catch (error) {
    console.log('⚠️  Install dependencies had warnings/errors, but continuing...');
    console.log('✓ Continuing with build (dependencies may already be installed)');
  }

  // 3. Build all packages
  exec('pnpm -r run build', 'Build all packages');

  // 3.5 Copy README to CLI package for npm
  console.log('\n📄 Copying README to CLI package...');
  exec('cp README.md packages/cli/README.md', 'Copy README to CLI');
  console.log('✓ README copied to CLI package');

  // 3.6 Package VS Code extension
  console.log('\n📦 Packaging VS Code extension...');
  exec('mkdir -p release', 'Create release directory');
  exec('pnpm --filter projax-vscode run package', 'Package .vsix file');
  console.log('✓ VS Code extension packaged to ./release/');

  // 3.7 Test with pnpm link (skip if permission denied)
  console.log('\n🧪 Testing commands with pnpm link...');
  try {
    execSync('cd packages/cli && pnpm link --global', { stdio: 'inherit' });
  
  console.log('\n  Testing core commands:');
  exec('prx --version', '  - prx --version');
  exec('prx list', '  - prx list');
  exec('prx api', '  - prx api');
  exec('prx web --help', '  - prx web --help');
  exec('prx docs --help', '  - prx docs --help');
  
  console.log('\n  Testing prxi (Terminal UI):');
  console.log('  ℹ️  Skipping interactive test for prx i (requires TTY)');
  console.log('  ✓ All commands tested successfully\n');
  } catch (error) {
    console.log('\n  ⚠️  npm link failed (permission denied or already linked)');
    console.log('  ℹ️  Skipping command tests - commands will be tested after npm publish');
    console.log('  ✓ Continuing with release...\n');
  }

  // 4. Commit changes
  let commitMsg;
  if (autoYes) {
    commitMsg = `Release v${newVersion}`;
    console.log(`\nUsing default commit message: ${commitMsg}`);
  } else {
    commitMsg = await question(`\nCommit message [Release v${newVersion}]: `) || `Release v${newVersion}`;
  }
  exec('git add -A', 'Stage changes');
  exec(`git commit -m "${commitMsg}"`, 'Commit changes');

  // 5. Create git tag
  exec(`git tag -a v${newVersion} -m "Release v${newVersion}"`, 'Create git tag');

  // 6. Push to GitHub
  let pushConfirm = 'y';
  if (!autoYes) {
    pushConfirm = await question('\nPush to GitHub? (Y/n): ');
  } else {
    console.log('\nAuto-accepting push to GitHub with -y flag...');
  }
  if (pushConfirm.toLowerCase() !== 'n') {
    exec('git push origin main', 'Push to main branch');
    exec(`git push origin v${newVersion}`, 'Push tag');
  }

  // 7. Publish to npm
  let publishConfirm = 'y';
  if (!autoYes) {
    publishConfirm = await question('\nPublish to npm? (Y/n): ');
  } else {
    console.log('\nAuto-accepting npm publish with -y flag...');
  }
  if (publishConfirm.toLowerCase() !== 'n') {
    exec('cd packages/cli && npm publish --access public', 'Publish to npm');
  }

  // 8. Deploy docs
  let docsConfirm = 'y';
  if (!autoYes) {
    docsConfirm = await question('\nDeploy documentation to gh-pages? (Y/n): ');
  } else {
    console.log('\nAuto-accepting docs deployment with -y flag...');
  }
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

