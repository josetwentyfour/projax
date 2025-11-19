# Shell Integration

Integrate projax CLI commands into your shell for a smoother workflow.

## Quick Navigation Function

Add this to your `~/.zshrc` or `~/.bashrc`:

```bash
prxcd() {
  eval "$(prx cd $@)"
}
```

Then use:

```bash
prxcd 1              # Change to project 1
prxcd "My Project"    # Change to project by name
prxcd                 # Interactive selection
```

## Background Execution Helper

Create a function for quick background execution:

```bash
prxbg() {
  prx "$@" -M
}
```

Usage:

```bash
prxbg 1 dev          # Run project 1 dev script in background
prxbg 2 start        # Run project 2 start script in background
```

## Combined Helper

Combine navigation and execution:

```bash
prxgo() {
  local project="$1"
  shift
  eval "$(prx cd $project)"
  prx "$project" "$@"
}
```

Usage:

```bash
prxgo 1 dev          # Change to project 1 and run dev
prxgo "My Project" build  # Change to project and run build
```

## Aliases

Create shorter aliases for common commands:

```bash
# Add to ~/.zshrc or ~/.bashrc
alias pa='prx add'
alias pl='prx list'
alias ps='prx scan'
alias pr='prx remove'
alias pi='prx i'  # Launch TUI
alias pw='prx web'  # Launch Desktop
```

## Fish Shell

For Fish shell users, add to `~/.config/fish/config.fish`:

```fish
function prxcd
  eval (prx cd $argv)
end

function prxbg
  prx $argv -M
end
```

## PowerShell

For PowerShell users, add to your profile:

```powershell
function prxcd {
  $cmd = prx cd $args
  Invoke-Expression $cmd
}

function prxbg {
  prx $args -M
}
```

## Auto-completion

### Zsh

Add to `~/.zshrc`:

```bash
# projax completion
_prx_completion() {
  local words=("${COMP_WORDS[@]}")
  local cword=$COMP_CWORD
  local cur="${words[cword]}"
  
  # Get project list
  local projects=$(prx list --format=names 2>/dev/null)
  
  COMPREPLY=($(compgen -W "$projects" -- "$cur"))
}

complete -F _prx_completion prx
```

### Bash

Add to `~/.bashrc`:

```bash
_prx_completion() {
  local cur="${COMP_WORDS[COMP_CWORD]}"
  local projects=$(prx list --format=names 2>/dev/null)
  COMPREPLY=($(compgen -W "$projects" -- "$cur"))
}

complete -F _prx_completion prx
```

## Example Workflow

With shell integration, your workflow becomes:

```bash
# Quick navigation
prxcd 1

# Run in background
prxbg 1 dev
prxbg 2 start

# Check what's running
prx ps

# Quick list
pl

# Quick scan
ps
```

## Related Documentation

- [CLI Commands](/docs/cli/commands/cd) - Learn about individual commands
- [Advanced Features](/docs/cli/advanced-features) - Discover intelligent features

