export type Database = {
  public: {
    Tables: {
      entries: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          created_at: string;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          created_at?: string;
          logged_at: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          logged_at?: string;
        };
      };
      insights: {
        Row: {
          id: string;
          user_id: string;
          insight_type: string;
          data: Record<string, unknown>;
          week_start: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          insight_type: string;
          data: Record<string, unknown>;
          week_start: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          insight_type?: string;
          data?: Record<string, unknown>;
          week_start?: string;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
