import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

interface BackupMetadata {
  version: string;
  timestamp: number;
  projax_version: string;
  created_at: string;
}

/**
 * Create a backup of the PROJAX database
 * @param outputPath Directory where the backup should be created
 * @returns Path to the created backup file
 */
export async function createBackup(outputPath: string): Promise<string> {
  const dataDir = path.join(os.homedir(), '.projax');
  const dbPath = path.join(dataDir, 'data.json');

  if (!fs.existsSync(dbPath)) {
    throw new Error('PROJAX database not found');
  }

  // Generate timestamped filename
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19); // YYYY-MM-DDTHHmmss
  const filename = `projax-backup-${timestamp}.pbz`;
  const backupPath = path.join(outputPath, filename);

  // Ensure output directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Read database file
  const dbContent = fs.readFileSync(dbPath, 'utf-8');
  
  // Create metadata
  const metadata: BackupMetadata = {
    version: '1.0',
    timestamp: Math.floor(Date.now() / 1000),
    projax_version: '3.4.0', // This should ideally come from package.json
    created_at: now.toISOString(),
  };

  // Create ZIP-like structure manually (simple approach)
  // For a proper ZIP, we'd use a library like adm-zip or archiver
  // For now, we'll create a simple JSON structure that can be restored
  const backupData = {
    metadata,
    data: JSON.parse(dbContent),
  };

  // Write backup file
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');

  return backupPath;
}

/**
 * Restore PROJAX database from a backup file
 * @param backupPath Path to the .pbz backup file
 */
export async function restoreBackup(backupPath: string): Promise<void> {
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }

  if (!backupPath.endsWith('.pbz')) {
    throw new Error('Invalid backup file extension. Expected .pbz');
  }

  // Read and parse backup file
  let backupContent: any;
  try {
    const content = fs.readFileSync(backupPath, 'utf-8');
    backupContent = JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid backup file format: ${error.message}`);
    }
    throw new Error(`Failed to read backup file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Validate backup structure
  if (!backupContent.metadata || !backupContent.data) {
    throw new Error('Invalid backup file structure: missing metadata or data');
  }

  // Validate metadata
  const metadata = backupContent.metadata as BackupMetadata;
  if (!metadata.version || !metadata.timestamp) {
    throw new Error('Invalid backup metadata');
  }

  // Validate data structure (basic check)
  if (typeof backupContent.data !== 'object' || !Array.isArray(backupContent.data.projects)) {
    throw new Error('Invalid backup data structure');
  }

  // Create backup of current database before restoring
  const dataDir = path.join(os.homedir(), '.projax');
  const dbPath = path.join(dataDir, 'data.json');
  
  if (fs.existsSync(dbPath)) {
    const backupTimestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const currentBackupPath = path.join(dataDir, `data.backup-${backupTimestamp}.json`);
    fs.copyFileSync(dbPath, currentBackupPath);
  }

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write restored data
  fs.writeFileSync(dbPath, JSON.stringify(backupContent.data, null, 2), 'utf-8');
}

/**
 * Validate a backup file without restoring
 * @param backupPath Path to the .pbz backup file
 * @returns true if valid, throws error if invalid
 */
export async function validateBackup(backupPath: string): Promise<boolean> {
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }

  if (!backupPath.endsWith('.pbz')) {
    throw new Error('Invalid backup file extension. Expected .pbz');
  }

  try {
    const content = fs.readFileSync(backupPath, 'utf-8');
    const backupContent = JSON.parse(content);

    if (!backupContent.metadata || !backupContent.data) {
      throw new Error('Invalid backup file structure');
    }

    const metadata = backupContent.metadata as BackupMetadata;
    if (!metadata.version || !metadata.timestamp) {
      throw new Error('Invalid backup metadata');
    }

    if (typeof backupContent.data !== 'object' || !Array.isArray(backupContent.data.projects)) {
      throw new Error('Invalid backup data structure');
    }

    return true;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in backup file: ${error.message}`);
    }
    throw error;
  }
}

