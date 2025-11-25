// Shared types matching @projax/api interfaces
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

export interface ProjectPort {
  id: number;
  project_id: number;
  port: number;
  script_name: string | null;
  config_source: string;
  last_detected: number;
  created_at: number;
}

