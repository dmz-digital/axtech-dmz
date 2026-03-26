/*
  # Create is_admin Helper Function

  1. Functions
    - `is_admin()` - Returns true if current user has admin role
    - Used in RLS policies and edge function authorization

  2. Notes
    - Security definer allows checking profiles table without recursive RLS
*/

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;