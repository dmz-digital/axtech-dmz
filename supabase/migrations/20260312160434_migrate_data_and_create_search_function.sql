/*
  # Migrate Data to JSONB and Create New Search Function

  1. Data Migration
    - Consolidates data from articles, article_translations, and article_tags
    - Transforms into JSONB structure in articles_jsonb table
    - Preserves all existing content and relationships

  2. New Search Function
    - `search_articles_jsonb(query_text, lang, category_filter, limit_count, offset_count)`
    - Uses pre-computed search vectors (search_vector_pt, search_vector_en)
    - Returns same result type for API compatibility
    - Extracts data from JSONB based on language parameter

  3. Notes
    - Trigger auto-populates search vectors during insert
    - Same ranking algorithm as original function
*/

-- Migrate data from old tables to new JSONB structure
INSERT INTO articles_jsonb (id, slug, category, data, created_at)
SELECT 
  a.id,
  a.slug,
  a.category,
  jsonb_build_object(
    'image_url', a.image_url,
    'translations', (
      SELECT jsonb_object_agg(
        t.language,
        jsonb_build_object(
          'title', t.title,
          'summary', t.summary,
          'content', t.content
        )
      )
      FROM article_translations t
      WHERE t.article_id = a.id
    ),
    'tags', COALESCE(
      (
        SELECT jsonb_agg(tag.tag)
        FROM article_tags tag
        WHERE tag.article_id = a.id
      ),
      '[]'::jsonb
    )
  ),
  a.created_at
FROM articles a
ON CONFLICT (slug) DO NOTHING;

-- Create new search function using JSONB table
CREATE OR REPLACE FUNCTION search_articles_jsonb(
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
  config := CASE lang
    WHEN 'pt' THEN 'portuguese'::regconfig
    WHEN 'en' THEN 'english'::regconfig
    ELSE 'simple'::regconfig
  END;
  
  tsquery_value := plainto_tsquery(config, query_text);
  
  RETURN QUERY
  SELECT 
    a.id,
    a.slug,
    a.category,
    (a.data->>'image_url')::text as image_url,
    (a.data->'translations'->lang->>'title')::text as title,
    (a.data->'translations'->lang->>'summary')::text as summary,
    ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(a.data->'tags', '[]'::jsonb))
    ) as tags,
    CASE 
      WHEN lang = 'pt' THEN ts_rank(a.search_vector_pt, tsquery_value)
      WHEN lang = 'en' THEN ts_rank(a.search_vector_en, tsquery_value)
      ELSE 0.0
    END as rank,
    a.created_at
  FROM articles_jsonb a
  WHERE 
    CASE 
      WHEN lang = 'pt' THEN a.search_vector_pt @@ tsquery_value
      WHEN lang = 'en' THEN a.search_vector_en @@ tsquery_value
      ELSE false
    END
    AND (category_filter IS NULL OR a.category = category_filter)
  ORDER BY rank DESC, a.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION search_articles_jsonb TO anon;
GRANT EXECUTE ON FUNCTION search_articles_jsonb TO authenticated;
