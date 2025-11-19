# Linking the CLI Locally

The CLI can be linked locally using `npm link`. This allows you to use the `prx` command globally while developing.

## Option 1: Standard npm link (if you have permissions)

```bash
cd packages/cli
npm link
```

This will create a global symlink. You can then use `prx` from anywhere:

```bash
prx --help
prx add /path/to/project
```

## Option 2: If you get permission errors

If you get `EACCES` permission errors, you have a few options:

### A. Use a user-writable npm prefix (Recommended)

Configure npm to use a directory in your home folder:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
```

Add to your `~/.zshrc` or `~/.bashrc`:
```bash
export PATH=~/.npm-global/bin:$PATH
```

Then reload your shell and link:
```bash
source ~/.zshrc  # or source ~/.bashrc
cd packages/cli
npm link
```

### B. Use sudo (Not recommended, but works)

```bash
cd packages/cli
sudo npm link
```

### C. Use npx to run directly

You can also run the CLI directly without linking:

```bash
# From the project root
npx --package=./packages/cli prx --help

# Or use node directly
node packages/cli/dist/index.js --help
```

## Unlinking

To remove the global link:

```bash
npm unlink -g prx-dashboard
```

Or from the CLI package directory:

```bash
cd packages/cli
npm unlink
```

## Testing the Link

After linking, test it:

```bash
prx --help
prx list
```

