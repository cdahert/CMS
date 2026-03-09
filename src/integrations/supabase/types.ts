export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "commerce";
export type CommercePlan = "inicial" | "silver" | "gold" | "premium";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: AppRole;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: AppRole;
        };
        Relationships: [];
      };
      commerces: {
        Row: {
          id: string;
          name: string;
          ruc: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          logo_url: string | null;
          plan: CommercePlan;
          owner_id: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          ruc?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          plan?: CommercePlan;
          owner_id?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          ruc?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          plan?: CommercePlan;
          owner_id?: string | null;
          active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      commerce_members: {
        Row: {
          id: string;
          commerce_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          commerce_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          commerce_id?: string;
          user_id?: string;
          role?: string;
        };
        Relationships: [];
      };
      commission_matrix: {
        Row: {
          id: string;
          plan: CommercePlan;
          label: string | null;
          commission_initial: number;
          is_fixed: boolean;
          growth_discount: number;
          management_discount: number;
          communication_discount: number;
          shipping_discount: number;
          shipping_fixed: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan: CommercePlan;
          label?: string | null;
          commission_initial?: number;
          is_fixed?: boolean;
          growth_discount?: number;
          management_discount?: number;
          communication_discount?: number;
          shipping_discount?: number;
          shipping_fixed?: number;
          updated_at?: string;
        };
        Update: {
          plan?: CommercePlan;
          label?: string | null;
          commission_initial?: number;
          is_fixed?: boolean;
          growth_discount?: number;
          management_discount?: number;
          communication_discount?: number;
          shipping_discount?: number;
          shipping_fixed?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      commission_matrix_history: {
        Row: {
          id: string;
          matrix_id: string;
          plan: CommercePlan;
          field_changed: string | null;
          old_value: string | null;
          new_value: string | null;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          matrix_id: string;
          plan: CommercePlan;
          field_changed?: string | null;
          old_value?: string | null;
          new_value?: string | null;
          changed_by?: string | null;
          changed_at?: string;
        };
        Update: {
          matrix_id?: string;
          plan?: CommercePlan;
          field_changed?: string | null;
          old_value?: string | null;
          new_value?: string | null;
          changed_by?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          commerce_id: string;
          name: string;
          sku: string | null;
          description: string | null;
          category: string | null;
          image_url: string | null;
          stock: number;
          low_stock_threshold: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          commerce_id: string;
          name: string;
          sku?: string | null;
          description?: string | null;
          category?: string | null;
          image_url?: string | null;
          stock?: number;
          low_stock_threshold?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          commerce_id?: string;
          name?: string;
          sku?: string | null;
          description?: string | null;
          category?: string | null;
          image_url?: string | null;
          stock?: number;
          low_stock_threshold?: number;
          active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      prices: {
        Row: {
          id: string;
          product_id: string;
          amount: number;
          currency: string;
          valid_from: string;
          valid_until: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          amount: number;
          currency?: string;
          valid_from?: string;
          valid_until?: string | null;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          amount?: number;
          currency?: string;
          valid_from?: string;
          valid_until?: string | null;
        };
        Relationships: [];
      };
      inventory_movements: {
        Row: {
          id: string;
          product_id: string;
          commerce_id: string;
          quantity_change: number;
          stock_after: number;
          reason: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          commerce_id: string;
          quantity_change: number;
          stock_after: number;
          reason?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          commerce_id?: string;
          quantity_change?: number;
          stock_after?: number;
          reason?: string | null;
          created_by?: string | null;
        };
        Relationships: [];
      };
      offers: {
        Row: {
          id: string;
          commerce_id: string | null;
          name: string;
          description: string | null;
          discount_type: string;
          discount_value: number;
          starts_at: string;
          ends_at: string | null;
          promo_code: string | null;
          max_uses: number | null;
          active: boolean;
          is_multi_commerce: boolean;
          single_use_per_customer: boolean;
          categories: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          commerce_id?: string | null;
          name: string;
          description?: string | null;
          discount_type?: string;
          discount_value: number;
          starts_at?: string;
          ends_at?: string | null;
          promo_code?: string | null;
          max_uses?: number | null;
          active?: boolean;
          is_multi_commerce?: boolean;
          single_use_per_customer?: boolean;
          categories?: string[];
          created_at?: string;
        };
        Update: {
          commerce_id?: string | null;
          name?: string;
          description?: string | null;
          discount_type?: string;
          discount_value?: number;
          starts_at?: string;
          ends_at?: string | null;
          promo_code?: string | null;
          max_uses?: number | null;
          active?: boolean;
          is_multi_commerce?: boolean;
          single_use_per_customer?: boolean;
          categories?: string[];
        };
        Relationships: [];
      };
      offer_products: {
        Row: {
          id: string;
          offer_id: string;
          product_id: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          product_id: string;
        };
        Update: {
          offer_id?: string;
          product_id?: string;
        };
        Relationships: [];
      };
      offer_commerces: {
        Row: {
          id: string;
          offer_id: string;
          commerce_id: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          commerce_id: string;
        };
        Update: {
          offer_id?: string;
          commerce_id?: string;
        };
        Relationships: [];
      };
      offer_redemptions: {
        Row: {
          id: string;
          offer_id: string;
          commerce_id: string;
          customer_email: string;
          redeemed_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          commerce_id: string;
          customer_email: string;
          redeemed_at?: string;
        };
        Update: {
          offer_id?: string;
          commerce_id?: string;
          customer_email?: string;
        };
        Relationships: [];
      };
      bundles: {
        Row: {
          id: string;
          commerce_id: string;
          name: string;
          description: string | null;
          price: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          commerce_id: string;
          name: string;
          description?: string | null;
          price: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          commerce_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          active?: boolean;
        };
        Relationships: [];
      };
      bundle_items: {
        Row: {
          id: string;
          bundle_id: string;
          product_id: string;
          quantity: number;
        };
        Insert: {
          id?: string;
          bundle_id: string;
          product_id: string;
          quantity?: number;
        };
        Update: {
          bundle_id?: string;
          product_id?: string;
          quantity?: number;
        };
        Relationships: [];
      };
      settlements: {
        Row: {
          id: string;
          commerce_id: string;
          period_start: string;
          period_end: string;
          gross_sales: number;
          commission_rate: number;
          growth_discount: number;
          management_discount: number;
          communication_discount: number;
          final_commission_rate: number;
          commission_amount: number;
          shipping_cost: number;
          net_payable: number;
          status: string;
          notes: string | null;
          created_by: string | null;
          approved_at: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          commerce_id: string;
          period_start: string;
          period_end: string;
          gross_sales?: number;
          commission_rate?: number;
          growth_discount?: number;
          management_discount?: number;
          communication_discount?: number;
          final_commission_rate?: number;
          commission_amount?: number;
          shipping_cost?: number;
          net_payable?: number;
          status?: string;
          notes?: string | null;
          created_by?: string | null;
          approved_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          commerce_id?: string;
          period_start?: string;
          period_end?: string;
          gross_sales?: number;
          commission_rate?: number;
          growth_discount?: number;
          management_discount?: number;
          communication_discount?: number;
          final_commission_rate?: number;
          commission_amount?: number;
          shipping_cost?: number;
          net_payable?: number;
          status?: string;
          notes?: string | null;
          created_by?: string | null;
          approved_at?: string | null;
          paid_at?: string | null;
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          action: string;
          user_id: string | null;
          commerce_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          user_id?: string | null;
          commerce_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          action?: string;
          user_id?: string | null;
          commerce_id?: string | null;
          details?: Json | null;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: Json;
          excerpt: string | null;
          cover_image_url: string | null;
          category: string;
          tags: string[];
          author_id: string;
          published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: Json;
          excerpt?: string | null;
          cover_image_url?: string | null;
          category: string;
          tags?: string[];
          author_id: string;
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          content?: Json;
          excerpt?: string | null;
          cover_image_url?: string | null;
          category?: string;
          tags?: string[];
          author_id?: string;
          published?: boolean;
          published_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: AppRole };
        Returns: boolean;
      };
      is_commerce_member: {
        Args: { _user_id: string; _commerce_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      commerce_plan: CommercePlan;
    };
  };
}
