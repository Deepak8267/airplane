export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          provider: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          provider?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          provider?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
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
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: string;
          description: string;
          thumbnail_url?: string | null;
          is_premium?: boolean;
          template_type: string;
          default_theme: Json;
          default_pages: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          category?: string;
          description?: string;
          thumbnail_url?: string | null;
          is_premium?: boolean;
          template_type?: string;
          default_theme?: Json;
          default_pages?: Json;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
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
        Insert: {
          id?: string;
          user_id: string;
          template_id: string;
          title?: string;
          recipient_name?: string;
          message?: string;
          theme: Json;
          cover_photo_url?: string | null;
          slug?: string | null;
          status?: string;
          is_published?: boolean;
          published_at?: string | null;
          watermark_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          recipient_name?: string;
          message?: string;
          theme?: Json;
          cover_photo_url?: string | null;
          status?: string;
          is_published?: boolean;
          published_at?: string | null;
          watermark_enabled?: boolean;
        };
        Relationships: [];
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
        Insert: {
          id?: string;
          experience_id: string;
          page_type: string;
          position: number;
          title?: string;
          content?: Json;
          media_urls?: string[];
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          page_type?: string;
          position?: number;
          title?: string;
          content?: Json;
          media_urls?: string[];
          settings?: Json;
        };
        Relationships: [];
      };
      analytics: {
        Row: {
          id: string;
          experience_id: string;
          views: number;
          unique_visitors: number;
          completions: number;
          average_completion_time_seconds: number;
          total_no_attempts: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          experience_id: string;
          views?: number;
          unique_visitors?: number;
          completions?: number;
          average_completion_time_seconds?: number;
          total_no_attempts?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          views?: number;
          unique_visitors?: number;
          completions?: number;
          average_completion_time_seconds?: number;
          total_no_attempts?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          experience_id: string;
          visitor_id: string;
          session_id: string;
          event_type: string;
          page_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          experience_id: string;
          visitor_id: string;
          session_id: string;
          event_type: string;
          page_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          visitor_id?: string;
          session_id?: string;
          event_type?: string;
          page_id?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          razorpay_payment_id: string | null;
          razorpay_order_id: string | null;
          razorpay_signature: string | null;
          amount: number;
          currency: string;
          status: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_signature?: string | null;
          amount: number;
          currency?: string;
          status: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          razorpay_payment_id?: string | null;
          razorpay_order_id?: string | null;
          razorpay_signature?: string | null;
          amount?: number;
          currency?: string;
          status?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          status: string;
          razorpay_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: string;
          status?: string;
          razorpay_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan?: string;
          status?: string;
          razorpay_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      publish_experience: {
        Args: { input_experience_id: string };
        Returns: string;
      };
      track_event: {
        Args: {
          input_experience_id: string;
          input_visitor_id: string;
          input_session_id: string;
          input_event_type: string;
          input_page_id?: string | null;
          input_metadata?: Json;
        };
        Returns: void;
      };
    };
  };
};
