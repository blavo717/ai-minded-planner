
export interface Profile {
  id: string;
  full_name: string; // Always present (with fallback)
  email?: string;    // Optional, because it can be null in DB
  avatar_url?: string;
  timezone?: string;
  role?: 'project_manager' | 'engineer' | 'coordinator' | 'specialist' | 'admin';
  skills?: string[];
  phone?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}
