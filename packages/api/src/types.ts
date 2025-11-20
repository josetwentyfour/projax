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

export interface DatabaseSchema {
  projects: Project[];
  tests: Test[];
  jenkins_jobs: JenkinsJob[];
  project_ports: ProjectPort[];
  test_results: TestResult[];
  settings: Array<{ key: string; value: string; updated_at: number }>;
}

