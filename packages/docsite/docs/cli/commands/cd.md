# prx cd

Change to a project directory.

## Syntax

```bash
prx cd [project]
```

## Description

Outputs a shell command that changes directory. Use with `eval` to execute the command.

## Examples

### Change directory by ID

```bash
eval "$(prx cd 1)"
```

### Change directory by name

```bash
eval "$(prx cd projax)"
```

### Interactive selection

```bash
eval "$(prx cd)"
```

You'll be prompted to select a project.

## Shell Integration

For easier use, add this to your `~/.zshrc` or `~/.bashrc`:

```bash
prxcd() {
  eval "$(prx cd $@)"
}
```

Then simply use:

```bash
prxcd 1
prxcd "My Project"
prxcd  # Interactive selection
```

## How It Works

The command outputs a shell `cd` command that you execute with `eval`. This allows the command to change the directory in your current shell session.

## Alternative

You can also use `prx pwd` with command substitution:

```bash
cd $(prx pwd 1)
```

## Related Commands

- [`prx pwd`](/docs/cli/commands/pwd) - Get project path (alternative method)
- [`prx list`](/docs/cli/commands/list) - View all projects

