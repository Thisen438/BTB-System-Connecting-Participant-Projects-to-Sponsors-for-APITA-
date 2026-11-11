export const PROJECT_IMAGES_BUCKET = "project-images";

// The bucket is public, so a stored path maps straight to a URL.
export const projectImageUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PROJECT_IMAGES_BUCKET}/${path}`;
