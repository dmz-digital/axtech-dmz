/*
  # Create newsletter_subscribers table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null) - subscriber email address
      - `created_at` (timestamptz) - subscription timestamp
      - `active` (boolean) - whether the subscription is active

  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - No public read access (only service role can read)
    - Public insert allowed for any email (unauthenticated signup flow)

  3. Notes
    - Duplicate email submissions are handled via ON CONFLICT DO NOTHING
    - The edge function uses service role key to bypass RLS for inserts
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert subscribers"
  ON newsletter_subscribers
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can select subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO service_role
  USING (true);
