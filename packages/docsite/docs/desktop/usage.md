# Desktop Usage

How to use the projax Desktop app.

## Getting Started

### Launch the App

```bash
prx web
```

The Desktop app window will open, and the API server will start automatically.

### First Time Setup

On first launch:
1. The app initializes the database
2. API server starts automatically
3. You'll see an empty project list

## Adding Projects

### Method 1: File System Picker

1. Click the "Add Project" button
2. Navigate to your project directory
3. Select the directory
4. Project is added automatically

### Method 2: Drag and Drop

If supported:
1. Drag a project folder onto the app window
2. Project is added automatically

## Viewing Projects

### Project List

The sidebar shows all tracked projects:
- Click a project to view details
- Projects are sorted by ID
- Shows project name and path

### Project Details

Click a project to see:
- Project information
- Test files
- Port information
- Available scripts

## Scanning Projects

### Scan a Single Project

1. Select a project from the list
2. Click the "Scan" button
3. Wait for scan to complete
4. View updated test and port information

### Scan All Projects

1. Use the "Scan All" button (if available)
2. Wait for all scans to complete
3. View updated information

## Managing Projects

### Remove a Project

1. Select a project
2. Click "Remove" or delete button
3. Confirm removal
4. Project is removed from the dashboard

### Rename a Project

1. Select a project
2. Click "Rename" or edit button
3. Enter new name
4. Save changes

## Viewing Test Information

### Test List

View all detected tests:
- Test file paths
- Test frameworks
- Test status (if available)

### Filter Tests

If filtering is available:
- Filter by framework
- Search by file name
- Sort by various criteria

## Viewing Port Information

See detected ports:
- Port numbers
- Associated scripts
- Config sources
- Last detected time

## Status Bar

The bottom status bar shows:
- **API Status**: Running/Stopped
- **API Port**: Current port number
- **Connection**: Connected/Disconnected

## Troubleshooting

### Projects Not Showing

1. Check API server status in status bar
2. Refresh the app (Cmd/Ctrl + R)
3. Restart the app: `prx web`

### API Server Not Running

1. Check status bar for API status
2. Manually start API: `prx api --start`
3. Restart Desktop app

### Scan Not Working

1. Check project path exists
2. Verify project has test files
3. Check console for errors

## Next Steps

- [Integration](/docs/desktop/integration) - Understand API integration
- [Development](/docs/desktop/development) - Development setup

