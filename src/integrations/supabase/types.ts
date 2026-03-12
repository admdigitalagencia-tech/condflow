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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      condominium_notes: {
        Row: {
          condominium_id: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          updated_at: string
        }
        Insert: {
          condominium_id: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          condominium_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "condominium_notes_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      condominiums: {
        Row: {
          active: boolean
          address_line: string | null
          city: string | null
          created_at: string
          created_by: string | null
          district: string | null
          floors_count: number | null
          fractions_count: number | null
          id: string
          name: string
          nif: string | null
          notes: string | null
          organization_id: string | null
          postal_code: string | null
          updated_at: string
          year_built: number | null
        }
        Insert: {
          active?: boolean
          address_line?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          district?: string | null
          floors_count?: number | null
          fractions_count?: number | null
          id?: string
          name: string
          nif?: string | null
          notes?: string | null
          organization_id?: string | null
          postal_code?: string | null
          updated_at?: string
          year_built?: number | null
        }
        Update: {
          active?: boolean
          address_line?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          district?: string | null
          floors_count?: number | null
          fractions_count?: number | null
          id?: string
          name?: string
          nif?: string | null
          notes?: string | null
          organization_id?: string | null
          postal_code?: string | null
          updated_at?: string
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "condominiums_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          email: string | null
          id: string
          legal_name: string | null
          name: string
          nif: string | null
          phone: string | null
          plan: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          legal_name?: string | null
          name: string
          nif?: string | null
          phone?: string | null
          plan?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          nif?: string | null
          phone?: string | null
          plan?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stakeholder_condominiums: {
        Row: {
          condominium_id: string
          created_at: string
          id: string
          role_in_condominium: string | null
          stakeholder_id: string
        }
        Insert: {
          condominium_id: string
          created_at?: string
          id?: string
          role_in_condominium?: string | null
          stakeholder_id: string
        }
        Update: {
          condominium_id?: string
          created_at?: string
          id?: string
          role_in_condominium?: string | null
          stakeholder_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_condominiums_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholder_condominiums_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholders: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          preferred_contact_channel: string | null
          role_title: string | null
          stakeholder_type: Database["public"]["Enums"]["stakeholder_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          preferred_contact_channel?: string | null
          role_title?: string | null
          stakeholder_type?: Database["public"]["Enums"]["stakeholder_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          preferred_contact_channel?: string | null
          role_title?: string | null
          stakeholder_type?: Database["public"]["Enums"]["stakeholder_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_condominiums: {
        Row: {
          condominium_id: string
          created_at: string
          id: string
          service_description: string | null
          supplier_id: string
        }
        Insert: {
          condominium_id: string
          created_at?: string
          id?: string
          service_description?: string | null
          supplier_id: string
        }
        Update: {
          condominium_id?: string
          created_at?: string
          id?: string
          service_description?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_condominiums_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_condominiums_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          nif: string | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          supplier_category: Database["public"]["Enums"]["supplier_category"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          nif?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          supplier_category?: Database["public"]["Enums"]["supplier_category"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          nif?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          supplier_category?: Database["public"]["Enums"]["supplier_category"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_costs: {
        Row: {
          amount: number
          cost_type: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          supplier_id: string | null
          ticket_id: string
        }
        Insert: {
          amount?: number
          cost_type?: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          supplier_id?: string | null
          ticket_id: string
        }
        Update: {
          amount?: number
          cost_type?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          supplier_id?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_costs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_costs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_updates: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: string
          new_status: Database["public"]["Enums"]["ticket_status"] | null
          old_status: Database["public"]["Enums"]["ticket_status"] | null
          organization_id: string | null
          ticket_id: string
          update_type: Database["public"]["Enums"]["ticket_update_type"]
          visibility: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["ticket_status"] | null
          old_status?: Database["public"]["Enums"]["ticket_status"] | null
          organization_id?: string | null
          ticket_id: string
          update_type?: Database["public"]["Enums"]["ticket_update_type"]
          visibility?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["ticket_status"] | null
          old_status?: Database["public"]["Enums"]["ticket_status"] | null
          organization_id?: string | null
          ticket_id?: string
          update_type?: Database["public"]["Enums"]["ticket_update_type"]
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_updates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_updates_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          approved_cost: number | null
          assigned_user_id: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          closed_at: string | null
          closure_summary: string | null
          code: string
          condominium_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_cost: number | null
          id: string
          last_activity_at: string
          location_text: string | null
          opened_at: string
          organization_id: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          severity_score: number | null
          source_channel: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subcategory: string | null
          supplier_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approved_cost?: number | null
          assigned_user_id?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          closure_summary?: string | null
          code?: string
          condominium_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          id?: string
          last_activity_at?: string
          location_text?: string | null
          opened_at?: string
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          severity_score?: number | null
          source_channel?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subcategory?: string | null
          supplier_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approved_cost?: number | null
          assigned_user_id?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          closure_summary?: string | null
          code?: string
          condominium_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          id?: string
          last_activity_at?: string
          location_text?: string | null
          opened_at?: string
          organization_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          severity_score?: number | null
          source_channel?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subcategory?: string | null
          supplier_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
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
      stakeholder_type:
        | "administrador"
        | "condomino"
        | "advogado"
        | "seguradora"
        | "tecnico"
        | "entidade_publica"
        | "outro"
      supplier_category:
        | "elevadores"
        | "portoes"
        | "eletricidade"
        | "canalizacao"
        | "limpeza"
        | "obras"
        | "seguros"
        | "juridico"
        | "outros"
      ticket_category:
        | "infiltracao"
        | "portao"
        | "elevador"
        | "eletricidade"
        | "canalizacao"
        | "limpeza"
        | "estrutural"
        | "administrativo"
        | "sinistro"
      ticket_priority: "baixa" | "media" | "alta" | "critica"
      ticket_status:
        | "aberto"
        | "em_analise"
        | "orcamento_solicitado"
        | "aguardando_aprovacao"
        | "em_execucao"
        | "resolvido"
        | "encerrado"
      ticket_update_type:
        | "comment"
        | "status_change"
        | "assignment"
        | "cost_update"
        | "system"
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
      stakeholder_type: [
        "administrador",
        "condomino",
        "advogado",
        "seguradora",
        "tecnico",
        "entidade_publica",
        "outro",
      ],
      supplier_category: [
        "elevadores",
        "portoes",
        "eletricidade",
        "canalizacao",
        "limpeza",
        "obras",
        "seguros",
        "juridico",
        "outros",
      ],
      ticket_category: [
        "infiltracao",
        "portao",
        "elevador",
        "eletricidade",
        "canalizacao",
        "limpeza",
        "estrutural",
        "administrativo",
        "sinistro",
      ],
      ticket_priority: ["baixa", "media", "alta", "critica"],
      ticket_status: [
        "aberto",
        "em_analise",
        "orcamento_solicitado",
        "aguardando_aprovacao",
        "em_execucao",
        "resolvido",
        "encerrado",
      ],
      ticket_update_type: [
        "comment",
        "status_change",
        "assignment",
        "cost_update",
        "system",
      ],
    },
  },
} as const
