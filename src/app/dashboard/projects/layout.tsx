// Shared frame for the new-project and edit-project pages. The header comes from the dashboard layout.
export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      {children}
    </main>
  );
}
