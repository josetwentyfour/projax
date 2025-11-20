# Error Handling

The API uses standard HTTP status codes and consistent error response format.

## HTTP Status Codes

### Success Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `204 No Content` - Successful deletion (no response body)

### Client Error Codes

- `400 Bad Request` - Invalid request (missing fields, invalid data)
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate project path)

### Server Error Codes

- `500 Internal Server Error` - Server error

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

## Common Errors

### 400 Bad Request

**Missing Required Fields:**
```json
{
  "error": "Name and path are required"
}
```

**Invalid Path:**
```json
{
  "error": "Path does not exist"
}
```

**Path Not Directory:**
```json
{
  "error": "Path must be a directory"
}
```

**Invalid Project ID:**
```json
{
  "error": "Invalid project ID"
}
```

**No Fields to Update:**
```json
{
  "error": "No valid fields to update"
}
```

**Missing Setting Value:**
```json
{
  "error": "Value is required"
}
```

### 404 Not Found

**Project Not Found:**
```json
{
  "error": "Project not found"
}
```

### 409 Conflict

**Duplicate Project Path:**
```json
{
  "error": "Project with this path already exists",
  "project": { /* existing project */ }
}
```

### 500 Internal Server Error

**Generic Server Error:**
```json
{
  "error": "Failed to fetch projects"
}
```

**Specific Error:**
```json
{
  "error": "Detailed error message"
}
```

## Error Handling in Clients

### JavaScript/TypeScript

```typescript
async function addProject(name: string, path: string) {
  try {
    const response = await fetch('http://localhost:38124/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, path })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to add project:', error.message);
    throw error;
  }
}
```

### cURL

```bash
# Check for errors
response=$(curl -s -w "\n%{http_code}" http://localhost:38124/api/projects/999)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" != "200" ]; then
  echo "Error: $body"
fi
```

## Best Practices

1. **Always check HTTP status codes** before processing response
2. **Read error messages** from the `error` field
3. **Handle specific error codes** appropriately (e.g., 404 vs 409)
4. **Log errors** for debugging
5. **Provide user-friendly messages** based on error types

## Related Documentation

- [Endpoints](/docs/api/endpoints) - Complete endpoint reference
- [Integration](/docs/api/integration) - Integration examples

