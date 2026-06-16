export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      templates: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          description: string;
          thumbnail_url: string | null;
          is_premium: boolean;
          template_type: string;
          default_theme: Json;
          default_pages: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      experiences: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          title: string;
          recipient_name: string;
          message: string;
          theme: Json;
          cover_photo_url: string | null;
          slug: string | null;
          status: string;
          is_published: boolean;
          published_at: string | null;
          watermark_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      experience_pages: {
        Row: {
          id: string;
          experience_id: string;
          page_type: string;
          position: number;
          title: string;
          content: Json;
          media_urls: string[];
          settings: Json;
          created_at: string;
          updated_at: string;
        };
      };
      events: {
        Insert: {
          experience_id: string;
          visitor_id: string;
          session_id: string;
          event_type: string;
          page_id?: string | null;
          metadata?: Json;
        };
      };
    };
    Functions: {
      publish_experience: {
        Args: { input_experience_id: string };
        Returns: string;
      };
    };
  };
};
