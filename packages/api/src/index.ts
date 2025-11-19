import express, { Express } from 'express';
import cors from 'cors';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as net from 'net';
import { migrateFromSQLite } from './migrate';
import apiRouter from './routes';

const app: Express = express();
const PORT_START = 3001;
const PORT_END = 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

// Health check endpoint (before /api prefix)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Function to check if port is available
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

// Function to find available port
async function findAvailablePort(): Promise<number> {
  for (let port = PORT_START; port <= PORT_END; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found in range ${PORT_START}-${PORT_END}`);
}

// Function to write port to file
function writePortToFile(port: number): void {
  const dataDir = path.join(os.homedir(), '.projax');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const portFile = path.join(dataDir, 'api-port.txt');
  fs.writeFileSync(portFile, port.toString(), 'utf-8');
}

// Main function
async function startServer() {
  try {
    // Run migration if needed
    const dataDir = path.join(os.homedir(), '.projax');
    const jsonPath = path.join(dataDir, 'data.json');
    const sqlitePath = path.join(dataDir, 'dashboard.db');
    
    if (!fs.existsSync(jsonPath) && fs.existsSync(sqlitePath)) {
      console.log('Running migration from SQLite to JSON...');
      migrateFromSQLite();
    }
    
    // Find available port
    const port = await findAvailablePort();
    
    // Write port to file
    writePortToFile(port);
    
    // Start server
    app.listen(port, () => {
      console.log(`✓ API server running on http://localhost:${port}`);
      console.log(`  Health check: http://localhost:${port}/health`);
      console.log(`  API base: http://localhost:${port}/api`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down API server...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\nShutting down API server...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start API server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export { app, startServer };

