// Signed-in pages read the session at request time, so they stream in behind this fallback.
export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center" role="status">
      <span className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none" />
      <span className="sr-only">Loading</span>
    </main>
  );
}
