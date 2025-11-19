# Shell Integration

Integrate projax into your shell for a smoother workflow.

## Quick Navigation Function

Add to `~/.zshrc` or `~/.bashrc`:

```bash
prxcd() {
  eval "$(prx cd $@)"
}
```

Usage:

```bash
prxcd 1              # Change to project 1
prxcd "My Project"    # Change to project by name
prxcd                 # Interactive selection
```

## Background Execution Helper

```bash
prxbg() {
  prx "$@" -M
}
```

Usage:

```bash
prxbg 1 dev          # Run project 1 dev in background
prxbg 2 start        # Run project 2 start in background
```

## Combined Helper

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

Create shorter aliases:

```bash
# Add to ~/.zshrc or ~/.bashrc
alias pa='prx add'
alias pl='prx list'
alias ps='prx scan'
alias pr='prx remove'
alias pi='prx i'      # Launch TUI
alias pw='prx web'    # Launch Desktop
```

## Fish Shell

For Fish shell (`~/.config/fish/config.fish`):

```fish
function prxcd
  eval (prx cd $argv)
end

function prxbg
  prx $argv -M
end
```

## PowerShell

For PowerShell (add to profile):

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

With shell integration:

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

## Advanced Integration

### Project Switcher

```bash
prxswitch() {
  local project=$(prx list | fzf | awk '{print $1}')
  if [ -n "$project" ]; then
    eval "$(prx cd $project)"
  fi
}
```

Requires `fzf` for fuzzy finding.

### Quick Runner

```bash
prxrun() {
  local project="$1"
  shift
  prx "$project" "$@" -M
}
```

Usage:

```bash
prxrun 1 dev
prxrun 2 build
```

## Related Documentation

- [CLI Shell Integration](/docs/cli/shell-integration) - Detailed integration guide
- [Basic Workflow](/docs/examples/basic-workflow) - Getting started

