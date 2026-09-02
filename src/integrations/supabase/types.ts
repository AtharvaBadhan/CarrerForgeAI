export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string | null
          category: Database["public"]["Enums"]["resume_category"] | null
          company: string
          cover_letter_id: string | null
          created_at: string
          follow_up_at: string | null
          id: string
          job_id: string | null
          location: string | null
          notes: string | null
          position: number
          recruiter_email: string | null
          recruiter_name: string | null
          resume_id: string | null
          role: string
          salary: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          category?: Database["public"]["Enums"]["resume_category"] | null
          company: string
          cover_letter_id?: string | null
          created_at?: string
          follow_up_at?: string | null
          id?: string
          job_id?: string | null
          location?: string | null
          notes?: string | null
          position?: number
          recruiter_email?: string | null
          recruiter_name?: string | null
          resume_id?: string | null
          role: string
          salary?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          category?: Database["public"]["Enums"]["resume_category"] | null
          company?: string
          cover_letter_id?: string | null
          created_at?: string
          follow_up_at?: string | null
          id?: string
          job_id?: string | null
          location?: string | null
          notes?: string | null
          position?: number
          recruiter_email?: string | null
          recruiter_name?: string | null
          resume_id?: string | null
          role?: string
          salary?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_cover_letter_id_fkey"
            columns: ["cover_letter_id"]
            isOneToOne: false
            referencedRelation: "cover_letters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_logs: {
        Row: {
          created_at: string
          id: string
          message: string | null
          payload: Json | null
          status: string
          user_id: string
          workflow: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          payload?: Json | null
          status?: string
          user_id: string
          workflow: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          payload?: Json | null
          status?: string
          user_id?: string
          workflow?: string
        }
        Relationships: []
      }
      cover_letters: {
        Row: {
          content: string
          created_at: string
          id: string
          job_id: string | null
          label: string
          length: Database["public"]["Enums"]["cover_letter_length"]
          resume_id: string | null
          tone: Database["public"]["Enums"]["cover_letter_tone"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          job_id?: string | null
          label: string
          length?: Database["public"]["Enums"]["cover_letter_length"]
          resume_id?: string | null
          tone?: Database["public"]["Enums"]["cover_letter_tone"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          job_id?: string | null
          label?: string
          length?: Database["public"]["Enums"]["cover_letter_length"]
          resume_id?: string | null
          tone?: Database["public"]["Enums"]["cover_letter_tone"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cover_letters_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cover_letters_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          analysis: Json | null
          category: Database["public"]["Enums"]["resume_category"] | null
          company: string | null
          created_at: string
          id: string
          location: string | null
          raw_text: string
          source_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          category?: Database["public"]["Enums"]["resume_category"] | null
          company?: string | null
          created_at?: string
          id?: string
          location?: string | null
          raw_text?: string
          source_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis?: Json | null
          category?: Database["public"]["Enums"]["resume_category"] | null
          company?: string | null
          created_at?: string
          id?: string
          location?: string | null
          raw_text?: string
          source_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      match_reports: {
        Row: {
          created_at: string
          id: string
          job_id: string
          missing_keywords: string[] | null
          resume_id: string
          score: number
          strong_matches: string[] | null
          suggestions: Json | null
          user_id: string
          weak_areas: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          missing_keywords?: string[] | null
          resume_id: string
          score?: number
          strong_matches?: string[] | null
          suggestions?: Json | null
          user_id: string
          weak_areas?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          missing_keywords?: string[] | null
          resume_id?: string
          score?: number
          strong_matches?: string[] | null
          suggestions?: Json | null
          user_id?: string
          weak_areas?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "match_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_reports_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_model: string | null
          created_at: string
          default_resume_id: string | null
          display_name: string | null
          github_url: string | null
          headline: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          portfolio_url: string | null
          preferred_technologies: string[] | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          target_locations: string[] | null
          target_roles: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          created_at?: string
          default_resume_id?: string | null
          display_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          preferred_technologies?: string[] | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          target_locations?: string[] | null
          target_roles?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model?: string | null
          created_at?: string
          default_resume_id?: string | null
          display_name?: string | null
          github_url?: string | null
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          preferred_technologies?: string[] | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          target_locations?: string[] | null
          target_roles?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          category: Database["public"]["Enums"]["resume_category"]
          content_text: string
          created_at: string
          file_name: string | null
          file_path: string | null
          id: string
          is_default: boolean
          label: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["resume_category"]
          content_text?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          is_default?: boolean
          label: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["resume_category"]
          content_text?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          is_default?: boolean
          label?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status:
        | "saved"
        | "applied"
        | "oa"
        | "interview"
        | "final_round"
        | "offer"
        | "rejected"
        | "ghosted"
      cover_letter_length: "short" | "professional" | "standout"
      cover_letter_tone:
        | "professional"
        | "confident"
        | "consulting"
        | "data_analyst"
        | "corporate"
        | "startup"
      resume_category:
        | "data_analyst"
        | "data_science"
        | "business_analyst"
        | "consulting"
        | "cloud"
        | "frontend"
        | "general"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: [
        "saved",
        "applied",
        "oa",
        "interview",
        "final_round",
        "offer",
        "rejected",
        "ghosted",
      ],
      cover_letter_length: ["short", "professional", "standout"],
      cover_letter_tone: [
        "professional",
        "confident",
        "consulting",
        "data_analyst",
        "corporate",
        "startup",
      ],
      resume_category: [
        "data_analyst",
        "data_science",
        "business_analyst",
        "consulting",
        "cloud",
        "frontend",
        "general",
      ],
    },
  },
} as const
