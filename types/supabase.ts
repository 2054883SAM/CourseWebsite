export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CourseCategory =
  | 'Français'
  | 'Mathématiques'
  | 'Science et technologie'
  | 'Géographie et histoire'
  | 'Culture et citoyenneté québécoise';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          role: 'admin' | 'teacher' | 'student';
          membership: 'free' | 'subscribed';
          name: string;
          email: string;
          photo_url: string | null;
          last_connected_at: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: 'admin' | 'teacher' | 'student';
          membership?: 'free' | 'subscribed';
          name: string;
          email: string;
          photo_url?: string | null;
          last_connected_at?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: 'admin' | 'teacher' | 'student';
          membership?: 'free' | 'subscribed';
          name?: string;
          email?: string;
          photo_url?: string | null;
          last_connected_at?: string | null;
          bio?: string | null;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          thumbnail_url: string | null;
          thumbnail_description: string | null;
          creator_id: string;
          created_at: string;
          is_featured: boolean;
          ce_que_vous_allez_apprendre: string | null;
          prerequis: string | null;
          public_cible: string | null;
          duree_estimee: string | null;
          niveau_difficulte: 'debutant' | 'intermediaire' | 'avance' | null;
          chapters: Json | null;
          chapters_ai_generated: boolean;
          categorie: CourseCategory | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          thumbnail_url?: string | null;
          thumbnail_description?: string | null;
          creator_id: string;
          created_at?: string;
          is_featured?: boolean;
          ce_que_vous_allez_apprendre?: string | null;
          prerequis?: string | null;
          public_cible?: string | null;
          duree_estimee?: string | null;
          niveau_difficulte?: 'debutant' | 'intermediaire' | 'avance' | null;
          chapters?: Json | null;
          chapters_ai_generated?: boolean;
          categorie?: CourseCategory | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          thumbnail_url?: string | null;
          thumbnail_description?: string | null;
          creator_id?: string;
          created_at?: string;
          is_featured?: boolean;
          ce_que_vous_allez_apprendre?: string | null;
          prerequis?: string | null;
          public_cible?: string | null;
          duree_estimee?: string | null;
          niveau_difficulte?: 'debutant' | 'intermediaire' | 'avance' | null;
          chapters?: Json | null;
          chapters_ai_generated?: boolean;
          categorie?: CourseCategory | null;
        };
        Relationships: [
          {
            foreignKeyName: 'courses_creator_id_fkey';
            columns: ['creator_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      sections: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order: number;
          playback_id: string | null;
          duration: number | null;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          order: number;
          playback_id?: string | null;
          duration?: number | null;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          order?: number;
          playback_id?: string | null;
          duration?: number | null;
        };
      };
      subtitles: {
        Row: {
          id: string;
          section_id: string;
          language_code: string;
          subtitle_url: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          language_code: string;
          subtitle_url: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          language_code?: string;
          subtitle_url?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
          status: 'active' | 'refunded' | 'disputed';
          progress: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrolled_at?: string;
          status?: 'active' | 'refunded' | 'disputed';
          progress?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          enrolled_at?: string;
          status?: 'active' | 'refunded' | 'disputed';
          progress?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
