# BTB-System-Connecting-Participant-Projects-to-Sponsors-for-APITA-

Next.js app backed by Supabase (auth, Postgres, image storage) and Drizzle ORM.

## Run it locally

Needs Node.js 20.9 or newer.

1. Clone and install:

   ```bash
   git clone https://github.com/Thisen438/BTB-System-Connecting-Participant-Projects-to-Sponsors-for-APITA-.git
   cd BTB-System-Connecting-Participant-Projects-to-Sponsors-for-APITA-
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill it in. Either:
   - **Shared database:** ask the project owner for the values (send them privately, never commit them), or
   - **Your own database:** create a free project at [supabase.com](https://supabase.com) and copy the values from its dashboard (paths are in `.env.example`).

3. Create the tables. Only needed for your own Supabase project; the shared one is already set up:

   ```bash
   npm run db:migrate
   ```

   This also creates the `project-images` storage bucket and its access rules.

4. Start the app and open http://localhost:3000:

   ```bash
   npm run dev
   ```

## Other commands

- `npm test`: run the unit tests
- `npm run lint`: lint
- `npm run db:generate`: generate a migration after editing `src/db/schema.ts`
- `npm run db:studio`: browse the database

## Google sign-in (optional)

Email sign-in works out of the box. For Google, enable the Google provider in Supabase (Authentication → Sign In / Providers) and set `NEXT_PUBLIC_GOOGLE_LOGIN=1` in `.env.local`.
