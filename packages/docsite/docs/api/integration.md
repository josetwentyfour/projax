# Integration

Learn how to integrate the projax API into your applications.

## Finding the API Port

The API runs on an automatically selected port. Discover it using one of these methods:

### Method 1: Read Port File

```javascript
const fs = require('fs');
const os = require('os');
const path = require('path');

function getApiPort() {
  const portFile = path.join(os.homedir(), '.projax', 'api-port.txt');
  if (fs.existsSync(portFile)) {
    return parseInt(fs.readFileSync(portFile, 'utf-8').trim(), 10);
  }
  return null;
}
```

### Method 2: Try Common Ports

```javascript
async function findApiPort() {
  const ports = [3001, 3002, 3003, 3004, 3005];
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}/health`);
      if (response.ok) {
        return port;
      }
    } catch (error) {
      // Continue to next port
    }
  }
  return null;
}
```

## JavaScript/TypeScript Integration

### Basic Client

```typescript
class ProjaxClient {
  private baseUrl: string;

  constructor(port: number = 3001) {
    this.baseUrl = `http://localhost:${port}/api`;
  }

  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${this.baseUrl}/projects`);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  }

  async addProject(name: string, path: string): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, path })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return response.json();
  }

  async scanProject(id: number) {
    const response = await fetch(`${this.baseUrl}/projects/${id}/scan`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return response.json();
  }
}

// Usage
const client = new ProjaxClient(3001);
const projects = await client.getProjects();
```

## Python Integration

```python
import requests
import os
import json

class ProjaxClient:
    def __init__(self, port=3001):
        self.base_url = f"http://localhost:{port}/api"
    
    def get_port(self):
        """Try to read port from file or use default"""
        port_file = os.path.join(os.path.expanduser("~"), ".projax", "api-port.txt")
        if os.path.exists(port_file):
            with open(port_file, 'r') as f:
                return int(f.read().strip())
        return 3001
    
    def get_projects(self):
        """Get all projects"""
        response = requests.get(f"{self.base_url}/projects")
        response.raise_for_status()
        return response.json()
    
    def add_project(self, name, path):
        """Add a new project"""
        response = requests.post(
            f"{self.base_url}/projects",
            json={"name": name, "path": path}
        )
        response.raise_for_status()
        return response.json()
    
    def scan_project(self, project_id):
        """Scan a project for tests"""
        response = requests.post(f"{self.base_url}/projects/{project_id}/scan")
        response.raise_for_status()
        return response.json()

# Usage
client = ProjaxClient()
projects = client.get_projects()
```

## Shell Script Integration

```bash
#!/bin/bash

# Get API port
API_PORT=$(cat ~/.projax/api-port.txt 2>/dev/null || echo "3001")
API_URL="http://localhost:${API_PORT}/api"

# Get all projects
get_projects() {
  curl -s "${API_URL}/projects" | jq '.'
}

# Add a project
add_project() {
  local name="$1"
  local path="$2"
  curl -s -X POST "${API_URL}/projects" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"${name}\", \"path\": \"${path}\"}" | jq '.'
}

# Scan a project
scan_project() {
  local id="$1"
  curl -s -X POST "${API_URL}/projects/${id}/scan" | jq '.'
}

# Usage
get_projects
add_project "My Project" "/path/to/project"
scan_project 1
```

## React Integration

```typescript
import { useState, useEffect } from 'react';

function useProjaxAPI(port: number = 3001) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = `http://localhost:${port}/api`;

  useEffect(() => {
    fetch(`${baseUrl}/projects`)
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch projects:', error);
        setLoading(false);
      });
  }, []);

  const addProject = async (name: string, path: string) => {
    const response = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, path })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    const newProject = await response.json();
    setProjects([...projects, newProject]);
    return newProject;
  };

  return { projects, loading, addProject };
}
```

## Error Handling

Always handle errors appropriately:

```typescript
try {
  const project = await client.addProject(name, path);
  console.log('Project added:', project);
} catch (error) {
  if (error.message.includes('already exists')) {
    // Handle duplicate
  } else if (error.message.includes('not found')) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

## CORS

The API has CORS enabled for all origins, so you can make requests from:
- Browser applications
- Electron apps
- Other web applications
- Any HTTP client

## Related Documentation

- [Endpoints](/docs/api/endpoints) - Complete endpoint reference
- [Error Handling](/docs/api/error-handling) - Error handling guide

