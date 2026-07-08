export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: "boat_owner" | "marina_owner" | "admin";
          company_name: string | null;
          vessel_name: string | null;
          vessel_length_ft: number | null;
          vessel_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "boat_owner" | "marina_owner" | "admin";
          company_name?: string | null;
          vessel_name?: string | null;
          vessel_length_ft?: number | null;
          vessel_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "boat_owner" | "marina_owner" | "admin";
          company_name?: string | null;
          vessel_name?: string | null;
          vessel_length_ft?: number | null;
          vessel_type?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      marinas: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          description: string | null;
          address: string;
          city: string;
          state: string;
          zip: string | null;
          lat: number | null;
          lng: number | null;
          amenities: string[];
          photos: string[];
          phone: string | null;
          email: string | null;
          website: string | null;
          is_active: boolean;
          source: string;
          claimed_at: string | null;
          stripe_account_id: string | null;
          stripe_onboarding_complete: boolean;
          payouts_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          description?: string | null;
          address: string;
          city: string;
          state: string;
          zip?: string | null;
          lat?: number | null;
          lng?: number | null;
          amenities?: string[];
          photos?: string[];
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          is_active?: boolean;
          source?: string;
          claimed_at?: string | null;
          stripe_account_id?: string | null;
          stripe_onboarding_complete?: boolean;
          payouts_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          owner_id?: string | null;
          name?: string;
          description?: string | null;
          address?: string;
          city?: string;
          state?: string;
          zip?: string | null;
          lat?: number | null;
          lng?: number | null;
          amenities?: string[];
          photos?: string[];
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          is_active?: boolean;
          source?: string;
          claimed_at?: string | null;
          stripe_account_id?: string | null;
          stripe_onboarding_complete?: boolean;
          payouts_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "marinas_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      slips: {
        Row: {
          id: string;
          marina_id: string;
          name: string;
          length_ft: number;
          width_ft: number | null;
          depth_ft: number | null;
          has_power: boolean;
          has_water: boolean;
          shore_power_type: string | null;
          price_per_night: number;
          price_per_week: number | null;
          price_per_month: number | null;
          is_available: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          marina_id: string;
          name: string;
          length_ft: number;
          width_ft?: number | null;
          depth_ft?: number | null;
          has_power?: boolean;
          has_water?: boolean;
          shore_power_type?: string | null;
          price_per_night: number;
          price_per_week?: number | null;
          price_per_month?: number | null;
          is_available?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          marina_id?: string;
          name?: string;
          length_ft?: number;
          width_ft?: number | null;
          depth_ft?: number | null;
          has_power?: boolean;
          has_water?: boolean;
          shore_power_type?: string | null;
          price_per_night?: number;
          price_per_week?: number | null;
          price_per_month?: number | null;
          is_available?: boolean;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "slips_marina_id_fkey";
            columns: ["marina_id"];
            isOneToOne: false;
            referencedRelation: "marinas";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          slip_id: string;
          marina_id: string;
          boat_owner_id: string;
          check_in: string;
          check_out: string;
          vessel_name: string | null;
          vessel_length: number | null;
          vessel_type: string | null;
          total_price: number;
          platform_fee_amount: number | null;
          stripe_payment_intent_id: string | null;
          stripe_charge_id: string | null;
          status:
            | "pending"
            | "approved"
            | "confirmed"
            | "completed"
            | "cancelled"
            | "declined";
          special_requests: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slip_id: string;
          marina_id: string;
          boat_owner_id: string;
          check_in: string;
          check_out: string;
          vessel_name?: string | null;
          vessel_length?: number | null;
          vessel_type?: string | null;
          total_price: number;
          platform_fee_amount?: number | null;
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          status?:
            | "pending"
            | "approved"
            | "confirmed"
            | "completed"
            | "cancelled"
            | "declined";
          special_requests?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slip_id?: string;
          marina_id?: string;
          boat_owner_id?: string;
          check_in?: string;
          check_out?: string;
          vessel_name?: string | null;
          vessel_length?: number | null;
          vessel_type?: string | null;
          total_price?: number;
          platform_fee_amount?: number | null;
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          status?:
            | "pending"
            | "approved"
            | "confirmed"
            | "completed"
            | "cancelled"
            | "declined";
          special_requests?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_slip_id_fkey";
            columns: ["slip_id"];
            isOneToOne: false;
            referencedRelation: "slips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_marina_id_fkey";
            columns: ["marina_id"];
            isOneToOne: false;
            referencedRelation: "marinas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_boat_owner_id_fkey";
            columns: ["boat_owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      marina_leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          user_type: 'yacht_owner' | 'marina_owner';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          user_type: 'yacht_owner' | 'marina_owner';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          user_type?: 'yacht_owner' | 'marina_owner';
          created_at?: string;
        };
        Relationships: [];
      };
      marina_spot_requests: {
        Row: {
          id: string;
          marina_id: string;
          name: string;
          email: string;
          check_in: string | null;
          check_out: string | null;
          vessel_length_ft: number | null;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          marina_id: string;
          name: string;
          email: string;
          check_in?: string | null;
          check_out?: string | null;
          vessel_length_ft?: number | null;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          marina_id?: string;
          name?: string;
          email?: string;
          check_in?: string | null;
          check_out?: string | null;
          vessel_length_ft?: number | null;
          message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "marina_spot_requests_marina_id_fkey";
            columns: ["marina_id"];
            isOneToOne: false;
            referencedRelation: "marinas";
            referencedColumns: ["id"];
          }
        ];
      };
      waitlist_signups: {
        Row: {
          id: string;
          email: string;
          region: string;
          boat_length: string | null;
          created_at: string;
          source: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          region: string;
          boat_length?: string | null;
          created_at?: string;
          source?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          region?: string;
          boat_length?: string | null;
          created_at?: string;
          source?: string | null;
        };
        Relationships: [];
      };
      calculator_leads: {
        Row: {
          id: string;
          created_at: string;
          marina_name: string | null;
          email: string;
          phone: string | null;
          role: string | null;
          region: string | null;
          total_slips: number | null;
          vacant_slips: number | null;
          avg_monthly_rate: number | null;
          avg_vacancy_months: number | null;
          annual_loss: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          marina_name?: string | null;
          email: string;
          phone?: string | null;
          role?: string | null;
          region?: string | null;
          total_slips?: number | null;
          vacant_slips?: number | null;
          avg_monthly_rate?: number | null;
          avg_vacancy_months?: number | null;
          annual_loss?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          marina_name?: string | null;
          email?: string;
          phone?: string | null;
          role?: string | null;
          region?: string | null;
          total_slips?: number | null;
          vacant_slips?: number | null;
          avg_monthly_rate?: number | null;
          avg_vacancy_months?: number | null;
          annual_loss?: number | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          marina_id: string;
          reviewer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          marina_id: string;
          reviewer_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_marina_id_fkey";
            columns: ["marina_id"];
            isOneToOne: false;
            referencedRelation: "marinas";
            referencedColumns: ["id"];
          },
        ];
      };
      stripe_processed_events: {
        Row: {
          id: string;              // Stripe event ID (e.g., evt_xxx)
          event_type: string;
          processed_at: string;
          booking_id: string | null;
        };
        Insert: {
          id: string;
          event_type: string;
          processed_at?: string;
          booking_id?: string | null;
        };
        Update: {
          id?: string;
          event_type?: string;
          processed_at?: string;
          booking_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stripe_processed_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_booking_atomic: {
        Args: {
          p_slip_id: string;
          p_marina_id: string;
          p_boat_owner_id: string;
          p_check_in: string;
          p_check_out: string;
          p_total_price: number;
          p_vessel_name: string;
          p_vessel_length: number;
          p_vessel_type: string;
          p_special_requests: string;
          p_platform_fee_amount?: number | null;
        };
        Returns: { booking_id: string | null; conflict: boolean }[];
      };
    };
    Enums: Record<string, never>;
  };
}
