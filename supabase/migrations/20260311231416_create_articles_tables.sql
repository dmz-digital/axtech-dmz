/*
  # Create Articles Tables with Full-Text Search

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `category` (text) - Article category (banking, healthcare, life-science)
      - `image_url` (text, nullable) - Featured image URL
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `article_translations`
      - `id` (uuid, primary key)
      - `article_id` (uuid, foreign key) - Reference to articles table
      - `language` (text) - Language code (pt, en)
      - `title` (text) - Localized title
      - `summary` (text) - Localized summary/excerpt
      - `content` (text) - Full article content
      - `search_vector` (tsvector) - Full-text search index
      - Unique constraint on (article_id, language)
    
    - `article_tags`
      - `id` (uuid, primary key)
      - `article_id` (uuid, foreign key) - Reference to articles table
      - `tag` (text) - Tag name

  2. Indexes
    - GIN index on search_vector for fast full-text search
    - Index on article_translations(article_id, language)
    - Index on article_tags(article_id)
    - Index on articles(category)
    - Index on articles(slug)

  3. Triggers
    - Auto-update search_vector when title/summary/content change
    - Auto-update updated_at on articles modification

  4. Security
    - Enable RLS on all tables
    - Public read access for published articles (no auth required for reading)
*/

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create article_translations table
CREATE TABLE IF NOT EXISTS article_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  language text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  content text NOT NULL,
  search_vector tsvector,
  UNIQUE(article_id, language)
);

-- Create article_tags table
CREATE TABLE IF NOT EXISTS article_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag text NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_article_translations_search ON article_translations USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_article_translations_article_lang ON article_translations(article_id, language);
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- Function to update search_vector
CREATE OR REPLACE FUNCTION update_article_search_vector()
RETURNS TRIGGER AS $$
DECLARE
  config regconfig;
BEGIN
  -- Select appropriate text search configuration based on language
  config := CASE NEW.language
    WHEN 'pt' THEN 'portuguese'::regconfig
    WHEN 'en' THEN 'english'::regconfig
    ELSE 'simple'::regconfig
  END;
  
  NEW.search_vector := 
    setweight(to_tsvector(config, COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector(config, COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector(config, COALESCE(NEW.content, '')), 'C');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search_vector
DROP TRIGGER IF EXISTS trigger_update_search_vector ON article_translations;
CREATE TRIGGER trigger_update_search_vector
  BEFORE INSERT OR UPDATE OF title, summary, content, language
  ON article_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_article_search_vector();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_articles_updated_at ON articles;
CREATE TRIGGER trigger_update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

-- Public read policies (articles are public content)
CREATE POLICY "Anyone can read articles"
  ON articles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read article translations"
  ON article_translations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read article tags"
  ON article_tags FOR SELECT
  USING (true);

-- Admin policies (for future admin functionality)
-- Only authenticated users with admin role can modify
CREATE POLICY "Admins can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert article translations"
  ON article_translations FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update article translations"
  ON article_translations FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can delete article translations"
  ON article_translations FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert article tags"
  ON article_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update article tags"
  ON article_tags FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can delete article tags"
  ON article_tags FOR DELETE
  TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );