import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PROJECT_IMAGES_BUCKET } from "@/lib/images";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            for (const { name, value, options } of toSet)
              cookieStore.set(name, value, options);
          } catch {
            // Server Components cannot set cookies; session refresh is handled in Phase 1.
          }
        },
      },
    },
  );
}

// A person's photo must not stay online after they are removed or the photo is replaced.
// Call it after the database change; a failed file delete is ignored rather than failing the save.
export async function deleteStoredImage(path: string) {
  if (!path) return;
  const supabase = await createClient();
  await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([path]);
}
