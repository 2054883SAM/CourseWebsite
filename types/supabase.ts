export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          role: 'admin' | 'creator' | 'student';
          name: string;
          email: string;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: 'admin' | 'creator' | 'student';
          name: string;
          email: string;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: 'admin' | 'creator' | 'student';
          name?: string;
          email?: string;
          photo_url?: string | null;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          thumbnail_url: string | null;
          price: number;
          creator_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          thumbnail_url?: string | null;
          price: number;
          creator_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          thumbnail_url?: string | null;
          price?: number;
          creator_id?: string;
          created_at?: string;
        };
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
          payment_status: 'paid' | 'pending';
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrolled_at?: string;
          payment_status: 'paid' | 'pending';
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          enrolled_at?: string;
          payment_status?: 'paid' | 'pending';
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
};
