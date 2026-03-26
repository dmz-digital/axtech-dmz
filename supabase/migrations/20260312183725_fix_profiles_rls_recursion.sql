/*
  # Fix Profiles RLS Infinite Recursion
  
  1. Problem
    - The "Admins can read all profiles" policy causes infinite recursion
    - When checking if user is admin, it queries profiles table, which triggers RLS check again
  
  2. Solution
    - Drop existing problematic policies
    - Recreate policies using the is_admin() SECURITY DEFINER function
    - The SECURITY DEFINER function bypasses RLS checks
  
  3. Changes
    - Drop "Admins can read all profiles" policy
    - Drop "Users can update own profile" policy (also has subquery issue)
    - Recreate simpler, non-recursive policies
*/

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
