/**
 * TypeScript interfaces for Supabase data models
 */

// User model
export interface User {
  id: string; // UUID from Supabase Auth
  role: 'admin' | 'teacher' | 'student';
  membership?: 'free' | 'subscribed';
  name: string;
  email: string;
  photo_url?: string;
  bio?: string;
  created_at: string;
}

// Course model
export interface Course {
  id: string; // UUID
  title: string;
  description: string;
  thumbnail_url?: string;
  thumbnail_description?: string;
  creator_id: string; // UUID linked to users.id
  created_at: string;
  is_featured?: boolean;
  // New: official Québec elementary categories
  categorie?: import('@/types/supabase').CourseCategory | null;
  // Nouveaux champs pour les informations détaillées
  ce_que_vous_allez_apprendre?: string;
  prerequis?: string;
  public_cible?: string;
  duree_estimee?: string;
  niveau_difficulte?: 'debutant' | 'intermediaire' | 'avance';
  // Champ pour le playbackId de Mux
  playback_id?: string;
  // Computed fields (not in DB)
  creator?: User;
  section_count?: number;
}

// Section model
export interface Section {
  id: string; // UUID
  course_id: string; // UUID linked to courses.id
  title: string;
  // Some code paths use section_number; older code used order
  section_number?: number;
  order?: number;
  playback_id?: string; // video playback id
  duration?: number; // duration in minutes
  // JSON fields stored in DB as JSON/JSONB (may be serialized strings when fetched)
  chapters?: any[];
  questions?: any[];
  created_at?: string;
  // Computed fields (not in DB)
  subtitles?: Subtitle[];
}

// Subtitle model
export interface Subtitle {
  id: string; // UUID
  section_id: string; // UUID linked to sections.id
  language_code: string; // e.g., 'en', 'fr', 'es'
  subtitle_url: string; // URL to .vtt file
}

// Enrollment model
export interface Enrollment {
  id: string; // UUID
  user_id: string; // UUID linked to users.id
  course_id: string; // UUID linked to courses.id
  created_at: string;
  updated_at: string;
  status: 'active' | 'refunded' | 'disputed'; // Updated to match schema
}

// Section Progress model
export interface SectionProgress {
  id?: string;
  user_id: string;
  course_id: string;
  section_id: string;
  progress_percentage: number; // 0-100
  completed: boolean;
  last_watched_at: string;
  quiz_score?: number | null; // 0-100, null if quiz not attempted
  quiz_passed?: boolean | null; // true if score >= 70%, false if < 70%, null if not attempted
  created_at?: string;
  updated_at?: string;
}

// Search params for course filtering
export interface CourseSearchParams {
  query?: string;
  creator_id?: string;
  sort_by?: 'title' | 'created_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
