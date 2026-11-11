import { getImageProps } from "next/image";
import { TeamLanyardRail } from "@/components/ui/team-lanyard-rail";
import { projectImageUrl } from "@/lib/images";
import type { TeamMember } from "@/lib/team";

// Badges show a photo about 70px wide; ask Next.js for a small version instead of the 5 MB original.
const smallPhoto = (path: string) =>
  getImageProps({
    src: projectImageUrl(path),
    alt: "",
    width: 160,
    height: 160,
  }).props.src;

const linkLabel = (url: string) =>
  /linkedin\.com/i.test(url)
    ? "LinkedIn"
    : /github\.com/i.test(url)
      ? "GitHub"
      : "Website";

// The team shown as hanging badges. Used in the participant portal and, from Phase 3, on the project page investors see.
export function TeamRail({
  members,
  teamName,
  className,
}: {
  members: TeamMember[];
  teamName: string;
  className?: string;
}) {
  return (
    <TeamLanyardRail
      className={className}
      caption="Hover a badge to meet someone, click it to flip it over."
      items={members.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        team: teamName || undefined,
        image: m.imagePath && smallPhoto(m.imagePath),
        bio: m.bio || undefined,
        links: m.linkUrl
          ? [{ label: linkLabel(m.linkUrl), href: m.linkUrl }]
          : undefined,
      }))}
    />
  );
}
