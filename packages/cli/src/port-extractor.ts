import * as fs from 'fs';
import * as path from 'path';

export interface PortInfo {
  port: number;
  script: string | null;
  source: string;
}

/**
 * Extract ports from a project's configuration files
 */
export async function extractPortsFromProject(projectPath: string): Promise<PortInfo[]> {
  const ports: PortInfo[] = [];

  // Extract from package.json scripts
  const packageJsonPorts = extractPortsFromPackageJson(projectPath);
  ports.push(...packageJsonPorts);

  // Extract from vite.config.js/ts
  const vitePorts = extractPortsFromViteConfig(projectPath);
  ports.push(...vitePorts);

  // Extract from next.config.js/ts
  const nextPorts = extractPortsFromNextConfig(projectPath);
  ports.push(...nextPorts);

  // Extract from webpack.config.js
  const webpackPorts = extractPortsFromWebpackConfig(projectPath);
  ports.push(...webpackPorts);

  // Extract from angular.json
  const angularPorts = extractPortsFromAngularConfig(projectPath);
  ports.push(...angularPorts);

  // Extract from nuxt.config.js/ts
  const nuxtPorts = extractPortsFromNuxtConfig(projectPath);
  ports.push(...nuxtPorts);

  // Extract from .env files
  const envPorts = extractPortsFromEnvFiles(projectPath);
  ports.push(...envPorts);

  // Remove duplicates (same port and script)
  const uniquePorts = Array.from(
    new Map(ports.map(p => [`${p.port}-${p.script || ''}`, p])).values()
  );

  return uniquePorts;
}

/**
 * Extract ports from package.json scripts
 */
function extractPortsFromPackageJson(projectPath: string): PortInfo[] {
  const ports: PortInfo[] = [];
  const packageJsonPath = path.join(projectPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return ports;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const scripts = packageJson.scripts || {};

    for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
      if (typeof scriptCommand === 'string') {
        // Look for --port, -p, PORT= patterns
        const portPatterns = [
          /--port\s+(\d+)/i,
          /-p\s+(\d+)/i,
          /PORT\s*=\s*(\d+)/i,
          /VITE_PORT\s*=\s*(\d+)/i,
          /NEXT_PORT\s*=\s*(\d+)/i,
          /PORT=(\d+)/i,
        ];

        for (const pattern of portPatterns) {
          const match = scriptCommand.match(pattern);
          if (match && match[1]) {
            const port = parseInt(match[1], 10);
            if (!isNaN(port) && port > 0 && port <= 65535) {
              ports.push({
                port,
                script: scriptName,
                source: 'package.json',
              });
              break; // Only add once per script
            }
          }
        }
      }
    }
  } catch (error) {
    // Ignore parsing errors
  }

  return ports;
}

/**
 * Extract ports from vite.config.js/ts
 */
function extractPortsFromViteConfig(projectPath: string): PortInfo[] {
  const ports: PortInfo[] = [];
  const configFiles = [
    'vite.config.js',
    'vite.config.ts',
    'vite.config.mjs',
    'vite.config.cjs',
  ];

  for (const configFile of configFiles) {
    const configPath = path.join(projectPath, configFile);
    if (!fs.existsSync(configPath)) continue;

    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      
      // Try to extract from server.port
      const patterns = [
        /server\s*:\s*\{[^}]*port\s*:\s*(\d+)/i,
        /server\s*:\s*\{[^}]*port\s*:\s*['"](\d+)['"]/i,
        /port\s*:\s*(\d+)/i,
        /port\s*:\s*['"](\d+)['"]/i,
      ];

      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          const port = parseInt(match[1], 10);
          if (!isNaN(port) && port > 0 && port <= 65535) {
            ports.push({
              port,
              script: null,
              source: configFile,
            });
            break;
          }
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  return ports;
}

/**
 * Extract ports from next.config.js/ts
 */
function extractPortsFromNextConfig(projectPath: string): PortInfo[] {
  const ports: PortInfo[] = [];
  const configFiles = ['next.config.js', 'next.config.ts', 'next.config.mjs'];

  for (const configFile of configFiles) {
    const configPath = path.join(projectPath, configFile);
    if (!fs.existsSync(configPath)) continue;

    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      
      // Next.js doesn't typically configure port in config, but check for devServer
      const patterns = [
        /devServer\s*:\s*\{[^}]*port\s*:\s*(\d+)/i,
        /port\s*:\s*(\d+)/i,
      ];

      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          const port = parseInt(match[1], 10);
          if (!isNaN(port) && port > 0 && port <= 65535) {
            ports.push({
              port,
              script: null,
              source: configFile,
            });
            break;
          }
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  return ports;
}

/**
 * Extract ports from webpack.config.js
 */
function extractPortsFromWebpackConfig(projectPath: string): PortInfo[] {
  const ports: PortInfo[] = [];
  const configFiles = ['webpack.config.js', 'webpack.config.ts'];

  for (const configFile of configFiles) {
    const configPath = path.join(projectPath, configFile);
    if (!fs.existsSync(configPath)) continue;

    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      
      // Look for devServer.port
      const patterns = [
        /devServer\s*:\s*\{[^}]*port\s*:\s*(\d+)/i,
        /devServer\s*:\s*\{[^}]*port\s*:\s*['"](\d+)['"]/i,
      ];

      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          const port = parseInt(match[1], 10);
          if (!isNaN(port) && port > 0 && port <= 65535) {
            ports.push({
              port,
              script: null,
              source: configFile,
            });
            break;
          }
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  return ports;
}

/**
 * Extract ports from angular.json
 */
function extractPortsFromAngularConfig(projectPath: string): PortInfo[] {
  const ports: PortInfo[] = [];
  const configPath = path.join(projectPath, 'angular.json');

  if (!fs.existsSync(configPath)) {
    return ports;
  }

  try {
    const angularJson = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    // Navigate through projects -> architect -> serve -> options -> port
    const projects = angularJson.projects || {};
    for (const projectName of Object.keys(projects)) {
      const project = projects[projectName];
      const serve = project?.architect?.serve;
      if (serve?.options?.port) {
        const port = parseInt(serve.options.port, 10);
        if (!isNaN(port) && port > 0 && port <= 65535) {
          ports.push({
            port,
            script: null,
            source: 'angular.json',
          });
        }
      }
    }
  } catch (error) {
    // Ignore parsing errors
  }

  return ports;
}

/**
 * Extract ports from nuxt.config.js/ts
 */
function extractPortsFromNuxtConfig(projectPath: string): PortInfo[] {
  const ports: PortInfo[] = [];
  const configFiles = ['nuxt.config.js', 'nuxt.config.ts'];

  for (const configFile of configFiles) {
    const configPath = path.join(projectPath, configFile);
    if (!fs.existsSync(configPath)) continue;

    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      
      // Look for server.port
      const patterns = [
        /server\s*:\s*\{[^}]*port\s*:\s*(\d+)/i,
        /server\s*:\s*\{[^}]*port\s*:\s*['"](\d+)['"]/i,
      ];

      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          const port = parseInt(match[1], 10);
          if (!isNaN(port) && port > 0 && port <= 65535) {
            ports.push({
              port,
              script: null,
              source: configFile,
            });
            break;
          }
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  return ports;
}

/**
 * Extract ports from .env files
 */
function extractPortsFromEnvFiles(projectPath: string): PortInfo[] {
  const ports: PortInfo[] = [];
  const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];

  for (const envFile of envFiles) {
    const envPath = path.join(projectPath, envFile);
    if (!fs.existsSync(envPath)) continue;

    try {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');

      for (const line of lines) {
        // Skip comments
        if (line.trim().startsWith('#')) continue;

        // Look for PORT=, VITE_PORT=, NEXT_PORT=, etc.
        const patterns = [
          /^PORT\s*=\s*(\d+)/i,
          /^VITE_PORT\s*=\s*(\d+)/i,
          /^NEXT_PORT\s*=\s*(\d+)/i,
          /^REACT_APP_PORT\s*=\s*(\d+)/i,
        ];

        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            const port = parseInt(match[1], 10);
            if (!isNaN(port) && port > 0 && port <= 65535) {
              ports.push({
                port,
                script: null,
                source: envFile,
              });
              break;
            }
          }
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  return ports;
}

