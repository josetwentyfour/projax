# prx stop

Stop a running background process.

## Syntax

```bash
prx stop <pid>
```

## Description

Stops a running background process by its Process ID (PID). Use `prx ps` to find the PID of running processes.

## Examples

### Stop process by PID

```bash
prx stop 12345
```

### Find and stop processes

```bash
# First, list running processes
prx ps

# Then stop by PID
prx stop 12345
```

## How It Works

The command:
1. Finds the process by PID
2. Sends a termination signal (SIGTERM)
3. Waits for graceful shutdown
4. If needed, sends SIGKILL for force termination

## Process Management

Background processes are tracked in `~/.projax/processes.json`. When you stop a process:
- The process is terminated
- The entry is removed from the processes file
- Log files remain for reference

## Related Commands

- [`prx ps`](/docs/cli/commands/ps) - List running processes
- [`prx run`](/docs/cli/commands/run) - Run scripts in background mode

