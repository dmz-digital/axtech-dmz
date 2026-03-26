/*
  # Create E-books Tables
  
  1. New Tables
    - `ebooks`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `category` (text) - Category for filtering
      - `cover_image_path` (text) - Path in storage bucket
      - `pdf_path` (text) - Path in storage bucket
      - `data` (jsonb) - Translations and metadata
        - title_pt, title_en
        - summary_pt, summary_en
      - `tags` (text array) - Searchable tags
      - `download_count` (integer) - Track downloads
      - `search_vector_pt` (tsvector) - Full-text search Portuguese
      - `search_vector_en` (tsvector) - Full-text search English
      - `is_published` (boolean) - Publication status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `ebook_leads`
      - `id` (uuid, primary key)
      - `name` (text) - Lead name
      - `email` (text) - Lead email
      - `ebook_id` (uuid) - Reference to ebook
      - `created_at` (timestamptz) - Download timestamp
  
  2. Security
    - Enable RLS on both tables
    - Public can read published ebooks
    - Leads table is insert-only for public, read for authenticated
  
  3. Indexes
    - Full-text search indexes
    - Category and slug indexes
*/

-- Create ebooks table
CREATE TABLE IF NOT EXISTS ebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'general',
  cover_image_path text NOT NULL,
  pdf_path text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  download_count integer DEFAULT 0,
  search_vector_pt tsvector,
  search_vector_en tsvector,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ebook_leads table
CREATE TABLE IF NOT EXISTS ebook_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  ebook_id uuid NOT NULL REFERENCES ebooks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebook_leads ENABLE ROW LEVEL SECURITY;

-- Ebooks policies
CREATE POLICY "Anyone can view published ebooks"
ON ebooks FOR SELECT
TO public
USING (is_published = true);

CREATE POLICY "Authenticated users can insert ebooks"
ON ebooks FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update ebooks"
ON ebooks FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete ebooks"
ON ebooks FOR DELETE
TO authenticated
USING (true);

-- Ebook leads policies
CREATE POLICY "Anyone can submit lead for ebook download"
ON ebook_leads FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ebooks 
    WHERE ebooks.id = ebook_id 
    AND ebooks.is_published = true
  )
);

CREATE POLICY "Authenticated users can view leads"
ON ebook_leads FOR SELECT
TO authenticated
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ebooks_slug ON ebooks(slug);
CREATE INDEX IF NOT EXISTS idx_ebooks_category ON ebooks(category);
CREATE INDEX IF NOT EXISTS idx_ebooks_is_published ON ebooks(is_published);
CREATE INDEX IF NOT EXISTS idx_ebooks_search_pt ON ebooks USING gin(search_vector_pt);
CREATE INDEX IF NOT EXISTS idx_ebooks_search_en ON ebooks USING gin(search_vector_en);
CREATE INDEX IF NOT EXISTS idx_ebook_leads_email ON ebook_leads(email);
CREATE INDEX IF NOT EXISTS idx_ebook_leads_ebook_id ON ebook_leads(ebook_id);

-- Function to update search vectors
CREATE OR REPLACE FUNCTION update_ebook_search_vectors()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector_pt := 
    setweight(to_tsvector('portuguese', COALESCE(NEW.data->>'title_pt', '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.data->>'summary_pt', '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  
  NEW.search_vector_en := 
    setweight(to_tsvector('english', COALESCE(NEW.data->>'title_en', '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.data->>'summary_en', '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vectors
DROP TRIGGER IF EXISTS trigger_update_ebook_search_vectors ON ebooks;
CREATE TRIGGER trigger_update_ebook_search_vectors
  BEFORE INSERT OR UPDATE ON ebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_ebook_search_vectors();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_ebook_download_count(ebook_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE ebooks 
  SET download_count = download_count + 1 
  WHERE id = ebook_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;