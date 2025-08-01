export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      adaptive_weights: {
        Row: {
          confidence: number
          created_at: string
          factor_name: string
          id: string
          sample_size: number
          trend: string | null
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          confidence?: number
          created_at?: string
          factor_name: string
          id?: string
          sample_size?: number
          trend?: string | null
          updated_at?: string
          user_id: string
          weight?: number
        }
        Update: {
          confidence?: number
          created_at?: string
          factor_name?: string
          id?: string
          sample_size?: number
          trend?: string | null
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          context_data: Json | null
          created_at: string
          has_error: boolean
          id: string
          is_read: boolean
          priority: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          context_data?: Json | null
          created_at?: string
          has_error?: boolean
          id?: string
          is_read?: boolean
          priority?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          context_data?: Json | null
          created_at?: string
          has_error?: boolean
          id?: string
          is_read?: boolean
          priority?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_daily_plans: {
        Row: {
          ai_confidence: number | null
          completion_rate: number | null
          created_at: string
          estimated_duration: number | null
          id: string
          optimization_strategy: string | null
          plan_date: string
          planned_tasks: Json
          updated_at: string
          user_feedback: Json | null
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          completion_rate?: number | null
          created_at?: string
          estimated_duration?: number | null
          id?: string
          optimization_strategy?: string | null
          plan_date: string
          planned_tasks?: Json
          updated_at?: string
          user_feedback?: Json | null
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          completion_rate?: number | null
          created_at?: string
          estimated_duration?: number | null
          id?: string
          optimization_strategy?: string | null
          plan_date?: string
          planned_tasks?: Json
          updated_at?: string
          user_feedback?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          insight_data: Json
          insight_type: string
          is_dismissed: boolean | null
          is_read: boolean | null
          priority: number | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          insight_data: Json
          insight_type: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          priority?: number | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          insight_data?: Json
          insight_type?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          priority?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_task_monitoring: {
        Row: {
          analysis_data: Json
          bottleneck_detected: boolean | null
          created_at: string
          id: string
          monitoring_type: string
          predicted_completion_date: string | null
          priority_score: number | null
          suggestions: Json | null
          task_id: string
          updated_at: string
        }
        Insert: {
          analysis_data?: Json
          bottleneck_detected?: boolean | null
          created_at?: string
          id?: string
          monitoring_type: string
          predicted_completion_date?: string | null
          priority_score?: number | null
          suggestions?: Json | null
          task_id: string
          updated_at?: string
        }
        Update: {
          analysis_data?: Json
          bottleneck_detected?: boolean | null
          created_at?: string
          id?: string
          monitoring_type?: string
          predicted_completion_date?: string | null
          priority_score?: number | null
          suggestions?: Json | null
          task_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      alert_effectiveness_tracking: {
        Row: {
          action_timestamp: string | null
          alert_id: string
          alert_type: string
          context_data: Json | null
          created_at: string
          id: string
          relevance_score: number | null
          shown_at: string
          user_action: string | null
          user_id: string
        }
        Insert: {
          action_timestamp?: string | null
          alert_id: string
          alert_type: string
          context_data?: Json | null
          created_at?: string
          id?: string
          relevance_score?: number | null
          shown_at?: string
          user_action?: string | null
          user_id: string
        }
        Update: {
          action_timestamp?: string | null
          alert_id?: string
          alert_type?: string
          context_data?: Json | null
          created_at?: string
          id?: string
          relevance_score?: number | null
          shown_at?: string
          user_action?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_integrations: {
        Row: {
          created_at: string
          id: string
          integration_data: Json
          is_active: boolean | null
          last_sync_at: string | null
          provider: string
          sync_frequency: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          integration_data: Json
          is_active?: boolean | null
          last_sync_at?: string | null
          provider: string
          sync_frequency?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          integration_data?: Json
          is_active?: boolean | null
          last_sync_at?: string | null
          provider?: string
          sync_frequency?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      external_contacts: {
        Row: {
          company: string | null
          contact_type: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company?: string | null
          contact_type?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company?: string | null
          contact_type?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      generated_reports: {
        Row: {
          created_at: string
          file_url: string | null
          generation_type: string | null
          id: string
          metrics: Json
          period_end: string
          period_start: string
          report_data: Json
          report_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          generation_type?: string | null
          id?: string
          metrics?: Json
          period_end: string
          period_start: string
          report_data?: Json
          report_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          generation_type?: string | null
          id?: string
          metrics?: Json
          period_end?: string
          period_start?: string
          report_data?: Json
          report_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_rules: {
        Row: {
          action: Json
          condition: Json
          confidence: number
          created_at: string
          id: string
          rule_type: string
          success_rate: number
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          action: Json
          condition: Json
          confidence?: number
          created_at?: string
          id?: string
          rule_type: string
          success_rate?: number
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          action?: Json
          condition?: Json
          confidence?: number
          created_at?: string
          id?: string
          rule_type?: string
          success_rate?: number
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      llm_configurations: {
        Row: {
          api_key_name: string
          created_at: string
          frequency_penalty: number | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model_name: string
          presence_penalty: number | null
          provider: string
          temperature: number | null
          top_p: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_name?: string
          created_at?: string
          frequency_penalty?: number | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_name?: string
          presence_penalty?: number | null
          provider?: string
          temperature?: number | null
          top_p?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_name?: string
          created_at?: string
          frequency_penalty?: number | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_name?: string
          presence_penalty?: number | null
          provider?: string
          temperature?: number | null
          top_p?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_favorite: boolean | null
          latitude: number | null
          location_type: string | null
          longitude: number | null
          name: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          latitude?: number | null
          location_type?: string | null
          longitude?: number | null
          name: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          latitude?: number | null
          location_type?: string | null
          longitude?: number | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      predictive_analysis: {
        Row: {
          analysis_type: string
          confidence_score: number | null
          created_at: string
          id: string
          is_resolved: boolean | null
          prediction_data: Json
          resolved_at: string | null
          severity: string | null
          suggestions: Json | null
          target_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_type: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          prediction_data: Json
          resolved_at?: string | null
          severity?: string | null
          suggestions?: Json | null
          target_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          prediction_data?: Json
          resolved_at?: string | null
          severity?: string | null
          suggestions?: Json | null
          target_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proactive_notifications: {
        Row: {
          action_data: Json | null
          created_at: string
          dismissed_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          is_sent: boolean | null
          message: string
          notification_type: string
          priority: number | null
          read_at: string | null
          scheduled_for: string
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          created_at?: string
          dismissed_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          is_sent?: boolean | null
          message: string
          notification_type: string
          priority?: number | null
          read_at?: string | null
          scheduled_for: string
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_data?: Json | null
          created_at?: string
          dismissed_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          is_sent?: boolean | null
          message?: string
          notification_type?: string
          priority?: number | null
          read_at?: string | null
          scheduled_for?: string
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          skills: string[] | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          skills?: string[] | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          skills?: string[] | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_history: {
        Row: {
          change_type: string
          created_at: string
          id: string
          new_values: Json | null
          notes: string | null
          old_values: Json | null
          project_id: string | null
          user_id: string
        }
        Insert: {
          change_type: string
          created_at?: string
          id?: string
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          project_id?: string | null
          user_id: string
        }
        Update: {
          change_type?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          notes?: string | null
          old_values?: Json | null
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          template_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          template_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          actual_hours: number | null
          archived_at: string | null
          budget: number | null
          budget_used: number | null
          category: string | null
          change_reason: string | null
          color: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string
          custom_fields: Json | null
          deadline: string | null
          description: string | null
          end_date: string | null
          estimated_hours: number | null
          id: string
          last_status_change: string | null
          name: string
          priority: string | null
          progress: number | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          template_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_hours?: number | null
          archived_at?: string | null
          budget?: number | null
          budget_used?: number | null
          category?: string | null
          change_reason?: string | null
          color?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          custom_fields?: Json | null
          deadline?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          last_status_change?: string | null
          name: string
          priority?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          template_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_hours?: number | null
          archived_at?: string | null
          budget?: number | null
          budget_used?: number | null
          category?: string | null
          change_reason?: string | null
          color?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          custom_fields?: Json | null
          deadline?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          last_status_change?: string | null
          name?: string
          priority?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          template_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendation_feedback: {
        Row: {
          action: string
          context_data: Json | null
          created_at: string
          id: string
          satisfaction: number | null
          task_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          context_data?: Json | null
          created_at?: string
          id?: string
          satisfaction?: number | null
          task_id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          context_data?: Json | null
          created_at?: string
          id?: string
          satisfaction?: number | null
          task_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_filters: {
        Row: {
          created_at: string
          description: string | null
          filter_data: Json
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          filter_data?: Json
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          filter_data?: Json
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      smart_notifications_state: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          last_deadline_check: string | null
          last_followup_check: string | null
          last_inactive_check: string | null
          last_productivity_check: string | null
          notification_frequency: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_deadline_check?: string | null
          last_followup_check?: string | null
          last_inactive_check?: string | null
          last_productivity_check?: string | null
          notification_frequency?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_deadline_check?: string | null
          last_followup_check?: string | null
          last_inactive_check?: string | null
          last_productivity_check?: string | null
          notification_frequency?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      smart_reminders: {
        Row: {
          created_at: string
          id: string
          is_sent: boolean | null
          message: string | null
          reminder_type: string
          scheduled_for: string
          task_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_sent?: boolean | null
          message?: string | null
          reminder_type: string
          scheduled_for: string
          task_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_sent?: boolean | null
          message?: string | null
          reminder_type?: string
          scheduled_for?: string
          task_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_reminders_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          role_in_task: string | null
          task_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          role_in_task?: string | null
          task_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          role_in_task?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string
          dependency_type: string
          depends_on_task_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          dependency_type?: string
          depends_on_task_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string
          dependency_type?: string
          depends_on_task_id?: string
          id?: string
          task_id?: string
        }
        Relationships: []
      }
      task_logs: {
        Row: {
          content: string | null
          created_at: string
          id: string
          log_type: string
          metadata: Json | null
          task_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          log_type?: string
          metadata?: Json | null
          task_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          log_type?: string
          metadata?: Json | null
          task_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          location_id: string | null
          notes: string | null
          productivity_score: number | null
          started_at: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          productivity_score?: number | null
          started_at?: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          productivity_score?: number | null
          started_at?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_duration: number | null
          ai_priority_score: number | null
          communication_notes: string | null
          communication_type: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_duration: number | null
          id: string
          is_archived: boolean
          last_communication_at: string | null
          last_worked_at: string | null
          needs_followup: boolean | null
          parent_task_id: string | null
          priority: string
          project_id: string | null
          status: string
          tags: string[] | null
          task_level: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_duration?: number | null
          ai_priority_score?: number | null
          communication_notes?: string | null
          communication_type?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          is_archived?: boolean
          last_communication_at?: string | null
          last_worked_at?: string | null
          needs_followup?: boolean | null
          parent_task_id?: string | null
          priority?: string
          project_id?: string | null
          status?: string
          tags?: string[] | null
          task_level?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_duration?: number | null
          ai_priority_score?: number | null
          communication_notes?: string | null
          communication_type?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          is_archived?: boolean
          last_communication_at?: string | null
          last_worked_at?: string | null
          needs_followup?: boolean | null
          parent_task_id?: string | null
          priority?: string
          project_id?: string | null
          status?: string
          tags?: string[] | null
          task_level?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          max_progress: number | null
          metadata: Json | null
          progress: number | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          max_progress?: number | null
          metadata?: Json | null
          progress?: number | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          max_progress?: number | null
          metadata?: Json | null
          progress?: number | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_knowledge_base: {
        Row: {
          category: string
          confidence_score: number | null
          created_at: string
          id: string
          is_active: boolean
          key_name: string
          knowledge_type: string
          last_confirmed_at: string | null
          learned_from: string | null
          source: string
          updated_at: string
          user_id: string
          value_json: Json | null
          value_text: string | null
        }
        Insert: {
          category: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          key_name: string
          knowledge_type: string
          last_confirmed_at?: string | null
          learned_from?: string | null
          source: string
          updated_at?: string
          user_id: string
          value_json?: Json | null
          value_text?: string | null
        }
        Update: {
          category?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          key_name?: string
          knowledge_type?: string
          last_confirmed_at?: string | null
          learned_from?: string | null
          source?: string
          updated_at?: string
          user_id?: string
          value_json?: Json | null
          value_text?: string | null
        }
        Relationships: []
      }
      user_patterns: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          pattern_data: Json
          pattern_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          pattern_data: Json
          pattern_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          pattern_data?: Json
          pattern_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_productivity_preferences: {
        Row: {
          alert_preferences: Json | null
          break_duration: number | null
          created_at: string
          energy_schedule: Json | null
          focus_session_duration: number | null
          id: string
          notification_frequency: number | null
          preferred_work_days: number[] | null
          productivity_goals: Json | null
          timezone: string | null
          updated_at: string
          user_id: string
          work_hours_end: number | null
          work_hours_start: number | null
        }
        Insert: {
          alert_preferences?: Json | null
          break_duration?: number | null
          created_at?: string
          energy_schedule?: Json | null
          focus_session_duration?: number | null
          id?: string
          notification_frequency?: number | null
          preferred_work_days?: number[] | null
          productivity_goals?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          work_hours_end?: number | null
          work_hours_start?: number | null
        }
        Update: {
          alert_preferences?: Json | null
          break_duration?: number | null
          created_at?: string
          energy_schedule?: Json | null
          focus_session_duration?: number | null
          id?: string
          notification_frequency?: number | null
          preferred_work_days?: number[] | null
          productivity_goals?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          work_hours_end?: number | null
          work_hours_start?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_plans: {
        Row: {
          actual_hours: number | null
          ai_confidence: number | null
          completion_rate: number | null
          created_at: string
          id: string
          optimization_strategy: string | null
          planned_tasks: Json | null
          status: string | null
          total_estimated_hours: number | null
          updated_at: string
          user_id: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          actual_hours?: number | null
          ai_confidence?: number | null
          completion_rate?: number | null
          created_at?: string
          id?: string
          optimization_strategy?: string | null
          planned_tasks?: Json | null
          status?: string | null
          total_estimated_hours?: number | null
          updated_at?: string
          user_id: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          actual_hours?: number | null
          ai_confidence?: number | null
          completion_rate?: number | null
          created_at?: string
          id?: string
          optimization_strategy?: string | null
          planned_tasks?: Json | null
          status?: string | null
          total_estimated_hours?: number | null
          updated_at?: string
          user_id?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_duplicate_ai_messages: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_owner: {
        Args: { user_id: string }
        Returns: boolean
      }
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
