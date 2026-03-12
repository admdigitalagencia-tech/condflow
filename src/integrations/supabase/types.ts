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
      ai_runs: {
        Row: {
          confidence_score: number | null
          created_at: string
          created_by: string | null
          feature_name: string
          id: string
          input_snapshot_json: Json | null
          organization_id: string | null
          output_snapshot_json: Json | null
          related_entity_id: string
          related_entity_type: string
          status: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          feature_name: string
          id?: string
          input_snapshot_json?: Json | null
          organization_id?: string | null
          output_snapshot_json?: Json | null
          related_entity_id: string
          related_entity_type: string
          status?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          feature_name?: string
          id?: string
          input_snapshot_json?: Json | null
          organization_id?: string | null
          output_snapshot_json?: Json | null
          related_entity_id?: string
          related_entity_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assemblies: {
        Row: {
          agenda_text: string | null
          assembly_type: string
          chaired_by: string | null
          condominium_id: string
          created_at: string
          created_by: string | null
          id: string
          location: string | null
          minutes_status: Database["public"]["Enums"]["minutes_status"]
          notes: string | null
          organization_id: string | null
          quorum_info: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: Database["public"]["Enums"]["assembly_status"]
          title: string
          updated_at: string
        }
        Insert: {
          agenda_text?: string | null
          assembly_type?: string
          chaired_by?: string | null
          condominium_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          minutes_status?: Database["public"]["Enums"]["minutes_status"]
          notes?: string | null
          organization_id?: string | null
          quorum_info?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["assembly_status"]
          title: string
          updated_at?: string
        }
        Update: {
          agenda_text?: string | null
          assembly_type?: string
          chaired_by?: string | null
          condominium_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          minutes_status?: Database["public"]["Enums"]["minutes_status"]
          notes?: string | null
          organization_id?: string | null
          quorum_info?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["assembly_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assemblies_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assemblies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assembly_attendees: {
        Row: {
          assembly_id: string
          attendance_type: string
          attendee_name: string
          created_at: string
          id: string
          organization_id: string | null
          permillage: number | null
          represented_by: string | null
          signature_status: string | null
          stakeholder_id: string | null
          unit_code: string | null
        }
        Insert: {
          assembly_id: string
          attendance_type?: string
          attendee_name: string
          created_at?: string
          id?: string
          organization_id?: string | null
          permillage?: number | null
          represented_by?: string | null
          signature_status?: string | null
          stakeholder_id?: string | null
          unit_code?: string | null
        }
        Update: {
          assembly_id?: string
          attendance_type?: string
          attendee_name?: string
          created_at?: string
          id?: string
          organization_id?: string | null
          permillage?: number | null
          represented_by?: string | null
          signature_status?: string | null
          stakeholder_id?: string | null
          unit_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assembly_attendees_assembly_id_fkey"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assembly_attendees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assembly_attendees_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
        ]
      }
      assembly_points: {
        Row: {
          assembly_id: string
          created_at: string
          deliberation_text: string | null
          description: string | null
          discussion_summary: string | null
          id: string
          organization_id: string | null
          point_order: number
          proposal_text: string | null
          title: string
          updated_at: string
          voting_result_text: string | null
        }
        Insert: {
          assembly_id: string
          created_at?: string
          deliberation_text?: string | null
          description?: string | null
          discussion_summary?: string | null
          id?: string
          organization_id?: string | null
          point_order?: number
          proposal_text?: string | null
          title: string
          updated_at?: string
          voting_result_text?: string | null
        }
        Update: {
          assembly_id?: string
          created_at?: string
          deliberation_text?: string | null
          description?: string | null
          discussion_summary?: string | null
          id?: string
          organization_id?: string | null
          point_order?: number
          proposal_text?: string | null
          title?: string
          updated_at?: string
          voting_result_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assembly_points_assembly_id_fkey"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assembly_points_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      documents: {
        Row: {
          ai_summary: string | null
          assembly_id: string | null
          condominium_id: string | null
          created_at: string
          created_by: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          extracted_text: string | null
          file_path: string
          file_size: number | null
          id: string
          issue_date: string | null
          metadata_json: Json | null
          mime_type: string | null
          organization_id: string | null
          supplier_id: string | null
          ticket_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          assembly_id?: string | null
          condominium_id?: string | null
          created_at?: string
          created_by?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          extracted_text?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          issue_date?: string | null
          metadata_json?: Json | null
          mime_type?: string | null
          organization_id?: string | null
          supplier_id?: string | null
          ticket_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          assembly_id?: string | null
          condominium_id?: string | null
          created_at?: string
          created_by?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          extracted_text?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          issue_date?: string | null
          metadata_json?: Json | null
          mime_type?: string | null
          organization_id?: string | null
          supplier_id?: string | null
          ticket_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_assembly_id_fkey"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      minute_sections: {
        Row: {
          content: string | null
          created_at: string
          id: string
          minute_id: string
          organization_id: string | null
          section_key: string
          section_title: string
          source_evidence_json: Json | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          minute_id: string
          organization_id?: string | null
          section_key: string
          section_title: string
          source_evidence_json?: Json | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          minute_id?: string
          organization_id?: string | null
          section_key?: string
          section_title?: string
          source_evidence_json?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "minute_sections_minute_id_fkey"
            columns: ["minute_id"]
            isOneToOne: false
            referencedRelation: "minutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "minute_sections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      minutes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assembly_id: string
          content_longtext: string | null
          created_at: string
          created_by: string | null
          generation_source: string | null
          id: string
          minute_type: string
          organization_id: string | null
          status: Database["public"]["Enums"]["minutes_status"]
          title: string
          version_number: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assembly_id: string
          content_longtext?: string | null
          created_at?: string
          created_by?: string | null
          generation_source?: string | null
          id?: string
          minute_type?: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["minutes_status"]
          title: string
          version_number?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assembly_id?: string
          content_longtext?: string | null
          created_at?: string
          created_by?: string | null
          generation_source?: string | null
          id?: string
          minute_type?: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["minutes_status"]
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "minutes_assembly_id_fkey"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "minutes_organization_id_fkey"
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
      transcript_segments: {
        Row: {
          confidence_score: number | null
          created_at: string
          ended_at_seconds: number | null
          id: string
          organization_id: string | null
          segment_order: number
          speaker: string | null
          started_at_seconds: number | null
          text: string
          transcript_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          ended_at_seconds?: number | null
          id?: string
          organization_id?: string | null
          segment_order?: number
          speaker?: string | null
          started_at_seconds?: number | null
          text: string
          transcript_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          ended_at_seconds?: number | null
          id?: string
          organization_id?: string | null
          segment_order?: number
          speaker?: string | null
          started_at_seconds?: number | null
          text?: string
          transcript_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcript_segments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcript_segments_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          assembly_id: string
          confidence_score: number | null
          created_at: string
          id: string
          language: string | null
          organization_id: string | null
          processing_status: Database["public"]["Enums"]["transcript_status"]
          raw_text: string | null
          source_type: string
          updated_at: string
        }
        Insert: {
          assembly_id: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          language?: string | null
          organization_id?: string | null
          processing_status?: Database["public"]["Enums"]["transcript_status"]
          raw_text?: string | null
          source_type?: string
          updated_at?: string
        }
        Update: {
          assembly_id?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          language?: string | null
          organization_id?: string | null
          processing_status?: Database["public"]["Enums"]["transcript_status"]
          raw_text?: string | null
          source_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_assembly_id_fkey"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      assembly_status:
        | "planeada"
        | "realizada"
        | "em_transcricao"
        | "em_minuta"
        | "finalizada"
      document_type:
        | "ata"
        | "convocatoria"
        | "lista_presenca"
        | "orcamento"
        | "contrato"
        | "relatorio_tecnico"
        | "fatura"
        | "email_exportado"
        | "fotografia"
        | "audio"
        | "transcricao"
        | "apolice"
      minutes_status:
        | "pendente"
        | "rascunho"
        | "em_revisao"
        | "aprovada"
        | "publicada"
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
      transcript_status: "pendente" | "em_processamento" | "concluida" | "erro"
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
      assembly_status: [
        "planeada",
        "realizada",
        "em_transcricao",
        "em_minuta",
        "finalizada",
      ],
      document_type: [
        "ata",
        "convocatoria",
        "lista_presenca",
        "orcamento",
        "contrato",
        "relatorio_tecnico",
        "fatura",
        "email_exportado",
        "fotografia",
        "audio",
        "transcricao",
        "apolice",
      ],
      minutes_status: [
        "pendente",
        "rascunho",
        "em_revisao",
        "aprovada",
        "publicada",
      ],
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
      transcript_status: ["pendente", "em_processamento", "concluida", "erro"],
    },
  },
} as const
