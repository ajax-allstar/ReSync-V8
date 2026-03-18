# ReSync V8

ReSync V8 is a browser-first study planning app built with plain HTML, CSS, and JavaScript.

It uses:
- Supabase Auth for email/password sign in
- Supabase Postgres for app data
- Vercel routing for the app shell and the `/api/chat` serverless function
- CDN-hosted UI/runtime libraries in the browser

There is no Django runtime in this workspace.

## Project Structure

- `index.html`: app shell and script/style bootstrapping
- `static/css/styles.css`: theme tokens, layout helpers, and motion styles
- `static/js/app.js`: main client app entry
- `static/js/modules/`: shared browser modules
- `static/js/supabase-config.example.js`: local config template
- `static/js/supabase-config.js`: local project-specific Supabase config
- `static/service-worker.js`: optional offline shell cache
- `static/app.webmanifest`: install metadata
- `api/chat.js`: Vercel serverless proxy for chat completions
- `supabase/migrations/20260312154745_initial_schema.sql`: canonical schema migration
- `supabase-schema.sql`: schema copy for manual SQL editor runs
- `vercel.json`: Vercel route handling

## Features Included

- Email/password sign up and sign in
- Dashboard summary
- Subject management
- Study plans
- Study sessions
- Timetable blocks with overlap checks
- Mood tracking
- Profile settings
- Local focus timer with `localStorage`
- AI chat and AI timetable generation through `/api/chat`

## Supabase Setup

1. Create a new Supabase project.
2. Open the SQL Editor.
3. Run `supabase-schema.sql` or the migration file in `supabase/migrations/`.
4. Copy `static/js/supabase-config.example.js` to `static/js/supabase-config.js`.
5. Fill in your project URL and anon key.

```js
window.RESYNC_SUPABASE_CONFIG = {
    url: "https://YOUR_PROJECT.supabase.co",
    anonKey: "YOUR_SUPABASE_ANON_KEY",
};
```

## Supabase Auth Settings

Use email/password auth only.

Recommended settings:
- Enable the `Email` provider
- Disable unused social providers
- Set your site URL to your deployed frontend origin
- Add redirect URLs for local preview and deployment targets

Local preview origin:
- `http://127.0.0.1:4173`

## Local Preview

```bash
cd /home/ajax-shinto/ReSync-V8
npm start
```

Then open `http://127.0.0.1:4173`.

## Deploy

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Deploy it as a project that serves the frontend plus the `/api/chat` function.

`vercel.json` keeps the SPA fallback while still preserving `/static/*` and `/api/*` routes.

## Notes

- `static/js/supabase-config.js` and `.env.local` are local environment files and should stay out of version control.
- `.vercel/` is local Vercel metadata and should stay untracked.
- The app currently depends on CDN-hosted browser libraries; that is intentional in this repo version.
