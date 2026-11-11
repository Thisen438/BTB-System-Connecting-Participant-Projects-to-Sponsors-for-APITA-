# Build plan

Target: live before the APITA event in December 2026. Each phase ends with something that runs and can be demoed.
Stack and requirements are in [CLAUDE.md](CLAUDE.md).

## Phase 0: Scaffold
- Next.js (App Router) + TypeScript, Tailwind, shadcn/ui, Motion, Zod.
- Drizzle + Supabase clients (server and browser), `.env.example`.
- Base layout, landing page placeholder, lint/format config.
- **Done when:** `npm run dev` shows the placeholder page and `npm run build` passes.

## Phase 1: Data model + auth
- Drizzle schema and first migration: `profiles` (role: participant | investor), `tags`, `projects`, `project_tags`, `investor_interests`, `project_views`. (`meetings` and `notifications` are created in Phase 5, once the meeting flow is decided.)
- Supabase Auth: Google login + passwordless email link.
- Role chosen at sign-up; investor onboarding = pick interest tags (one screen).
- Row Level Security on every table with no policies: only server code can read or write. Policies are added when the browser needs direct access (Phase 5 notifications).
- **Done when:** both roles can sign up, sign in, and land on their own dashboard.

## Phase 1.5: Visual direction
- Brand colours, background, panel and button styles in `src/app/globals.css` (one place, every later screen inherits it).
- Shared header (`src/components/site-header.tsx`).
- Home, sign-in, onboarding and dashboard restyled as the reference for later screens.
- Light theme only for now.

## Phase 2: Participant listings
- Create / edit / unpublish a project: title, summary, description, tags, images (Supabase Storage), team info.
- "My projects" dashboard.
- **Done when:** a participant can publish a project with tags and images.
- **Status: done.** One account owns a project and team info is free text; tags come from the fixed seeded list (decisions 2 and 3 below).
- Images upload from the browser to the public `project-images` bucket (JPG, PNG, WebP, 5 MB each, up to 5 per project).
- Local testing: the sign-in page shows a password field in development only. Create test accounts in Supabase (Authentication → Users → Add user, "Auto Confirm User" ticked) to sign in without email.
- Known gaps, left open on purpose:
  - Saving fails on Safari before version 17 (iOS 16 and older): the form relies on a newer browser feature to know which button was clicked.
  - No limit on how many images one account can upload to storage; the 5-per-project limit is only checked on save.
  - Removing an image from a project does not delete the file from storage.
  - No delete-project button.

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
- Motion refinement (page transitions, list/card entrances). Reduced-motion support is already on app-wide.
- Loading/empty/error states, mobile layout, accessibility check.
- Seed data for the event, deploy to Vercel, Supabase on paid plan.
- **Before deploying:** switch `DATABASE_URL` from the Direct connection (port 5432, used in local dev) to the **Transaction pooler** string (port 6543). The direct one most likely will not connect from Vercel.
- **Before deploying:** set up our own email sender in Supabase (**Authentication → Emails → SMTP settings**, e.g. Resend) and enable Google login. The built-in sender only allows a couple of sign-in emails per hour for the whole project, so sign-ups at the event would fail.
- **Before deploying:** delete the password test accounts in Supabase (or use a separate Supabase project for the event). Password sign-in stays active for them even though the field is hidden in production.
- **Before deploying:** set Supabase **Authentication → URL Configuration → Site URL** to the production address. Email sign-in links are built from it.
- **Done when:** production URL works end to end on phone and desktop.

## Later (out of scope now)
- Email notifications via Resend.
- Calendar integration (Google Calendar / .ics).
- Admin view for event organisers.

## Decisions needed
1. **Meeting flow** (blocks Phase 5): investor proposes 2-3 time slots and owner picks one? Or owners publish availability during the event and investors book a slot? Physical (at the venue) or online?
2. **Who owns a project:** decided for now in Phase 2: one participant account. Revisit in Phase 5 if several team members must be notified.
3. **Tag list:** decided for now in Phase 2: fixed list we seed (ERP, AI Integration, Chat Bot, ...). Participants cannot add tags.
4. **Admin/organiser role** needed before the event?
