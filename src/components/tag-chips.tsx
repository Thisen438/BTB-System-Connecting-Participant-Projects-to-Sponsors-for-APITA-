import { cn } from "@/lib/utils";

// Tag picker: styled labels around visually hidden native checkboxes (name "tagIds"),
// so keyboard and screen readers work. Put it inside a <fieldset> with a <legend>.
export function TagChips({
  tags,
  checkedIds,
  className,
}: {
  tags: { id: number; name: string }[];
  checkedIds?: number[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((t) => (
        <label
          key={t.id}
          className="cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors hover:bg-accent has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
        >
          <input
            type="checkbox"
            name="tagIds"
            value={t.id}
            defaultChecked={checkedIds?.includes(t.id)}
            className="sr-only"
          />
          {t.name}
        </label>
      ))}
    </div>
  );
}
