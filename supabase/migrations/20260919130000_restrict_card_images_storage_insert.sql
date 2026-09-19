-- The original card-images storage policy allowed ANY client (public anon
-- key, not just the service-role edge function) to upload arbitrary files
-- into the public bucket: "WITH CHECK (bucket_id = 'card-images')" has no
-- `TO service_role` restriction, so CREATE POLICY defaults to PUBLIC. This
-- mirrors the same class of bug already fixed for generated_cards in
-- 20260223184009 (see "Deny public inserts"). The edge function
-- (generate-card-image) uses the service-role key, which bypasses RLS
-- entirely regardless of this policy, so denying all RLS-governed inserts
-- does not break the legitimate upload path.
DROP POLICY IF EXISTS "Service role can upload card images" ON storage.objects;

CREATE POLICY "Deny public uploads to card images"
ON storage.objects
FOR INSERT
WITH CHECK (false);
