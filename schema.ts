export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      options: {
        Row: {
          display: string
          he_value: string | null
          id: string
          question_id: string
        }
        Insert: {
          display: string
          he_value?: string | null
          id?: string
          question_id: string
        }
        Update: {
          display?: string
          he_value?: string | null
          id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          description: string | null
          difficulties: string | null
          user_id: string
          created_at: string
          updated_at: string
          offer: string | null
        }
        Insert: {
          id?: string
          name: string
          price: number
          description?: string | null
          difficulties?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
          offer?: string | null
        }
        Update: {
          id?: string
          name?: string
          price?: number
          description?: string | null
          difficulties?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
          offer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      post_image_associations: {
        Row: {
          created_at: string
          id: string
          image_id: string | null
          post_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_id?: string | null
          post_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_id?: string | null
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_image_associations_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "post_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_image_associations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "saved_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_images: {
        Row: {
          created_at: string
          file_path: string
          id: string
          prompt: string
          public_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          prompt: string
          public_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          prompt?: string
          public_url?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_diagnosis: string | null
          business_name: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          business_diagnosis?: string | null
          business_name?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          business_diagnosis?: string | null
          business_name?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          he_text: string | null
          id: string
          step: number
          text: string
        }
        Insert: {
          he_text?: string | null
          id?: string
          step: number
          text: string
        }
        Update: {
          he_text?: string | null
          id?: string
          step?: number
          text?: string
        }
        Relationships: []
      }
      responses: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          post_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_status_by_email: {
        Args: {
          email: string
        }
        Returns: {
          user_id: string
          confirmed_at: string
        }[]
      }
    }
    Enums: {
      business_size: "SOLO" | "SMALL" | "MEDIUM" | "LARGE"
      business_stage: "IDEA" | "STARTUP" | "GROWING" | "ESTABLISHED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
