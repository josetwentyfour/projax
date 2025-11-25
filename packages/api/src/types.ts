// Shared types matching @projax/core interfaces
export interface Project {
  id: number;
  name: string;
  path: string;
  description: string | null;
  framework: string | null;
  last_scanned: number | null;
  created_at: number;
  tags?: string[];
  git_branch?: string | null;
}

export interface Test {
  id: number;
  project_id: number;
  file_path: string;
  framework: string | null;
  status: string | null;
  last_run: number | null;
  created_at: number;
}

export interface JenkinsJob {
  id: number;
  project_id: number;
  job_name: string;
  job_url: string;
  last_build_status: string | null;
  last_build_number: number | null;
  last_updated: number | null;
  created_at: number;
}

export interface ProjectPort {
  id: number;
  project_id: number;
  port: number;
  script_name: string | null;
  config_source: string;
  last_detected: number;
  created_at: number;
}

export interface TestResult {
  id: number;
  project_id: number;
  script_name: string;
  framework: string | null;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number | null; // milliseconds
  coverage: number | null; // percentage
  timestamp: number;
  raw_output: string | null;
}

export interface Workspace {
  id: number;
  name: string;
  workspace_file_path: string;
  description: string | null;
  tags?: string[];
  created_at: number;
  last_opened: number | null;
}

export interface WorkspaceProject {
  id: number;
  workspace_id: number;
  project_path: string;
  order: number;
  created_at: number;
}

export interface ProjectSettings {
  id: number;
  project_id: number;
  script_sort_order: 'default' | 'alphabetical' | 'last-used';
  updated_at: number;
}

export interface DatabaseSchema {
  projects: Project[];
  tests: Test[];
  jenkins_jobs: JenkinsJob[];
  project_ports: ProjectPort[];
  test_results: TestResult[];
  settings: Array<{ key: string; value: string; updated_at: number }>;
  workspaces: Workspace[];
  workspace_projects: WorkspaceProject[];
  project_settings: ProjectSettings[];
}

