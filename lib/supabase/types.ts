export type SectionKind = "content" | "activity";
export type UnlockStatus = "pending" | "approved" | "rejected";
export type EventType =
  | "enter"
  | "year_select"
  | "subject_open"
  | "module_open"
  | "section_view"
  | "unlock_click"
  | "unlock_submitted";

export interface Database {
  public: {
    Tables: {
      years: {
        Row: { id: string; label: string; sort_order: number };
        Insert: { id?: string; label: string; sort_order: number };
        Update: Partial<{ label: string; sort_order: number }>;
      };
      subjects: {
        Row: { id: string; year_id: string; title: string; slug: string; sort_order: number };
        Insert: { id?: string; year_id: string; title: string; slug: string; sort_order: number };
        Update: Partial<{ year_id: string; title: string; slug: string; sort_order: number }>;
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
        };
        Insert: {
          id?: string;
          module_id: string;
          kind: SectionKind;
          heading: string;
          body_md: string;
          sort_order: number;
        };
        Update: Partial<{
          module_id: string;
          kind: SectionKind;
          heading: string;
          body_md: string;
          sort_order: number;
        }>;
      };
      unlocks: {
        Row: {
          id: string;
          module_id: string;
          device_id: string;
          gcash_ref: string;
          status: UnlockStatus;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          device_id: string;
          gcash_ref: string;
          status?: UnlockStatus;
          amount: number;
          created_at?: string;
        };
        Update: Partial<{ status: UnlockStatus }>;
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
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
