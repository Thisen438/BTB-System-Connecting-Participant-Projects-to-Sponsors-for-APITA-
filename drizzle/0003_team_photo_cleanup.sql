-- Let signed-in users delete files in their own folder (used when a team member or their photo is removed).
-- Supabase needs both a read rule and a delete rule on the same rows for a delete to go through.
CREATE POLICY "project_images_select_own" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-images' AND (storage.foldername(name))[1] = (select auth.uid())::text);--> statement-breakpoint
CREATE POLICY "project_images_delete_own" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-images' AND (storage.foldername(name))[1] = (select auth.uid())::text);
