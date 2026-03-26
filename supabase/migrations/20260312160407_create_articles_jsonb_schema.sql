/*
  # Create Articles JSONB Schema

  1. New Tables
    - `articles_jsonb`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `category` (text) - Article category (banking, life-science, healthcare)
      - `data` (jsonb) - Contains image_url, translations (pt/en), and tags
      - `search_vector_pt` (tsvector) - Full-text search vector for Portuguese
      - `search_vector_en` (tsvector) - Full-text search vector for English
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. JSONB Data Structure
    ```json
    {
      "image_url": "string or null",
      "translations": {
        "pt": { "title": "...", "summary": "...", "content": "..." },
        "en": { "title": "...", "summary": "...", "content": "..." }
      },
      "tags": ["tag1", "tag2", ...]
    }
    ```

  3. Indexes
    - GIN index on search_vector_pt for Portuguese full-text search
    - GIN index on search_vector_en for English full-text search
    - GIN index on data for JSONB path queries
    - B-tree index on category for filtering
    - Unique index on slug

  4. Triggers
    - Auto-update search vectors on insert/update
    - Auto-update updated_at timestamp

  5. Security
    - Enable RLS on articles_jsonb table
    - Public read access policy
*/

-- Create the articles_jsonb table
CREATE TABLE IF NOT EXISTS articles_jsonb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_vector_pt tsvector,
  search_vector_en tsvector,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_articles_jsonb_search_pt ON articles_jsonb USING GIN (search_vector_pt);
CREATE INDEX IF NOT EXISTS idx_articles_jsonb_search_en ON articles_jsonb USING GIN (search_vector_en);

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_articles_jsonb_data ON articles_jsonb USING GIN (data jsonb_path_ops);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_articles_jsonb_category ON articles_jsonb (category);

-- Create function to update search vectors
CREATE OR REPLACE FUNCTION update_articles_jsonb_search_vectors()
RETURNS TRIGGER AS $$
DECLARE
  pt_title text;
  pt_summary text;
  pt_content text;
  en_title text;
  en_summary text;
  en_content text;
BEGIN
  -- Extract Portuguese content
  pt_title := COALESCE(NEW.data->'translations'->'pt'->>'title', '');
  pt_summary := COALESCE(NEW.data->'translations'->'pt'->>'summary', '');
  pt_content := COALESCE(NEW.data->'translations'->'pt'->>'content', '');
  
  -- Extract English content
  en_title := COALESCE(NEW.data->'translations'->'en'->>'title', '');
  en_summary := COALESCE(NEW.data->'translations'->'en'->>'summary', '');
  en_content := COALESCE(NEW.data->'translations'->'en'->>'content', '');
  
  -- Build Portuguese search vector with weights (A: title, B: summary, C: content)
  NEW.search_vector_pt := 
    setweight(to_tsvector('portuguese', pt_title), 'A') ||
    setweight(to_tsvector('portuguese', pt_summary), 'B') ||
    setweight(to_tsvector('portuguese', pt_content), 'C');
  
  -- Build English search vector with weights
  NEW.search_vector_en := 
    setweight(to_tsvector('english', en_title), 'A') ||
    setweight(to_tsvector('english', en_summary), 'B') ||
    setweight(to_tsvector('english', en_content), 'C');
  
  -- Update timestamp
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates
DROP TRIGGER IF EXISTS trigger_update_articles_jsonb_search ON articles_jsonb;
CREATE TRIGGER trigger_update_articles_jsonb_search
  BEFORE INSERT OR UPDATE ON articles_jsonb
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_jsonb_search_vectors();

-- Enable Row Level Security
ALTER TABLE articles_jsonb ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can read articles"
  ON articles_jsonb
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policy for authenticated users to insert (admin would need additional role check)
CREATE POLICY "Authenticated users can insert articles"
  ON articles_jsonb
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for authenticated users to update
CREATE POLICY "Authenticated users can update articles"
  ON articles_jsonb
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
