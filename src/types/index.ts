// Shared types
export interface License {
  key: string;
  name: string;
  spdx_id: string;
  url: string;
  node_id: string;
}

export interface Issue {
  id: string;
  title: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  repository_url: string;
  repository_name: string;
  license: License | null;
  stars_count: number;
  fork_count: number;
  language: string | null;
  is_assigned: boolean;
  labels: string[];
  comments_count: number;
  has_pull_requests: boolean;
  pr_status: string | null;
  difficulty_score?: number;
  difficulty_label?: string;
  difficulty_color?: string;
}

export type Service = "github";

export interface FilterParams {
  service: Service;
  minStars: number;
  maxStars: number;
  minForks: number;
  language: string;
  isAssigned: boolean;
  cursor: string | null;
  category: string;
  framework: string;
  hasPullRequests: boolean;
  searchQuery: string;
  dateFrom?: string;
  dateTo?: string;
}
