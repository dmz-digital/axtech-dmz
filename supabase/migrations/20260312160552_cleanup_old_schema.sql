/*
  # Cleanup Old Schema

  1. Removed Functions
    - `search_articles` - replaced by `search_articles_jsonb`
    - `update_article_search_vector` - no longer needed

  2. Removed Tables
    - `article_tags` - tags now stored in articles_jsonb.data->'tags'
    - `article_translations` - translations now stored in articles_jsonb.data->'translations'
    - `articles` - replaced by articles_jsonb

  3. Notes
    - All data has been migrated to articles_jsonb table
    - Edge Functions have been updated to use new schema
    - search_result type is kept for search_articles_jsonb return type
*/

-- Drop the old search function
DROP FUNCTION IF EXISTS search_articles(text, text, text, int, int);

-- Drop the old trigger function (CASCADE removes dependent trigger)
DROP FUNCTION IF EXISTS update_article_search_vector() CASCADE;

-- Drop old tables (order matters due to foreign keys)
DROP TABLE IF EXISTS article_tags;
DROP TABLE IF EXISTS article_translations;
DROP TABLE IF EXISTS articles;
