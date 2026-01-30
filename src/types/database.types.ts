export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          student_status: boolean;
          university: string | null;
          points: number;
          level: number;
          premium: boolean;
          preferences: {
            dietary: string[];
            categories: string[];
          };
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          student_status?: boolean;
          university?: string | null;
          points?: number;
          level?: number;
          premium?: boolean;
          preferences?: {
            dietary: string[];
            categories: string[];
          };
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          student_status?: boolean;
          university?: string | null;
          points?: number;
          level?: number;
          premium?: boolean;
          preferences?: {
            dietary: string[];
            categories: string[];
          };
          created_at?: string;
        };
      };
      baskets: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: 'alimentaire' | 'hygiène' | 'fournitures' | 'mixte';
          original_price: number;
          discounted_price: number;
          stock: number;
          store_name: string;
          store_location: string;
          image_url: string | null;
          available_until: string;
          co2_saved: number;
          food_saved: number;
          created_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          basket_id: string;
          quantity: number;
          total_price: number;
          status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
          pickup_method: 'click_collect' | 'delivery';
          pickup_time: string | null;
          points_earned: number;
          co2_saved: number;
          food_saved: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          basket_id: string;
          quantity?: number;
          total_price: number;
          status?: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
          pickup_method: 'click_collect' | 'delivery';
          pickup_time?: string | null;
          points_earned?: number;
          co2_saved?: number;
          food_saved?: number;
          created_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          condition_type: 'orders_count' | 'points_total' | 'co2_saved' | 'streak_days';
          condition_value: number;
          points_reward: number;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          challenge_type: 'weekly' | 'monthly' | 'special';
          goal_value: number;
          points_reward: number;
          start_date: string;
          end_date: string;
          active: boolean;
        };
      };
      user_challenges: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          progress: number;
          completed: boolean;
          completed_at: string | null;
        };
      };
    };
  };
}
