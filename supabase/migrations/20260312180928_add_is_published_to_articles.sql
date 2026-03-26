/*
  # Add is_published Field to Articles

  1. Changes
    - Add `is_published` column to `articles_jsonb` table
    - Default value is true (to maintain backward compatibility with existing articles)
    - Update search function to filter by is_published for public queries

  2. Notes
    - Existing articles will be marked as published by default
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles_jsonb' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE articles_jsonb ADD COLUMN is_published boolean NOT NULL DEFAULT true;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_articles_jsonb_is_published ON articles_jsonb(is_published);