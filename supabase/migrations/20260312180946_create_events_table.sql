/*
  # Create Events Table

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `slug` (text, unique, for URL-friendly identifiers)
      - `data` (jsonb, contains multilingual title, description)
      - `event_date` (date, when the event takes place)
      - `event_time` (time, start time of event)
      - `location` (text, venue name or online platform)
      - `location_type` (text, 'online' or 'presencial')
      - `image_url` (text, cover image)
      - `registration_url` (text, external registration link)
      - `is_published` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. JSONB Data Structure
    - title_pt: Portuguese title
    - title_en: English title
    - title_es: Spanish title
    - description_pt: Portuguese description
    - description_en: English description
    - description_es: Spanish description

  3. Security
    - Enable RLS on `events` table
    - Public can read published events
    - Admins can manage all events
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  event_date date NOT NULL,
  event_time time,
  location text,
  location_type text NOT NULL DEFAULT 'presencial' CHECK (location_type IN ('online', 'presencial')),
  image_url text,
  registration_url text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published events"
  ON events
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can read all events"
  ON events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete events"
  ON events
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

CREATE OR REPLACE FUNCTION public.handle_event_updated()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_event_updated ON events;
CREATE TRIGGER on_event_updated
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION public.handle_event_updated();