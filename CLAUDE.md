# BTB System: Connecting Participant Projects to Sponsors (APITA)

## What this is

APITA is an event held in December where participants build projects and investors look for projects worth investing in.

This system is a storefront-style marketplace connecting the two sides, like sellers and buyers:

- **Participants (sellers)** list their projects.
- **Investors (buyers)** browse, find projects that match what they are looking for, and request a 1-to-1 meeting with the project owners.

Investors prefer to invest after a 1-to-1 conversation rather than only through the system, so **meeting scheduling is the most important feature**.

## Requirements

### Participants
- Separate participant user accounts.
- List their project (system) with tags such as "ERP", "AI Integration", "Chat Bot", so projects can be categorized.

### Investors
- Separate investor user accounts.
- **Sign-up must be very simple and fast.**
- During sign-up, investors select the tags/categories they are interested in.
- Browse the collection of listed projects and search/filter by tags.

### Marketplace / recommendations
- The listing uses a recommendation algorithm that suggests projects to each investor based on what they often look for (their selected interests plus browsing behaviour).

### Project page and meetings
- Clicking a project opens its detail page, with a **Schedule meeting** button (primary action) plus other functionality.
- Exact meeting flow is **still under discussion**.
- When an investor schedules a meeting, the project owners must be notified:
  - **In-system notification**: pop-up and/or inbox. Build this now.
  - **Email**: required eventually, but **out of scope for now**. Do not build it yet.

## UX direction
- The whole system must feel smooth and seamless.
- Smooth animations, but not overly flashy.

## Tech stack (agreed)
- **Next.js (App Router) + TypeScript**: frontend and backend in one codebase.
- **Supabase**: PostgreSQL database, Auth (Google login / passwordless email link for fast sign-up), Realtime (in-app notifications), Storage (project images).
- **Drizzle ORM**: typed queries and migrations.
- **Tailwind CSS + shadcn/ui** for UI, **Motion** for subtle animations.
- **Zod** for validation shared between client and server.
- **Vercel** for hosting.
- **Resend** for email, later.
- Recommendations: a Postgres scoring query (tag overlap with investor interests, adjusted by viewing/click behaviour). No ML.
- Meetings: stored in our own database (status + proposed slots), so calendar tools can be added later.
- Use Supabase's paid plan for the event: the free plan pauses after a week of inactivity.

## Open questions
- Meeting scheduling flow: time slots, calendar integration, accept/decline, etc.
- Email notifications: deferred.

## Tools
- **graphify** (`/graphify .`) is installed for Claude Code. Use it to build a knowledge graph of the codebase once there is code, and query `graphify-out/graph.json` instead of grepping through many files.
