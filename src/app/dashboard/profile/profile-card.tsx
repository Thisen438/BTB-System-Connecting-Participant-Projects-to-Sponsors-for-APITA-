import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { projectImageUrl } from "@/lib/images";

// An investor's profile as a plain card: on their dashboard and on My profile.
export function ProfileCard({
  profile,
  interests,
  action,
}: {
  profile: {
    displayName: string;
    title: string;
    organisation: string;
    bio: string;
    imagePath: string;
    linkUrl: string;
  };
  interests: string[];
  action?: React.ReactNode;
}) {
  const role = [profile.title, profile.organisation].filter(Boolean).join(", ");

  return (
    <section className="surface flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
      <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-2xl font-semibold text-accent-foreground">
        {profile.imagePath ? (
          <Image
            src={projectImageUrl(profile.imagePath)}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <span aria-hidden>{profile.displayName.charAt(0).toUpperCase()}</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div>
          <h2 className="truncate text-xl font-semibold">
            {profile.displayName}
          </h2>
          <p className="text-sm text-muted-foreground">{role || "Investor"}</p>
        </div>
        {profile.bio && <p className="text-sm">{profile.bio}</p>}
        {profile.linkUrl && (
          <a
            href={profile.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit max-w-full items-center gap-1.5 rounded-md text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ExternalLink aria-hidden className="size-4 shrink-0" />
            <span className="truncate">
              {profile.linkUrl.replace(/^https?:\/\/(www\.)?/i, "")}
            </span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Interested in</h3>
          <ul className="flex flex-wrap gap-2">
            {interests.map((name) => (
              <li
                key={name}
                className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {action}
    </section>
  );
}
