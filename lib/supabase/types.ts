import type { TopologyData } from '@/lib/topology/types';

export type SectionKind = "content" | "activity";
export type UnlockStatus = "pending" | "approved" | "rejected";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type EventType =
  | "enter"
  | "year_select"
  | "subject_open"
  | "module_open"
  | "section_view"
  | "subscribe_click"
  | "paywall_teaser_view"
  | "paywall_teaser_click"
  | "unlock_click"
  | "unlock_submitted"
  | "share_card_open"
  | "share_card_share"
  | "share_card_download";

export interface Database {
  public: {
    Tables: {
      counters: {
        Row: {
          resource_type: string;
          resource_id: string;
          reader_count: number;
          read_count: number;
        };
        Insert: {
          resource_type: string;
          resource_id: string;
          reader_count?: number;
          read_count?: number;
        };
        Update: Partial<{ reader_count: number; read_count: number }>;
      };
      counter_log: {
        Row: {
          device_id: string;
          resource_type: string;
          resource_id: string;
          first_seen_at: string;
          last_read_at: string;
        };
        Insert: {
          device_id: string;
          resource_type: string;
          resource_id: string;
          first_seen_at?: string;
          last_read_at?: string;
        };
        Update: Partial<{ last_read_at: string }>;
      };
      years: {
        Row: { id: string; label: string; sort_order: number; coming_soon: boolean };
        Insert: { id?: string; label: string; sort_order: number; coming_soon?: boolean };
        Update: Partial<{ label: string; sort_order: number; coming_soon: boolean }>;
      };
      subjects: {
        Row: {
          id: string;
          year_id: string;
          title: string;
          slug: string;
          sort_order: number;
          semester: number;
          kind: "major" | "minor";
        };
        Insert: {
          id?: string;
          year_id: string;
          title: string;
          slug: string;
          sort_order: number;
          semester?: number;
          kind?: "major" | "minor";
        };
        Update: Partial<{
          year_id: string;
          title: string;
          slug: string;
          sort_order: number;
          semester: number;
          kind: "major" | "minor";
        }>;
      };
      modules: {
        Row: { id: string; subject_id: string; title: string; slug: string; sort_order: number };
        Insert: { id?: string; subject_id: string; title: string; slug: string; sort_order: number };
        Update: Partial<{ subject_id: string; title: string; slug: string; sort_order: number }>;
      };
      sections: {
        Row: {
          id: string;
          module_id: string;
          kind: SectionKind;
          heading: string;
          body_md: string;
          sort_order: number;
          ide_language: "python" | "sql" | "java" | "c" | null;
          starter_code: string | null;
          topology_data: TopologyData | null;
        };
        Insert: {
          id?: string;
          module_id: string;
          kind: SectionKind;
          heading: string;
          body_md: string;
          sort_order: number;
          ide_language?: "python" | "sql" | "java" | "c" | null;
          starter_code?: string | null;
          topology_data?: TopologyData | null;
        };
        Update: Partial<{
          module_id: string;
          kind: SectionKind;
          heading: string;
          body_md: string;
          sort_order: number;
          ide_language: "python" | "sql" | "java" | "c" | null;
          starter_code: string | null;
          topology_data: TopologyData | null;
        }>;
      };
      unlocks: {
        Row: {
          id: string;
          module_id: string;
          device_id: string;
          user_id: string | null;
          gcash_ref: string;
          status: UnlockStatus;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          device_id: string;
          user_id?: string | null;
          gcash_ref: string;
          status?: UnlockStatus;
          amount: number;
          created_at?: string;
        };
        Update: Partial<{ status: UnlockStatus }>;
      };
      subscriptions: {
        Row: {
          id: string;
          device_id: string;
          user_id: string | null;
          year_id: string;
          subject_id: string | null;
          paymongo_link_id: string;
          status: SubscriptionStatus;
          current_period_end: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          user_id?: string | null;
          year_id: string;
          subject_id?: string | null;
          paymongo_link_id: string;
          status?: SubscriptionStatus;
          current_period_end: string;
          created_at?: string;
        };
        Update: Partial<{ status: SubscriptionStatus; current_period_end: string }>;
      };
      payments: {
        Row: {
          id: string;
          paymongo_link_id: string;
          device_id: string;
          user_id: string | null;
          year_id: string;
          subject_id: string | null;
          amount: number;
          currency: string;
          paid_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          paymongo_link_id: string;
          device_id: string;
          user_id?: string | null;
          year_id: string;
          subject_id?: string | null;
          amount: number;
          currency?: string;
          paid_at: string;
          created_at?: string;
        };
        // Append-only ledger: no updates.
        Update: Record<string, never>;
      };
      events: {
        Row: {
          id: string;
          device_id: string;
          event_type: EventType;
          year_id: string | null;
          subject_id: string | null;
          module_id: string | null;
          section_id: string | null;
          referrer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          event_type: EventType;
          year_id?: string | null;
          subject_id?: string | null;
          module_id?: string | null;
          section_id?: string | null;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          created_at?: string;
        };
        Update: never;
      };
      module_progress: {
        Row: {
          device_id: string;
          user_id: string | null;
          module_id: string;
          completed_at: string;
        };
        Insert: {
          device_id: string;
          user_id?: string | null;
          module_id: string;
          completed_at?: string;
        };
        Update: Partial<{ completed_at: string }>;
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          name: string;
          device_id: string;
          source: "coming_soon" | "paywall";
          willing_to_pay: "yes" | "no" | "maybe" | null;
          needs_capstone: boolean | null;
          device_type: "mobile" | "desktop";
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          device_id: string;
          source: "coming_soon" | "paywall";
          willing_to_pay?: "yes" | "no" | "maybe" | null;
          needs_capstone?: boolean | null;
          device_type: "mobile" | "desktop";
          created_at?: string;
        };
        Update: Partial<{
          willing_to_pay: "yes" | "no" | "maybe" | null;
          needs_capstone: boolean | null;
        }>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      record_visit: {
        Args: {
          p_device_id: string;
          p_resource_type: string;
          p_resource_id: string;
        };
        Returns: void;
      };
      admin_dau_30d: {
        Args: Record<string, never>;
        Returns: { day: string; unique_devices: number }[];
      };
      admin_active_since: {
        Args: { p_minutes: number };
        Returns: number;
      };
      admin_user_totals: {
        Args: { p_new_days: number };
        Returns: { total_users: number; new_users: number; recurring_users: number }[];
      };
      admin_funnel_counts: {
        Args: Record<string, never>;
        Returns: { event_type: string; unique_devices: number }[];
      };
      admin_top_sections: {
        Args: { p_limit: number };
        Returns: { section_id: string; event_count: number }[];
      };
      admin_active_subscribers: {
        Args: Record<string, never>;
        Returns: number;
      };
      admin_waitlist_agg: {
        Args: Record<string, never>;
        Returns: {
          total: number;
          by_year: { year_label: string; count: number }[] | null;
          by_subject: { subject_title: string; year_label: string; count: number }[] | null;
        };
      };
    };
    Enums: Record<string, never>;
  };
}
