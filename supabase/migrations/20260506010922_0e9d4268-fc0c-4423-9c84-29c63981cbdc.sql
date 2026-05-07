
DROP POLICY IF EXISTS "Authenticated can create testimonials" ON public.testimonials;
CREATE POLICY "Authenticated can create testimonials"
ON public.testimonials
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can update active flag for unsubscribe" ON public.newsletter_subscribers;

DROP POLICY IF EXISTS "Public read documents" ON storage.objects;
CREATE POLICY "Authenticated read documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Users can view identity documents" ON storage.objects;
CREATE POLICY "Owner or admin can view identity documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'identity-documents' AND (
    public.is_admin(auth.uid())
    OR (auth.uid()::text = (storage.foldername(name))[1])
  )
);

UPDATE storage.buckets SET public = false WHERE id = 'identity-documents';

REVOKE EXECUTE ON FUNCTION public.reset_stuck_newsletter_campaigns() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.unsubscribe_newsletter(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_blog_views(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.generate_blog_public_id() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_blog_views(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.unsubscribe_newsletter(text) TO anon, authenticated;
