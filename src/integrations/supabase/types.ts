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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string | null
          icon: string | null
          id: string
          unlocked_at: string
          user_id: string | null
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description?: string | null
          icon?: string | null
          id?: string
          unlocked_at?: string
          user_id?: string | null
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string | null
          icon?: string | null
          id?: string
          unlocked_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      balance_history: {
        Row: {
          balance: number
          bank_account_id: string | null
          created_at: string
          id: string
          recorded_at: string
          user_id: string | null
        }
        Insert: {
          balance: number
          bank_account_id?: string | null
          created_at?: string
          id?: string
          recorded_at?: string
          user_id?: string | null
        }
        Update: {
          balance?: number
          bank_account_id?: string | null
          created_at?: string
          id?: string
          recorded_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "balance_history_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_type: string
          color: string | null
          created_at: string
          credit_limit: number | null
          current_balance: number
          icon: string | null
          id: string
          institution: string | null
          is_active: boolean | null
          last_sync_at: string | null
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_type: string
          color?: string | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number
          icon?: string | null
          id?: string
          institution?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_type?: string
          color?: string | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number
          icon?: string | null
          id?: string
          institution?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bills: {
        Row: {
          amount: number
          category: string
          created_at: string
          day: number
          id: string
          is_paid: boolean
          month: number
          name: string
          updated_at: string
          user_id: string | null
          year: number
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          day: number
          id?: string
          is_paid?: boolean
          month: number
          name: string
          updated_at?: string
          user_id?: string | null
          year: number
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          day?: number
          id?: string
          is_paid?: boolean
          month?: number
          name?: string
          updated_at?: string
          user_id?: string | null
          year?: number
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          category: string
          color: string | null
          created_at: string
          id: string
          is_active: boolean | null
          monthly_limit: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          monthly_limit: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          monthly_limit?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      daily_insights: {
        Row: {
          action_suggestion: string | null
          content: string
          created_at: string
          id: string
          insight_date: string
          insight_type: string
          is_read: boolean | null
          title: string
          user_id: string | null
        }
        Insert: {
          action_suggestion?: string | null
          content: string
          created_at?: string
          id?: string
          insight_date?: string
          insight_type: string
          is_read?: boolean | null
          title: string
          user_id?: string | null
        }
        Update: {
          action_suggestion?: string | null
          content?: string
          created_at?: string
          id?: string
          insight_date?: string
          insight_type?: string
          is_read?: boolean | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      financial_history: {
        Row: {
          category_breakdown: Json | null
          created_at: string
          health_score: number | null
          id: string
          month: number
          paid_amount: number
          pending_amount: number
          total_amount: number
          user_id: string | null
          year: number
        }
        Insert: {
          category_breakdown?: Json | null
          created_at?: string
          health_score?: number | null
          id?: string
          month: number
          paid_amount: number
          pending_amount: number
          total_amount: number
          user_id?: string | null
          year: number
        }
        Update: {
          category_breakdown?: Json | null
          created_at?: string
          health_score?: number | null
          id?: string
          month?: number
          paid_amount?: number
          pending_amount?: number
          total_amount?: number
          user_id?: string | null
          year?: number
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          current_value: number | null
          description: string | null
          end_date: string | null
          goal_type: string
          id: string
          start_date: string
          status: string
          target_category: string | null
          target_value: number | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string | null
          goal_type: string
          id?: string
          start_date?: string
          status?: string
          target_category?: string | null
          target_value?: number | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string | null
          goal_type?: string
          id?: string
          start_date?: string
          status?: string
          target_category?: string | null
          target_value?: number | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          family_size: number | null
          id: string
          income_range: string | null
          notification_preferences: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          family_size?: number | null
          id?: string
          income_range?: string | null
          notification_preferences?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          family_size?: number | null
          id?: string
          income_range?: string | null
          notification_preferences?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      statement_imports: {
        Row: {
          bank_account_id: string | null
          created_at: string
          error_message: string | null
          file_name: string
          file_type: string
          id: string
          raw_data: Json | null
          status: string
          transactions_count: number | null
          user_id: string | null
        }
        Insert: {
          bank_account_id?: string | null
          created_at?: string
          error_message?: string | null
          file_name: string
          file_type: string
          id?: string
          raw_data?: Json | null
          status?: string
          transactions_count?: number | null
          user_id?: string | null
        }
        Update: {
          bank_account_id?: string | null
          created_at?: string
          error_message?: string | null
          file_name?: string
          file_type?: string
          id?: string
          raw_data?: Json | null
          status?: string
          transactions_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "statement_imports_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
          category: string | null
          created_at: string
          date: string
          description: string
          external_id: string | null
          id: string
          imported_from: string | null
          is_recurring: boolean | null
          metadata: Json | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category?: string | null
          created_at?: string
          date?: string
          description: string
          external_id?: string | null
          id?: string
          imported_from?: string | null
          is_recurring?: boolean | null
          metadata?: Json | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          external_id?: string | null
          id?: string
          imported_from?: string | null
          is_recurring?: boolean | null
          metadata?: Json | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
