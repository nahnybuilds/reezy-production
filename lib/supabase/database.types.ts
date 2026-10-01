// Generated from Reezy Production (drzrdvxvrrhatlyunuyi) via the Supabase MCP `generate_typescript_types`.
// Regenerate after every migration; do not edit by hand.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Enums = {
  book_status: "want_to_read" | "reading" | "finished";
  position_unit: "page" | "percent";
  reflection_outcome: "shown" | "responded" | "skipped" | "new_instead";
  report_status: "open" | "reviewed" | "actioned" | "dismissed";
  report_target: "thought" | "reply";
  thought_privacy: "private" | "shared";
};

type UserBookRow = {
  copy_page_count: number | null;
  created_at: string;
  finished_at: string | null;
  id: string;
  isbn_13: string | null;
  last_check_in_at: string | null;
  ol_edition_key: string | null;
  position_page: number | null;
  position_pct: number;
  position_unit: Enums["position_unit"];
  started_at: string | null;
  status: Enums["book_status"];
  updated_at: string;
  user_id: string;
  work_id: string;
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      check_ins: {
        Row: { created_at: string; id: string; position_page: number | null; position_pct: number; position_unit: Enums["position_unit"]; user_book_id: string; user_id: string };
        Insert: { created_at?: string; id?: string; position_page?: number | null; position_pct: number; position_unit: Enums["position_unit"]; user_book_id: string; user_id?: string };
        Update: { created_at?: string; id?: string; position_page?: number | null; position_pct?: number; position_unit?: Enums["position_unit"]; user_book_id?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: "check_ins_user_book_id_fkey"; columns: ["user_book_id"]; isOneToOne: false; referencedRelation: "user_books"; referencedColumns: ["id"] },
          { foreignKeyName: "check_ins_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      likes: {
        Row: { created_at: string; thought_id: string; user_id: string };
        Insert: { created_at?: string; thought_id: string; user_id?: string };
        Update: { created_at?: string; thought_id?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: "likes_thought_id_fkey"; columns: ["thought_id"]; isOneToOne: false; referencedRelation: "thoughts"; referencedColumns: ["id"] },
          { foreignKeyName: "likes_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      profiles: {
        Row: { avatar_url: string | null; created_at: string; display_name: string | null; id: string; updated_at: string };
        Insert: { avatar_url?: string | null; created_at?: string; display_name?: string | null; id: string; updated_at?: string };
        Update: { avatar_url?: string | null; created_at?: string; display_name?: string | null; id?: string; updated_at?: string };
        Relationships: [];
      };
      reflection_events: {
        Row: { created_at: string; id: string; outcome: Enums["reflection_outcome"]; resolved_at: string | null; response_thought_id: string | null; shown_at_pct: number; thought_id: string; user_book_id: string; user_id: string };
        Insert: { created_at?: string; id?: string; outcome?: Enums["reflection_outcome"]; resolved_at?: string | null; response_thought_id?: string | null; shown_at_pct: number; thought_id: string; user_book_id: string; user_id?: string };
        Update: { created_at?: string; id?: string; outcome?: Enums["reflection_outcome"]; resolved_at?: string | null; response_thought_id?: string | null; shown_at_pct?: number; thought_id?: string; user_book_id?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: "reflection_events_response_thought_id_fkey"; columns: ["response_thought_id"]; isOneToOne: false; referencedRelation: "thoughts"; referencedColumns: ["id"] },
          { foreignKeyName: "reflection_events_thought_id_fkey"; columns: ["thought_id"]; isOneToOne: false; referencedRelation: "thoughts"; referencedColumns: ["id"] },
          { foreignKeyName: "reflection_events_user_book_id_fkey"; columns: ["user_book_id"]; isOneToOne: false; referencedRelation: "user_books"; referencedColumns: ["id"] },
          { foreignKeyName: "reflection_events_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      replies: {
        Row: { body: string | null; created_at: string; deleted_at: string | null; edited_at: string | null; id: string; thought_id: string; user_id: string };
        Insert: { body?: string | null; created_at?: string; deleted_at?: string | null; edited_at?: string | null; id?: string; thought_id: string; user_id?: string };
        Update: { body?: string | null; created_at?: string; deleted_at?: string | null; edited_at?: string | null; id?: string; thought_id?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: "replies_thought_id_fkey"; columns: ["thought_id"]; isOneToOne: false; referencedRelation: "thoughts"; referencedColumns: ["id"] },
          { foreignKeyName: "replies_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      reports: {
        Row: { created_at: string; id: string; reason: string | null; reporter_id: string | null; status: Enums["report_status"]; target_id: string; target_type: Enums["report_target"] };
        Insert: { created_at?: string; id?: string; reason?: string | null; reporter_id?: string | null; status?: Enums["report_status"]; target_id: string; target_type: Enums["report_target"] };
        Update: { created_at?: string; id?: string; reason?: string | null; reporter_id?: string | null; status?: Enums["report_status"]; target_id?: string; target_type?: Enums["report_target"] };
        Relationships: [
          { foreignKeyName: "reports_reporter_id_fkey"; columns: ["reporter_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      thoughts: {
        Row: {
          author_seen_replies_at: string; body: string | null; chain_root_id: string | null; created_at: string; deleted_at: string | null; edited_at: string | null;
          id: string; is_final: boolean; parent_thought_id: string | null; position_page: number | null; position_pct: number; position_unit: Enums["position_unit"];
          privacy: Enums["thought_privacy"]; user_book_id: string | null; user_id: string | null; work_id: string;
        };
        Insert: {
          author_seen_replies_at?: string; body?: string | null; chain_root_id?: string | null; created_at?: string; deleted_at?: string | null; edited_at?: string | null;
          id?: string; is_final?: boolean; parent_thought_id?: string | null; position_page?: number | null; position_pct: number; position_unit: Enums["position_unit"];
          privacy?: Enums["thought_privacy"]; user_book_id?: string | null; user_id?: string | null; work_id: string;
        };
        Update: {
          author_seen_replies_at?: string; body?: string | null; chain_root_id?: string | null; created_at?: string; deleted_at?: string | null; edited_at?: string | null;
          id?: string; is_final?: boolean; parent_thought_id?: string | null; position_page?: number | null; position_pct?: number; position_unit?: Enums["position_unit"];
          privacy?: Enums["thought_privacy"]; user_book_id?: string | null; user_id?: string | null; work_id?: string;
        };
        Relationships: [
          { foreignKeyName: "thoughts_chain_root_id_fkey"; columns: ["chain_root_id"]; isOneToOne: false; referencedRelation: "thoughts"; referencedColumns: ["id"] },
          { foreignKeyName: "thoughts_parent_thought_id_fkey"; columns: ["parent_thought_id"]; isOneToOne: false; referencedRelation: "thoughts"; referencedColumns: ["id"] },
          { foreignKeyName: "thoughts_user_book_id_fkey"; columns: ["user_book_id"]; isOneToOne: false; referencedRelation: "user_books"; referencedColumns: ["id"] },
          { foreignKeyName: "thoughts_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "thoughts_work_id_fkey"; columns: ["work_id"]; isOneToOne: false; referencedRelation: "works"; referencedColumns: ["id"] },
        ];
      };
      user_books: {
        Row: UserBookRow;
        Insert: {
          copy_page_count?: number | null; created_at?: string; finished_at?: string | null; id?: string; isbn_13?: string | null; last_check_in_at?: string | null;
          ol_edition_key?: string | null; position_page?: number | null; position_pct?: number; position_unit?: Enums["position_unit"]; started_at?: string | null;
          status: Enums["book_status"]; updated_at?: string; user_id?: string; work_id: string;
        };
        Update: {
          copy_page_count?: number | null; created_at?: string; finished_at?: string | null; id?: string; isbn_13?: string | null; last_check_in_at?: string | null;
          ol_edition_key?: string | null; position_page?: number | null; position_pct?: number; position_unit?: Enums["position_unit"]; started_at?: string | null;
          status?: Enums["book_status"]; updated_at?: string; user_id?: string; work_id?: string;
        };
        Relationships: [
          { foreignKeyName: "user_books_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "user_books_work_id_fkey"; columns: ["work_id"]; isOneToOne: false; referencedRelation: "works"; referencedColumns: ["id"] },
        ];
      };
      works: {
        Row: {
          authors: string[]; cover_id: number | null; created_at: string; description: string | null; first_publish_year: number | null; id: string;
          ol_work_key: string; page_count_median: number | null; title: string; updated_at: string;
        };
        Insert: {
          authors?: string[]; cover_id?: number | null; created_at?: string; description?: string | null; first_publish_year?: number | null; id?: string;
          ol_work_key: string; page_count_median?: number | null; title: string; updated_at?: string;
        };
        Update: {
          authors?: string[]; cover_id?: number | null; created_at?: string; description?: string | null; first_publish_year?: number | null; id?: string;
          ol_work_key?: string; page_count_median?: number | null; title?: string; updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      can_see_position: { Args: { p_pct: number; p_work: string }; Returns: boolean };
      delete_my_account: { Args: never; Returns: undefined };
      log_progress: {
        Args: { p_copy_page_count?: number; p_unit: Enums["position_unit"]; p_user_book_id: string; p_value: number };
        Returns: UserBookRow;
        SetofOptions: { from: "*"; to: "user_books"; isOneToOne: true; isSetofReturn: false };
      };
      readers_talking: { Args: { p_work: string }; Returns: number };
      thoughts_ahead: { Args: { p_work: string }; Returns: number };
    };
    Enums: Enums;
    CompositeTypes: { [_ in never]: never };
  };
};

export type BookStatus = Enums["book_status"];
export type PositionUnit = Enums["position_unit"];
export type UserBook = UserBookRow;
export type Work = Database["public"]["Tables"]["works"]["Row"];
