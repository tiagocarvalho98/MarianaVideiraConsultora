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
      activities: {
        Row: {
          body: string | null
          created_at: string
          id: string
          metadata: Json
          occurred_at: string
          opportunity_id: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          opportunity_id: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          opportunity_id?: string
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          email_normalized: string | null
          first_name: string
          id: string
          last_name: string | null
          phone: string
          phone_normalized: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_normalized?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          phone: string
          phone_normalized: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          email_normalized?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          phone?: string
          phone_normalized?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          contact_id: string | null
          created_at: string
          fbclid: string | null
          form_type: Database["public"]["Enums"]["opportunity_type"]
          gclid: string | null
          id: string
          landing_page: string | null
          marketing_consent: boolean
          opportunity_id: string | null
          privacy_consent: boolean
          raw_payload: Json
          referrer: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          fbclid?: string | null
          form_type: Database["public"]["Enums"]["opportunity_type"]
          gclid?: string | null
          id?: string
          landing_page?: string | null
          marketing_consent?: boolean
          opportunity_id?: string | null
          privacy_consent?: boolean
          raw_payload: Json
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          fbclid?: string | null
          form_type?: Database["public"]["Enums"]["opportunity_type"]
          gclid?: string | null
          id?: string
          landing_page?: string | null
          marketing_consent?: boolean
          opportunity_id?: string | null
          privacy_consent?: boolean
          raw_payload?: Json
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          assigned_to: string | null
          budget_max: number | null
          budget_min: number | null
          contact_id: string
          created_at: string
          created_by: string | null
          current_property_to_sell: boolean | null
          financing_status: string | null
          first_contact_at: string | null
          id: string
          last_activity_at: string | null
          location: string | null
          lost_notes: string | null
          lost_reason: string | null
          next_action_at: string | null
          property_already_listed: boolean | null
          property_type: string | null
          source_id: string | null
          stage: string
          status: Database["public"]["Enums"]["opportunity_status"]
          temperature: Database["public"]["Enums"]["lead_temperature"]
          timeframe: string | null
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          contact_id: string
          created_at?: string
          created_by?: string | null
          current_property_to_sell?: boolean | null
          financing_status?: string | null
          first_contact_at?: string | null
          id?: string
          last_activity_at?: string | null
          location?: string | null
          lost_notes?: string | null
          lost_reason?: string | null
          next_action_at?: string | null
          property_already_listed?: boolean | null
          property_type?: string | null
          source_id?: string | null
          stage: string
          status?: Database["public"]["Enums"]["opportunity_status"]
          temperature?: Database["public"]["Enums"]["lead_temperature"]
          timeframe?: string | null
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          contact_id?: string
          created_at?: string
          created_by?: string | null
          current_property_to_sell?: boolean | null
          financing_status?: string | null
          first_contact_at?: string | null
          id?: string
          last_activity_at?: string | null
          location?: string | null
          lost_notes?: string | null
          lost_reason?: string | null
          next_action_at?: string | null
          property_already_listed?: boolean | null
          property_type?: string | null
          source_id?: string | null
          stage?: string
          status?: Database["public"]["Enums"]["opportunity_status"]
          temperature?: Database["public"]["Enums"]["lead_temperature"]
          timeframe?: string | null
          type?: Database["public"]["Enums"]["opportunity_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          due_at: string
          id: string
          opportunity_id: string
          priority: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          due_at: string
          id?: string
          opportunity_id: string
          priority?: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          due_at?: string
          id?: string
          opportunity_id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_public_intake_rate_limit: {
        Args: {
          p_key_hash: string
          p_limit?: number
          p_window_seconds?: number
        }
        Returns: boolean
      }
      mark_opportunity_lost: {
        Args: { p_notes?: string; p_opportunity_id: string; p_reason: string }
        Returns: {
          assigned_to: string | null
          budget_max: number | null
          budget_min: number | null
          contact_id: string
          created_at: string
          created_by: string | null
          current_property_to_sell: boolean | null
          financing_status: string | null
          first_contact_at: string | null
          id: string
          last_activity_at: string | null
          location: string | null
          lost_notes: string | null
          lost_reason: string | null
          next_action_at: string | null
          property_already_listed: boolean | null
          property_type: string | null
          source_id: string | null
          stage: string
          status: Database["public"]["Enums"]["opportunity_status"]
          temperature: Database["public"]["Enums"]["lead_temperature"]
          timeframe: string | null
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "opportunities"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_public_lead_intake: { Args: { _payload: Json }; Returns: Json }
      transition_opportunity_stage: {
        Args: { p_new_stage: string; p_opportunity_id: string }
        Returns: {
          assigned_to: string | null
          budget_max: number | null
          budget_min: number | null
          contact_id: string
          created_at: string
          created_by: string | null
          current_property_to_sell: boolean | null
          financing_status: string | null
          first_contact_at: string | null
          id: string
          last_activity_at: string | null
          location: string | null
          lost_notes: string | null
          lost_reason: string | null
          next_action_at: string | null
          property_already_listed: boolean | null
          property_type: string | null
          source_id: string | null
          stage: string
          status: Database["public"]["Enums"]["opportunity_status"]
          temperature: Database["public"]["Enums"]["lead_temperature"]
          timeframe: string | null
          type: Database["public"]["Enums"]["opportunity_type"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "opportunities"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      activity_type:
        | "form_submission"
        | "stage_changed"
        | "call"
        | "meeting"
        | "note"
        | "task_created"
        | "task_completed"
        | "lost"
      app_role: "admin" | "consultor"
      lead_temperature: "fria" | "morna" | "quente"
      opportunity_status: "new" | "open" | "won" | "lost" | "archived"
      opportunity_type: "buyer" | "seller"
      task_priority: "low" | "normal" | "high" | "urgent"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      activity_type: [
        "form_submission",
        "stage_changed",
        "call",
        "meeting",
        "note",
        "task_created",
        "task_completed",
        "lost",
      ],
      app_role: ["admin", "consultor"],
      lead_temperature: ["fria", "morna", "quente"],
      opportunity_status: ["new", "open", "won", "lost", "archived"],
      opportunity_type: ["buyer", "seller"],
      task_priority: ["low", "normal", "high", "urgent"],
    },
  },
} as const

