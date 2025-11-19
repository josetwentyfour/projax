# prx ps

List all running background processes.

## Syntax

```bash
prx ps
```

## Description

Lists all running background processes started with `prx run --background` or `prx <project> <script> -M`.

## Examples

### List running processes

```bash
prx ps
```

## Output

Shows:
- Process ID (PID)
- Project name
- Script name
- Running time
- Command executed
- Log file location
- URLs (if detected)

## Example Output

```
Running processes (3):

  PID 12345: projax (dev) - 5m 30s
    Command: npm run dev
    Logs: /Users/username/.projax/logs/process-1234567890-dev.log
    URLs: http://localhost:3000

  PID 12346: Frontend App (start) - 2m 15s
    Command: npm start
    Logs: /Users/username/.projax/logs/process-1234567891-start.log
    URLs: http://localhost:3001

  PID 12347: API Server (dev) - 10m 0s
    Command: npm run dev
    Logs: /Users/username/.projax/logs/process-1234567892-dev.log
    URLs: http://localhost:3002
```

## Log Files

Log files are stored in `~/.projax/logs/` with the format:
```
process-<timestamp>-<script>.log
```

View logs:
```bash
tail -f ~/.projax/logs/process-*.log
```

## Related Commands

- [`prx stop`](/docs/cli/commands/stop) - Stop a background process
- [`prx run`](/docs/cli/commands/run) - Run scripts in background mode

