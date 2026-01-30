/*
  # Allow Public Basket Viewing

  ## Changes
  This migration allows unauthenticated users to view available baskets.
  Users can now browse all baskets without being logged in, but must 
  authenticate before placing an order.

  ## Security Updates
  - Drop existing restrictive policy on baskets
  - Create new policy allowing public (anon) and authenticated users to view available baskets
  - Order placement still requires authentication (existing policies remain unchanged)

  ## Tables Modified
  - `baskets` - Updated RLS policy to allow public SELECT access
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view available baskets" ON baskets;

-- Create new policy allowing both authenticated and anonymous users to view baskets
CREATE POLICY "Public can view available baskets"
  ON baskets FOR SELECT
  TO anon, authenticated
  USING (stock > 0 AND available_until > now());
