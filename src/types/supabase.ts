export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          price_id: string;
          quantity: number;
          cancel_at_period_end: boolean;
          created_at: string;
          current_period_start: string;
          current_period_end: string;
          ended_at: string | null;
          cancel_at: string | null;
          canceled_at: string | null;
          trial_start: string | null;
          trial_end: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status: string;
          price_id: string;
          quantity?: number;
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_start: string;
          current_period_end: string;
          ended_at?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          price_id?: string;
          quantity?: number;
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_start?: string;
          current_period_end?: string;
          ended_at?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          is_premium: boolean;
          openai_api_key: string | null;
        };
        Insert: {
          user_id: string;
          is_premium?: boolean;
          openai_api_key?: string | null;
        };
        Update: {
          user_id?: string;
          is_premium?: boolean;
          openai_api_key?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
} 