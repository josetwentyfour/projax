# prx rename / prx rn

Rename a project.

## Syntax

```bash
prx rename <project> <newName>
prx rn <project> <newName>
```

## Description

Renames a project. The directory path remains unchanged; only the display name is updated in the database.

## Examples

### Rename by ID

```bash
prx rename 1 "My New Project Name"
prx rn 1 "My New Project Name"
```

### Rename by current name

```bash
prx rename "Old Name" "New Name"
prx rn "Old Name" "New Name"
```

### Using full command name

```bash
prx rename 2 "Frontend App"
```

## Notes

- The project's directory path is not changed
- Only the display name in the dashboard is updated
- Project ID remains the same
- All associated data (tests, ports) is preserved

## Related Commands

- [`prx add`](/docs/cli/commands/add) - Add a project
- [`prx list`](/docs/cli/commands/list) - View all projects with updated names

