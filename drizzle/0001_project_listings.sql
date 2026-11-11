ALTER TABLE "projects" ADD COLUMN "team" text DEFAULT '' NOT NULL;--> statement-breakpoint
-- Project images: public to read, 5 MB per file. Signed-in users upload from the browser into a folder named after their user id.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-images', 'project-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;--> statement-breakpoint
CREATE POLICY "project_images_insert_own" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-images' AND (storage.foldername(name))[1] = (select auth.uid())::text);
