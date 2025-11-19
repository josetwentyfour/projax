# Basic Workflow

A step-by-step guide to the basic projax workflow.

## Step 1: Add Projects

Add your development projects to projax:

```bash
# Add with custom names
prx add ~/projects/api-server --name "API Server"
prx add ~/projects/frontend --name "Frontend App"
prx add ~/projects/mobile-app --name "Mobile App"
```

## Step 2: List Projects

View all tracked projects:

```bash
prx list
```

You'll see a table with:
- Project IDs
- Names
- Paths
- Detected ports
- Test file counts

## Step 3: Scan Projects

Scan projects for tests and ports:

```bash
# Scan all projects
prx scan

# Or scan specific project
prx scan 1
```

## Step 4: Run Projects

Run projects with intelligent script selection:

```bash
# Auto-selects dev or start
prx 1
prx "API Server"

# Or run specific script
prx 1 dev
prx 2 build
```

## Step 5: Run in Background

Run scripts in the background:

```bash
prx 1 dev -M
prx 2 start --background
```

View running processes:

```bash
prx ps
```

## Step 6: Navigate to Projects

Quickly change to project directories:

```bash
# Using eval
eval "$(prx cd 1)"

# Or get path
cd $(prx pwd "Frontend App")
```

## Step 7: Use Interactive Interfaces

### Terminal UI

```bash
prx i
```

Navigate with arrow keys, scan projects, view details.

### Desktop App

```bash
prx web
```

Use the visual interface to manage projects.

## Complete Example

```bash
# 1. Add projects
prx add ~/projects/api --name "API"
prx add ~/projects/web --name "Web App"

# 2. List projects
prx list

# 3. Scan for tests and ports
prx scan

# 4. Run projects in background
prx 1 dev -M
prx 2 dev -M

# 5. Check what's running
prx ps

# 6. Navigate to a project
eval "$(prx cd 1)"
```

## Next Steps

- [Multi-Project Management](/docs/examples/multi-project-management) - Managing multiple projects
- [Port Conflict Resolution](/docs/examples/port-conflict-resolution) - Handling port conflicts

