INSERT INTO storage.buckets (id, name, public)
VALUES ('identity-documents', 'identity-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload identity documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'identity-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view identity documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'identity-documents');

CREATE POLICY "Users can update identity documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'identity-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete identity documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'identity-documents' AND auth.uid() IS NOT NULL);

UPDATE blog_posts SET public_id = 'art001-03-026' WHERE id = '2583126b-704b-4060-aff2-d9cf861fad76';
UPDATE blog_posts SET public_id = 'art002-03-026' WHERE id = '58225602-c6d2-4165-a92b-ad2f95116a31';
UPDATE blog_posts SET public_id = 'art003-03-026' WHERE id = '21dea11b-afce-44b3-8ada-65faa2ace473';
UPDATE blog_posts SET public_id = 'art004-03-026' WHERE id = '34589860-2aa5-452d-b328-dd883022fa1c';
UPDATE blog_posts SET public_id = 'art005-03-026' WHERE id = '03e52299-6798-40df-a03f-e868a6bbbdc5';
UPDATE blog_posts SET public_id = 'art006-03-026' WHERE id = 'a7b7d284-7280-47f6-9d3f-392dffe6adfa';
UPDATE blog_posts SET public_id = 'art007-03-026' WHERE id = '1a91074a-18e1-4d59-af10-fce5ceffb9c8';
UPDATE blog_posts SET public_id = 'art008-04-026' WHERE id = 'd008ac76-57fe-4d35-ab82-5dd38273a151';

CREATE OR REPLACE FUNCTION public.generate_blog_public_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  article_count INTEGER;
  month_str TEXT;
  year_str TEXT;
  new_public_id TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO article_count FROM blog_posts;
  month_str := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
  year_str := LPAD((EXTRACT(YEAR FROM NOW())::INTEGER % 1000)::TEXT, 3, '0');
  new_public_id := 'art' || LPAD(article_count::TEXT, 3, '0') || '-' || month_str || '-' || year_str;
  WHILE EXISTS (SELECT 1 FROM blog_posts WHERE public_id = new_public_id) LOOP
    article_count := article_count + 1;
    new_public_id := 'art' || LPAD(article_count::TEXT, 3, '0') || '-' || month_str || '-' || year_str;
  END LOOP;
  NEW.public_id := new_public_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_blog_public_id_trigger
BEFORE INSERT ON blog_posts
FOR EACH ROW
WHEN (NEW.public_id IS NULL OR NEW.public_id = '')
EXECUTE FUNCTION public.generate_blog_public_id();