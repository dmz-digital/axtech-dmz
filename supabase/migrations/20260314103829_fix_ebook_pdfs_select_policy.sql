
/*
  # Fix ebook-pdfs storage: add SELECT policy for authenticated users

  The ebook-pdfs bucket is private (public: false). Supabase Storage requires a
  SELECT policy to exist so it can verify object ownership during uploads.
  Without it, INSERT operations fail with a RLS violation even though the INSERT
  policy is correctly defined.

  Changes:
  - Add SELECT policy on storage.objects for bucket ebook-pdfs allowing authenticated users to read
*/

DROP POLICY IF EXISTS "Authenticated users can read ebook pdfs" ON storage.objects;

CREATE POLICY "Authenticated users can read ebook pdfs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'ebook-pdfs');
