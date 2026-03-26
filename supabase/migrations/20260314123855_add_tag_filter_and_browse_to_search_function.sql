/*
  # Add tag_filter param and browse mode to search_all_content

  1. Changes
    - Adds `tag_filter text DEFAULT NULL` parameter to `search_all_content`
    - When tag_filter is set AND query_text is empty/null, returns all content matching
      the tag without requiring a full-text query (browse mode)
    - When tag_filter is set alongside a query, intersects results
    - Existing category_filter and content_type_filter logic unchanged
*/

CREATE OR REPLACE FUNCTION search_all_content(
  query_text text,
  lang text DEFAULT 'pt',
  content_type_filter text DEFAULT NULL,
  category_filter text DEFAULT NULL,
  tag_filter text DEFAULT NULL,
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
  browse_mode bool;
BEGIN
  config := CASE lang
    WHEN 'pt' THEN 'portuguese'::regconfig
    WHEN 'en' THEN 'english'::regconfig
    ELSE 'simple'::regconfig
  END;

  browse_mode := (query_text IS NULL OR trim(query_text) = '');

  IF NOT browse_mode THEN
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
  END IF;

  -- Browse mode: no text query, just filter by category/tag
  IF browse_mode THEN
    RETURN QUERY
    SELECT * FROM (
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
        1.0::real as rank,
        a.created_at
      FROM articles_jsonb a
      WHERE
        a.is_published = true
        AND (content_type_filter IS NULL OR content_type_filter = 'article' OR content_type_filter = 'all')
        AND (category_filter IS NULL OR a.category = category_filter)
        AND (
          tag_filter IS NULL
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(COALESCE(a.data->'tags', '[]'::jsonb)) t
            WHERE lower(t) = lower(tag_filter)
          )
        )

      UNION ALL

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
        1.0::real as rank,
        e.created_at
      FROM ebooks e
      WHERE
        e.is_published = true
        AND (content_type_filter IS NULL OR content_type_filter = 'ebook' OR content_type_filter = 'all')
        AND (category_filter IS NULL OR e.category = category_filter)
        AND (
          tag_filter IS NULL
          OR EXISTS (
            SELECT 1 FROM unnest(e.tags) t
            WHERE lower(t) = lower(tag_filter)
          )
        )
    ) combined
    ORDER BY created_at DESC
    LIMIT limit_count
    OFFSET offset_count;

    RETURN;
  END IF;

  -- Full-text search mode
  RETURN QUERY
  SELECT * FROM (
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
      AND (
        tag_filter IS NULL
        OR EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(COALESCE(a.data->'tags', '[]'::jsonb)) t
          WHERE lower(t) = lower(tag_filter)
        )
      )

    UNION ALL

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
      AND (
        tag_filter IS NULL
        OR EXISTS (
          SELECT 1 FROM unnest(e.tags) t
          WHERE lower(t) = lower(tag_filter)
        )
      )
  ) combined
  ORDER BY rank DESC, created_at DESC
  LIMIT limit_count
  OFFSET offset_count;

  GET DIAGNOSTICS result_count = ROW_COUNT;

  -- Fallback ILIKE if no FTS results
  IF result_count = 0 THEN
    RETURN QUERY
    SELECT * FROM (
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
        AND (
          tag_filter IS NULL
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(COALESCE(a.data->'tags', '[]'::jsonb)) t
            WHERE lower(t) = lower(tag_filter)
          )
        )

      UNION ALL

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
        AND (
          tag_filter IS NULL
          OR EXISTS (
            SELECT 1 FROM unnest(e.tags) t
            WHERE lower(t) = lower(tag_filter)
          )
        )
    ) combined
    ORDER BY created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
  END IF;
END;
$$;
