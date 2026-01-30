/*
  # EcoPanier Database Schema

  ## Overview
  This migration creates the complete database structure for EcoPanier, 
  an anti-waste marketplace connecting students with discounted surplus products.

  ## New Tables

  ### 1. `profiles`
  - User profile information linked to auth.users
  - `id` (uuid, FK to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `student_status` (boolean)
  - `university` (text, optional)
  - `points` (integer, default 0)
  - `level` (integer, default 1)
  - `premium` (boolean, default false)
  - `preferences` (jsonb, dietary preferences, categories)
  - `created_at` (timestamptz)
  
  ### 2. `baskets`
  - Available baskets/bundles for purchase
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `category` (text: 'alimentaire', 'hygiène', 'fournitures', 'mixte')
  - `original_price` (decimal)
  - `discounted_price` (decimal)
  - `stock` (integer)
  - `store_name` (text)
  - `store_location` (text)
  - `image_url` (text)
  - `available_until` (timestamptz)
  - `co2_saved` (decimal, kg)
  - `food_saved` (decimal, kg)
  - `created_at` (timestamptz)
  
  ### 3. `orders`
  - User orders/purchases
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `basket_id` (uuid, FK to baskets)
  - `quantity` (integer)
  - `total_price` (decimal)
  - `status` (text: 'pending', 'confirmed', 'ready', 'completed', 'cancelled')
  - `pickup_method` (text: 'click_collect', 'delivery')
  - `pickup_time` (timestamptz)
  - `points_earned` (integer)
  - `co2_saved` (decimal)
  - `food_saved` (decimal)
  - `created_at` (timestamptz)
  
  ### 4. `badges`
  - Available achievement badges
  - `id` (uuid, primary key)
  - `name` (text)
  - `description` (text)
  - `icon` (text)
  - `condition_type` (text: 'orders_count', 'points_total', 'co2_saved', 'streak_days')
  - `condition_value` (integer)
  - `points_reward` (integer)
  
  ### 5. `user_badges`
  - Badges earned by users
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `badge_id` (uuid, FK to badges)
  - `earned_at` (timestamptz)
  
  ### 6. `challenges`
  - Active challenges for gamification
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `challenge_type` (text: 'weekly', 'monthly', 'special')
  - `goal_value` (integer)
  - `points_reward` (integer)
  - `start_date` (timestamptz)
  - `end_date` (timestamptz)
  - `active` (boolean)
  
  ### 7. `user_challenges`
  - User progress in challenges
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `challenge_id` (uuid, FK to challenges)
  - `progress` (integer, default 0)
  - `completed` (boolean, default false)
  - `completed_at` (timestamptz, nullable)
  
  ## Security
  - RLS enabled on all tables
  - Users can read their own profile and update it
  - Users can view all baskets
  - Users can manage their own orders
  - Users can view badges and their own earned badges
  - Users can view challenges and their own progress
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  student_status boolean DEFAULT true,
  university text,
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  premium boolean DEFAULT false,
  preferences jsonb DEFAULT '{"dietary": [], "categories": []}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create baskets table
CREATE TABLE IF NOT EXISTS baskets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('alimentaire', 'hygiène', 'fournitures', 'mixte')),
  original_price decimal(10,2) NOT NULL,
  discounted_price decimal(10,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  store_name text NOT NULL,
  store_location text NOT NULL,
  image_url text,
  available_until timestamptz NOT NULL,
  co2_saved decimal(10,2) DEFAULT 0,
  food_saved decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE baskets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available baskets"
  ON baskets FOR SELECT
  TO authenticated
  USING (stock > 0 AND available_until > now());

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  basket_id uuid NOT NULL REFERENCES baskets(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  total_price decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ready', 'completed', 'cancelled')),
  pickup_method text NOT NULL CHECK (pickup_method IN ('click_collect', 'delivery')),
  pickup_time timestamptz,
  points_earned integer DEFAULT 0,
  co2_saved decimal(10,2) DEFAULT 0,
  food_saved decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  condition_type text NOT NULL CHECK (condition_type IN ('orders_count', 'points_total', 'co2_saved', 'streak_days')),
  condition_value integer NOT NULL,
  points_reward integer DEFAULT 0
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL CHECK (challenge_type IN ('weekly', 'monthly', 'special')),
  goal_value integer NOT NULL,
  points_reward integer DEFAULT 0,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  active boolean DEFAULT true
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (active = true AND end_date > now());

-- Create user_challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge progress"
  ON user_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can track own challenge progress"
  ON user_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
  ON user_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert sample badges
INSERT INTO badges (name, description, icon, condition_type, condition_value, points_reward) VALUES
  ('Premier Pas', 'Effectuer votre première commande', 'ShoppingBag', 'orders_count', 1, 50),
  ('Éco-Warrior', 'Sauver 10kg de nourriture', 'Leaf', 'orders_count', 5, 100),
  ('Champion Anti-Gaspi', 'Effectuer 20 commandes', 'Trophy', 'orders_count', 20, 250),
  ('Maître de l''Épargne', 'Accumuler 500 points', 'Star', 'points_total', 500, 100),
  ('Héros du Climat', 'Éviter 50kg de CO2', 'Cloud', 'co2_saved', 50, 200);

-- Insert sample challenges
INSERT INTO challenges (title, description, challenge_type, goal_value, points_reward, start_date, end_date, active) VALUES
  ('Challenge Hebdomadaire', 'Effectuer 3 commandes cette semaine', 'weekly', 3, 100, now(), now() + interval '7 days', true),
  ('Défi du Mois', 'Sauver 5kg de nourriture ce mois', 'monthly', 5, 300, now(), now() + interval '30 days', true),
  ('Mission Spéciale Campus', 'Parrainer 3 amis étudiants', 'special', 3, 500, now(), now() + interval '60 days', true);

-- Insert sample baskets
INSERT INTO baskets (title, description, category, original_price, discounted_price, stock, store_name, store_location, image_url, available_until, co2_saved, food_saved) VALUES
  ('Panier Fruits & Légumes', 'Fruits et légumes de saison légèrement marqués mais délicieux', 'alimentaire', 15.00, 5.00, 10, 'Carrefour Campus', 'Avenue Jean Jaurès', 'https://images.pexels.com/photos/1128678/pexels-photo-1128678.jpeg', now() + interval '2 days', 2.5, 3.0),
  ('Panier Petit Déjeuner', 'Viennoiseries, jus de fruits et yaourts proche DLC', 'alimentaire', 12.00, 4.00, 8, 'Auchan Centre', 'Place du Marché', 'https://images.pexels.com/photos/1842332/pexels-photo-1842332.jpeg', now() + interval '1 day', 1.8, 2.0),
  ('Kit Hygiène Étudiant', 'Produits d''hygiène essentiels', 'hygiène', 20.00, 8.00, 15, 'Leclerc Express', 'Rue de la République', 'https://images.pexels.com/photos/4202519/pexels-photo-4202519.jpeg', now() + interval '5 days', 1.0, 0.5),
  ('Panier Repas Complet', 'Pâtes, sauce, légumes et protéines pour 3 repas', 'alimentaire', 18.00, 6.50, 12, 'Carrefour Campus', 'Avenue Jean Jaurès', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', now() + interval '3 days', 3.2, 4.5),
  ('Pack Snacks Étudiants', 'Barres céréales, chips, biscuits proche DLC', 'alimentaire', 10.00, 3.50, 20, 'Intermarché', 'Boulevard des Étudiants', 'https://images.pexels.com/photos/3850512/pexels-photo-3850512.jpeg', now() + interval '2 days', 1.5, 1.8),
  ('Kit Fournitures', 'Cahiers, stylos, surligneurs de fin de série', 'fournitures', 25.00, 10.00, 6, 'Auchan Centre', 'Place du Marché', 'https://images.pexels.com/photos/159519/back-to-school-paper-colored-paper-stationery-159519.jpeg', now() + interval '7 days', 0.8, 0.3);
