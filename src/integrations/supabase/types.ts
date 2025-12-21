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
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          category: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      company_associates: {
        Row: {
          company_request_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          marital_regime: string | null
          marital_status: string | null
          phone: string | null
          profession: string | null
          residence_address: string | null
          shares_count: number | null
          shares_percentage: number | null
        }
        Insert: {
          company_request_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          marital_regime?: string | null
          marital_status?: string | null
          phone?: string | null
          profession?: string | null
          residence_address?: string | null
          shares_count?: number | null
          shares_percentage?: number | null
        }
        Update: {
          company_request_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          marital_regime?: string | null
          marital_status?: string | null
          phone?: string | null
          profession?: string | null
          residence_address?: string | null
          shares_count?: number | null
          shares_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_associates_company_request_id_fkey"
            columns: ["company_request_id"]
            isOneToOne: false
            referencedRelation: "company_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      company_requests: {
        Row: {
          activity: string | null
          additional_services: string[] | null
          address: string | null
          assigned_to: string | null
          bank: string | null
          bp: string | null
          capital: string | null
          city: string | null
          client_rating: number | null
          client_review: string | null
          closed_at: string | null
          closed_by: string | null
          company_name: string
          contact_name: string
          created_at: string
          email: string
          estimated_price: number | null
          id: string
          manager_mandate_duration: string | null
          manager_marital_regime: string | null
          manager_marital_status: string | null
          manager_residence: string | null
          payment_id: string | null
          payment_status: string | null
          phone: string
          region: string | null
          sigle: string | null
          status: string
          structure_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity?: string | null
          additional_services?: string[] | null
          address?: string | null
          assigned_to?: string | null
          bank?: string | null
          bp?: string | null
          capital?: string | null
          city?: string | null
          client_rating?: number | null
          client_review?: string | null
          closed_at?: string | null
          closed_by?: string | null
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          estimated_price?: number | null
          id?: string
          manager_mandate_duration?: string | null
          manager_marital_regime?: string | null
          manager_marital_status?: string | null
          manager_residence?: string | null
          payment_id?: string | null
          payment_status?: string | null
          phone: string
          region?: string | null
          sigle?: string | null
          status?: string
          structure_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity?: string | null
          additional_services?: string[] | null
          address?: string | null
          assigned_to?: string | null
          bank?: string | null
          bp?: string | null
          capital?: string | null
          city?: string | null
          client_rating?: number | null
          client_review?: string | null
          closed_at?: string | null
          closed_by?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          estimated_price?: number | null
          id?: string
          manager_mandate_duration?: string | null
          manager_marital_regime?: string | null
          manager_marital_status?: string | null
          manager_residence?: string | null
          payment_id?: string | null
          payment_status?: string | null
          phone?: string
          region?: string | null
          sigle?: string | null
          status?: string
          structure_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          phone: string | null
          replied_at: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          phone?: string | null
          replied_at?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          phone?: string | null
          replied_at?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      created_companies: {
        Row: {
          created_at: string
          district: string | null
          founder_name: string | null
          founder_photo_url: string | null
          id: string
          is_featured: boolean | null
          is_visible: boolean | null
          logo_url: string | null
          name: string
          rating: number | null
          region: string
          testimonial: string | null
          type: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          founder_name?: string | null
          founder_photo_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          logo_url?: string | null
          name: string
          rating?: number | null
          region: string
          testimonial?: string | null
          type: string
        }
        Update: {
          created_at?: string
          district?: string | null
          founder_name?: string | null
          founder_photo_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          logo_url?: string | null
          name?: string
          rating?: number | null
          region?: string
          testimonial?: string | null
          type?: string
        }
        Relationships: []
      }
      ebook_downloads: {
        Row: {
          downloaded_at: string
          ebook_id: string
          id: string
          user_email: string
          user_name: string | null
        }
        Insert: {
          downloaded_at?: string
          ebook_id: string
          id?: string
          user_email: string
          user_name?: string | null
        }
        Update: {
          downloaded_at?: string
          ebook_id?: string
          id?: string
          user_email?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ebook_downloads_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      ebooks: {
        Row: {
          category: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          download_count: number | null
          file_url: string
          id: string
          is_free: boolean | null
          is_published: boolean | null
          price: number | null
          title: string
        }
        Insert: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_url: string
          id?: string
          is_free?: boolean | null
          is_published?: boolean | null
          price?: number | null
          title: string
        }
        Update: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_url?: string
          id?: string
          is_free?: boolean | null
          is_published?: boolean | null
          price?: number | null
          title?: string
        }
        Relationships: []
      }
      identity_documents: {
        Row: {
          back_url: string | null
          created_at: string
          document_type: string
          face_detected: boolean | null
          front_url: string
          id: string
          request_id: string
          request_type: string
          user_id: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          back_url?: string | null
          created_at?: string
          document_type: string
          face_detected?: boolean | null
          front_url: string
          id?: string
          request_id: string
          request_type: string
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          back_url?: string | null
          created_at?: string
          document_type?: string
          face_detected?: boolean | null
          front_url?: string
          id?: string
          request_id?: string
          request_type?: string
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      lexia_conversations: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          satisfaction_rating: number | null
          session_id: string
          started_at: string
          summary: string | null
          user_id: string | null
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          satisfaction_rating?: number | null
          session_id: string
          started_at?: string
          summary?: string | null
          user_id?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          satisfaction_rating?: number | null
          session_id?: string
          started_at?: string
          summary?: string | null
          user_id?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: []
      }
      lexia_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "lexia_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "lexia_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          request_id: string | null
          request_type: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          request_id?: string | null
          request_type?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          request_id?: string | null
          request_type?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      request_documents_exchange: {
        Row: {
          created_at: string
          document_name: string
          document_type: string | null
          document_url: string
          id: string
          is_read: boolean | null
          message: string | null
          request_id: string
          request_type: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type?: string | null
          document_url: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          request_id: string
          request_type: string
          sender_id: string
          sender_role: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string | null
          document_url?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          request_id?: string
          request_type?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: []
      }
      request_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          request_id: string
          request_type: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          request_id: string
          request_type: string
          sender_id: string
          sender_role: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          request_id?: string
          request_type?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          assigned_to: string | null
          client_rating: number | null
          client_review: string | null
          closed_at: string | null
          closed_by: string | null
          company_name: string | null
          created_at: string
          description: string | null
          documents: Json | null
          estimated_price: number | null
          id: string
          payment_id: string | null
          payment_status: string | null
          service_category: string | null
          service_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          client_rating?: number | null
          client_review?: string | null
          closed_at?: string | null
          closed_by?: string | null
          company_name?: string | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          estimated_price?: number | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          service_category?: string | null
          service_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          client_rating?: number | null
          client_review?: string | null
          closed_at?: string | null
          closed_by?: string | null
          company_name?: string | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          estimated_price?: number | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          service_category?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_team_member: { Args: { _user_id: string }; Returns: boolean }
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
