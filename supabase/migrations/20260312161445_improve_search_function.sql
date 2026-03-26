/*
  # Improve Search Function

  1. Changes
    - Modified search_articles_jsonb to use OR logic between search terms
    - Added fallback to ILIKE search when full-text search returns no results
    - Better handling of conversational queries like "Como funciona o mft?"

  2. Notes
    - Uses ts_rank for relevance scoring with full-text matches
    - Falls back to pattern matching for flexibility
    - Maintains same return type for API compatibility
*/

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
  search_pattern text;
  result_count int;
BEGIN
  config := CASE lang
    WHEN 'pt' THEN 'portuguese'::regconfig
    WHEN 'en' THEN 'english'::regconfig
    ELSE 'simple'::regconfig
  END;
  
  -- Build OR-based tsquery for more flexible matching
  -- Split query into words and join with OR
  SELECT string_agg(word, ' | ')
  INTO search_pattern
  FROM (
    SELECT unnest(regexp_split_to_array(lower(trim(query_text)), '\s+')) AS word
  ) words
  WHERE length(word) > 2;
  
  -- If we have valid search terms, create tsquery
  IF search_pattern IS NOT NULL AND search_pattern != '' THEN
    tsquery_value := to_tsquery(config, search_pattern);
  ELSE
    tsquery_value := plainto_tsquery(config, query_text);
  END IF;
  
  -- Try full-text search first
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
  
  -- Check if we got results
  GET DIAGNOSTICS result_count = ROW_COUNT;
  
  -- If no results from full-text, fallback to ILIKE search
  IF result_count = 0 THEN
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
      0.5::real as rank,
      a.created_at
    FROM articles_jsonb a
    WHERE 
      (
        (a.data->'translations'->lang->>'title') ILIKE '%' || query_text || '%'
        OR (a.data->'translations'->lang->>'summary') ILIKE '%' || query_text || '%'
        OR (a.data->'translations'->lang->>'content') ILIKE '%' || query_text || '%'
        OR EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(COALESCE(a.data->'tags', '[]'::jsonb)) tag
          WHERE tag ILIKE '%' || query_text || '%'
        )
      )
      AND (category_filter IS NULL OR a.category = category_filter)
    ORDER BY a.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
  END IF;
END;
$$;
