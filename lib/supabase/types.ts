/**
 * TypeScript interfaces for Supabase data models
 */

// User model
export interface User {
  id: string; // UUID from Supabase Auth
  role: 'admin' | 'creator' | 'student';
  name: string;
  email: string;
  photo_url?: string;
  created_at: string;
}

// Course model
export interface Course {
  id: string; // UUID
  title: string;
  description: string;
  thumbnail_url?: string;
  thumbnail_description?: string;
  price: number;
  creator_id: string; // UUID linked to users.id
  created_at: string;
  is_featured?: boolean;
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
  order: number;
  playback_id?: string; // Mux playbackId for video playback
  duration?: number; // video duration in seconds
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
  enrolled_at: string;
  payment_status: 'paid' | 'pending';
}

// Search params for course filtering
export interface CourseSearchParams {
  query?: string;
  creator_id?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'title' | 'created_at' | 'price';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
} 