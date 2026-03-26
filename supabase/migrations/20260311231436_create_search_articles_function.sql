/*
  # Create Full-Text Search Function

  1. Functions
    - `search_articles(query_text, lang, category_filter, limit_count, offset_count)`
      - Performs full-text search across article translations
      - Returns articles with relevance ranking
      - Supports filtering by category
      - Returns article data with translations and tags

  2. Notes
    - Uses ts_rank for relevance scoring
    - Weights: title (A), summary (B), content (C)
    - Supports Portuguese and English text search configurations
*/

-- Create type for search results
DROP TYPE IF EXISTS search_result CASCADE;
CREATE TYPE search_result AS (
  id uuid,
  slug text,
  category text,
  image_url text,
  title text,
  summary text,
  tags text[],
  rank real,
  created_at timestamptz
);

-- Create search function
CREATE OR REPLACE FUNCTION search_articles(
  query_text text,
  lang text DEFAULT 'pt',
  category_filter text DEFAULT NULL,
  limit_count int DEFAULT 10,
  offset_count int DEFAULT 0
)
RETURNS SETOF search_result
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config regconfig;
  tsquery_value tsquery;
BEGIN
  -- Select appropriate text search configuration
  config := CASE lang
    WHEN 'pt' THEN 'portuguese'::regconfig
    WHEN 'en' THEN 'english'::regconfig
    ELSE 'simple'::regconfig
  END;
  
  -- Parse the query text
  tsquery_value := plainto_tsquery(config, query_text);
  
  RETURN QUERY
  SELECT 
    a.id,
    a.slug,
    a.category,
    a.image_url,
    t.title,
    t.summary,
    ARRAY(
      SELECT tag.tag 
      FROM article_tags tag 
      WHERE tag.article_id = a.id
    ) as tags,
    ts_rank(t.search_vector, tsquery_value) as rank,
    a.created_at
  FROM articles a
  JOIN article_translations t ON t.article_id = a.id AND t.language = lang
  WHERE t.search_vector @@ tsquery_value
    AND (category_filter IS NULL OR a.category = category_filter)
  ORDER BY rank DESC, a.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION search_articles TO anon;
GRANT EXECUTE ON FUNCTION search_articles TO authenticated;