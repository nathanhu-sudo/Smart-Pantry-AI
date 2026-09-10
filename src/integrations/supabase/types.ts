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
      achievements: {
        Row: {
          created_at: string
          criteria: Json
          description: string
          icon: string
          id: string
          key: string
          name: string
          sort_order: number
          tier: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          criteria: Json
          description: string
          icon: string
          id?: string
          key: string
          name: string
          sort_order?: number
          tier?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          key?: string
          name?: string
          sort_order?: number
          tier?: string
          xp_reward?: number
        }
        Relationships: []
      }
      challenge_definitions: {
        Row: {
          active: boolean
          created_at: string
          description: string
          icon: string
          id: string
          key: string
          name: string
          sort_order: number
          target: number
          type: string
          xp_reward: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          icon: string
          id?: string
          key: string
          name: string
          sort_order?: number
          target: number
          type: string
          xp_reward?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          icon?: string
          id?: string
          key?: string
          name?: string
          sort_order?: number
          target?: number
          type?: string
          xp_reward?: number
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          days_before: number
          email_enabled: boolean
          in_app_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_before?: number
          email_enabled?: boolean
          in_app_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_before?: number
          email_enabled?: boolean
          in_app_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          days_left: number | null
          id: string
          item_id: string | null
          notify_date: string
          read_at: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          days_left?: number | null
          id?: string
          item_id?: string | null
          notify_date?: string
          read_at?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          days_left?: number | null
          id?: string
          item_id?: string | null
          notify_date?: string
          read_at?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "pantry_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pantry_items: {
        Row: {
          added_at: string
          co2_impact: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          shelf_life_days: number
          status: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          added_at?: string
          co2_impact?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          shelf_life_days?: number
          status?: string
          user_id: string
          weight_kg?: number
        }
        Update: {
          added_at?: string
          co2_impact?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          shelf_life_days?: number
          status?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_bonuses: {
        Row: {
          bonus_xp: number
          claimed_at: string
          id: string
          user_id: string
          week_start: string
          week_streak: number
          xp_awarded: number
        }
        Insert: {
          bonus_xp: number
          claimed_at?: string
          id?: string
          user_id: string
          week_start: string
          week_streak: number
          xp_awarded: number
        }
        Update: {
          bonus_xp?: number
          claimed_at?: string
          id?: string
          user_id?: string
          week_start?: string
          week_streak?: number
          xp_awarded?: number
        }
        Relationships: []
      }
      user_challenge_streaks: {
        Row: {
          last_completed_week: string | null
          updated_at: string
          user_id: string
          week_streak: number
        }
        Insert: {
          last_completed_week?: string | null
          updated_at?: string
          user_id: string
          week_streak?: number
        }
        Update: {
          last_completed_week?: string | null
          updated_at?: string
          user_id?: string
          week_streak?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          current_streak: number
          items_consumed: number
          items_tossed: number
          kg_saved: number
          kg_wasted: number
          last_activity_date: string | null
          level: number
          longest_streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          current_streak?: number
          items_consumed?: number
          items_tossed?: number
          kg_saved?: number
          kg_wasted?: number
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          current_streak?: number
          items_consumed?: number
          items_tossed?: number
          kg_saved?: number
          kg_wasted?: number
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          expires_at: string | null
          is_lifetime: boolean
          plan: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          is_lifetime?: boolean
          plan?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          is_lifetime?: boolean
          plan?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tags: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          tag: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          tag: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          tag?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_add_user_tag: {
        Args: { _tag: string; _user_id: string }
        Returns: undefined
      }
      admin_remove_user_tag: {
        Args: { _tag: string; _user_id: string }
        Returns: undefined
      }
      admin_set_user_plan: {
        Args: { _billing?: string; _plan: string; _user_id: string }
        Returns: {
          expires_at: string | null
          is_lifetime: boolean
          plan: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      check_and_unlock_achievements: {
        Args: { _user_id: string }
        Returns: {
          icon: string
          key: string
          name: string
          tier: string
          xp_reward: number
        }[]
      }
      claim_weekly_bonus: {
        Args: { _user_id: string }
        Returns: {
          awarded: boolean
          bonus_xp: number
          message: string
          week_streak: number
        }[]
      }
      get_admin_users_overview: {
        Args: never
        Returns: {
          active_items: number
          avatar_url: string
          consumed_items: number
          display_name: string
          email: string
          is_lifetime: boolean
          joined_at: string
          last_activity: string
          last_sign_in_at: string
          plan: string
          plan_expires_at: string
          plan_started_at: string
          plan_status: string
          tags: string[]
          tossed_items: number
          total_items: number
          total_saved_kg: number
          total_wasted_kg: number
          user_id: string
        }[]
      }
      get_community_common_items: {
        Args: never
        Returns: {
          count: number
          name: string
          total_kg: number
        }[]
      }
      get_community_impact: {
        Args: never
        Returns: {
          total_co2_saved_kg: number
          total_co2_wasted_kg: number
          total_items: number
          total_saved_kg: number
          total_users: number
          total_wasted_kg: number
        }[]
      }
      get_community_top_contributors: {
        Args: never
        Returns: {
          avatar_url: string
          display_name: string
          items_consumed: number
          kg_saved: number
          rank: number
          user_id: string
        }[]
      }
      get_community_weekly_trend: {
        Args: never
        Returns: {
          saved_kg: number
          wasted_kg: number
          week_start: string
        }[]
      }
      get_friends: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          direction: string
          display_name: string
          friendship_id: string
          status: string
          user_id: string
        }[]
      }
      get_leaderboard: {
        Args: { _friends_only?: boolean; _period: string }
        Returns: {
          avatar_url: string
          display_name: string
          items_consumed: number
          kg_saved: number
          rank: number
          user_id: string
        }[]
      }
      get_weekly_challenges: {
        Args: { _user_id: string }
        Returns: {
          all_completed: boolean
          bonus_claimed: boolean
          bonus_xp: number
          completed: boolean
          description: string
          icon: string
          key: string
          name: string
          progress: number
          sort_order: number
          target: number
          type: string
          week_end: string
          week_start: string
          week_streak: number
          xp_reward: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      recompute_user_stats: { Args: { _user_id: string }; Returns: undefined }
      search_members: {
        Args: { _q: string }
        Returns: {
          avatar_url: string
          display_name: string
          relation: string
          user_id: string
        }[]
      }
      set_my_plan: {
        Args: { _billing?: string; _plan: string }
        Returns: {
          expires_at: string | null
          is_lifetime: boolean
          plan: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      sync_expiry_notifications: { Args: { _user_id: string }; Returns: number }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
