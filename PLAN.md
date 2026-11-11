# Build plan

Target: live before the APITA event in December 2026. Each phase ends with something that runs and can be demoed.
Stack and requirements are in [CLAUDE.md](CLAUDE.md).

## Phase 0: Scaffold
- Next.js (App Router) + TypeScript, Tailwind, shadcn/ui, Motion, Zod.
- Drizzle + Supabase clients (server and browser), `.env.example`.
- Base layout, landing page placeholder, lint/format config.
- **Done when:** `npm run dev` shows the placeholder page and `npm run build` passes.

## Phase 1: Data model + auth
- Drizzle schema and first migration: `profiles` (role: participant | investor), `tags`, `projects`, `project_tags`, `investor_interests`, `project_views`, `meetings`, `notifications`.
- Supabase Auth: Google login + passwordless email link.
- Role chosen at sign-up; investor onboarding = pick interest tags (one screen).
- Row Level Security policies per table.
- **Done when:** both roles can sign up, sign in, and land on their own dashboard.

## Phase 2: Participant listings
- Create / edit / unpublish a project: title, summary, description, tags, images (Supabase Storage), team info.
- "My projects" dashboard.
- **Done when:** a participant can publish a project with tags and images.

## Phase 3: Investor browsing
- Project catalog (cards), search by text, filter by tags.
- Project detail page with **Schedule meeting** as the primary button.
- Record views/clicks into `project_views`.
- **Done when:** an investor can find a project by tag and open its page.

## Phase 4: Recommendations
- Postgres scoring query: tag overlap with investor interests + weight from tags of projects they viewed/clicked, small recency boost.
- "Recommended for you" row on the catalog; default sort for investors.
- **Done when:** two investors with different interests see different ordering.

## Phase 5: Meetings + in-app notifications
- Meeting request flow (see decision below), stored as `meetings` with status + proposed slots.
- Participant accepts / declines / proposes another slot.
- Notifications: inbox page + live toast via Supabase Realtime, unread badge.
- **Done when:** investor requests, owner gets a live pop-up, accepts, investor is notified.

## Phase 6: Polish + launch
- Motion pass (page transitions, list/card entrances, respects reduced motion).
- Loading/empty/error states, mobile layout, accessibility check.
- Seed data for the event, deploy to Vercel, Supabase on paid plan.
- **Done when:** production URL works end to end on phone and desktop.

## Later (out of scope now)
- Email notifications via Resend.
- Calendar integration (Google Calendar / .ics).
- Admin view for event organisers.

## Decisions needed
1. **Meeting flow** (blocks Phase 5): investor proposes 2-3 time slots and owner picks one? Or owners publish availability during the event and investors book a slot? Physical (at the venue) or online?
2. **Who owns a project:** one participant account, or a team with several members who all get notified?
3. **Tag list:** fixed list we seed (ERP, AI Integration, Chat Bot, ...) or participants can add new tags?
4. **Admin/organiser role** needed before the event?
