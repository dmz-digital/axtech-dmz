/*
  # Create Unified Search Function for Articles and E-books
  
  1. New Function
    - `search_all_content` - Searches both articles and ebooks
    - Returns unified results with content_type field
    - Supports full-text search with OR logic
    - Fallback to ILIKE for no results
  
  2. Features
    - Content type filter (all, article, ebook)
    - Category filter
    - Pagination support
    - Relevance ranking
*/

-- Create return type for unified search
DROP TYPE IF EXISTS unified_search_result CASCADE;
CREATE TYPE unified_search_result AS (
  id uuid,
  slug text,
  content_type text,
  category text,
  image_url text,
  title text,
  summary text,
  tags text[],
  rank real,
  created_at timestamptz
);

-- Create unified search function
CREATE OR REPLACE FUNCTION search_all_content(
  query_text text,
  lang text DEFAULT 'pt',
  content_type_filter text DEFAULT NULL,
  category_filter text DEFAULT NULL,
  limit_count int DEFAULT 20,
  offset_count int DEFAULT 0
)
RETURNS SETOF unified_search_result
LANGUAGE plpgsql
AS $$
DECLARE
  config regconfig;
  tsquery_value tsquery;
  search_pattern text;
  result_count int;
BEGIN
  config := CASE lang
    WHEN 'pt' THEN 'portuguese'::regconfig
    WHEN 'en' THEN 'english'::regconfig
    ELSE 'simple'::regconfig
  END;

  SELECT string_agg(word, ' | ')
  INTO search_pattern
  FROM (
    SELECT unnest(regexp_split_to_array(lower(trim(query_text)), '\s+')) AS word
  ) words
  WHERE length(word) > 2;

  IF search_pattern IS NOT NULL AND search_pattern != '' THEN
    tsquery_value := to_tsquery(config, search_pattern);
  ELSE
    tsquery_value := plainto_tsquery(config, query_text);
  END IF;

  -- Full-text search
  RETURN QUERY
  SELECT * FROM (
    -- Articles
    SELECT 
      a.id,
      a.slug,
      'article'::text as content_type,
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
      AND (content_type_filter IS NULL OR content_type_filter = 'article' OR content_type_filter = 'all')
      AND (category_filter IS NULL OR a.category = category_filter)
    
    UNION ALL
    
    -- Ebooks
    SELECT 
      e.id,
      e.slug,
      'ebook'::text as content_type,
      e.category,
      e.cover_image_path as image_url,
      CASE 
        WHEN lang = 'pt' THEN (e.data->>'title_pt')::text
        ELSE (e.data->>'title_en')::text
      END as title,
      CASE 
        WHEN lang = 'pt' THEN (e.data->>'summary_pt')::text
        ELSE (e.data->>'summary_en')::text
      END as summary,
      e.tags,
      CASE 
        WHEN lang = 'pt' THEN ts_rank(e.search_vector_pt, tsquery_value)
        WHEN lang = 'en' THEN ts_rank(e.search_vector_en, tsquery_value)
        ELSE 0.0
      END as rank,
      e.created_at
    FROM ebooks e
    WHERE 
      e.is_published = true
      AND CASE 
        WHEN lang = 'pt' THEN e.search_vector_pt @@ tsquery_value
        WHEN lang = 'en' THEN e.search_vector_en @@ tsquery_value
        ELSE false
      END
      AND (content_type_filter IS NULL OR content_type_filter = 'ebook' OR content_type_filter = 'all')
      AND (category_filter IS NULL OR e.category = category_filter)
  ) combined
  ORDER BY rank DESC, created_at DESC
  LIMIT limit_count
  OFFSET offset_count;

  GET DIAGNOSTICS result_count = ROW_COUNT;

  -- Fallback to ILIKE if no results
  IF result_count = 0 THEN
    RETURN QUERY
    SELECT * FROM (
      -- Articles ILIKE
      SELECT 
        a.id,
        a.slug,
        'article'::text as content_type,
        a.category,
        (a.data->>'image_url')::text as image_url,
        (a.data->'translations'->lang->>'title')::text as title,
        (a.data->'translations'->lang->>'summary')::text as summary,
        ARRAY(
          SELECT jsonb_array_elements_text(COALESCE(a.data->'tags', '[]'::jsonb))
        ) as tags,
        0.5::real as rank,
        a.created_at
      FROM articles_jsonb a
      WHERE 
        (
          (a.data->'translations'->lang->>'title') ILIKE '%' || query_text || '%'
          OR (a.data->'translations'->lang->>'summary') ILIKE '%' || query_text || '%'
          OR (a.data->'translations'->lang->>'content') ILIKE '%' || query_text || '%'
        )
        AND (content_type_filter IS NULL OR content_type_filter = 'article' OR content_type_filter = 'all')
        AND (category_filter IS NULL OR a.category = category_filter)
      
      UNION ALL
      
      -- Ebooks ILIKE
      SELECT 
        e.id,
        e.slug,
        'ebook'::text as content_type,
        e.category,
        e.cover_image_path as image_url,
        CASE 
          WHEN lang = 'pt' THEN (e.data->>'title_pt')::text
          ELSE (e.data->>'title_en')::text
        END as title,
        CASE 
          WHEN lang = 'pt' THEN (e.data->>'summary_pt')::text
          ELSE (e.data->>'summary_en')::text
        END as summary,
        e.tags,
        0.5::real as rank,
        e.created_at
      FROM ebooks e
      WHERE 
        e.is_published = true
        AND (
          (e.data->>'title_pt') ILIKE '%' || query_text || '%'
          OR (e.data->>'title_en') ILIKE '%' || query_text || '%'
          OR (e.data->>'summary_pt') ILIKE '%' || query_text || '%'
          OR (e.data->>'summary_en') ILIKE '%' || query_text || '%'
          OR EXISTS (
            SELECT 1 FROM unnest(e.tags) tag WHERE tag ILIKE '%' || query_text || '%'
          )
        )
        AND (content_type_filter IS NULL OR content_type_filter = 'ebook' OR content_type_filter = 'all')
        AND (category_filter IS NULL OR e.category = category_filter)
    ) combined
    ORDER BY created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
  END IF;
END;
$$;