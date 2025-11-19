# prx pwd

Get the path to a project directory.

## Syntax

```bash
prx pwd [project]
```

## Description

Outputs only the path to a project directory. Useful for use with command substitution.

## Examples

### Get path by ID

```bash
prx pwd 1
```

Output: `/path/to/project`

### Get path by name

```bash
prx pwd "My Project"
```

### Use with command substitution

```bash
cd $(prx pwd 1)
```

### Interactive selection

```bash
prx pwd
```

You'll be prompted to select a project.

## Use Cases

- Change directory: `cd $(prx pwd 1)`
- Copy files: `cp file.txt $(prx pwd 1)/`
- Open in editor: `code $(prx pwd 1)`
- List files: `ls $(prx pwd 1)`

## Related Commands

- [`prx cd`](/docs/cli/commands/cd) - Change to project directory (alternative method)
- [`prx list`](/docs/cli/commands/list) - View all project paths

