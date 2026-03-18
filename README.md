# ReSync V8

ReSync V8 is a Vite + React + TypeScript frontend for a student productivity and wellness dashboard.

It includes:
- A React single-page app rendered from `src/`
- Tailwind CSS v4 styling
- Supabase schema and migration files in `supabase/`
- A Vercel serverless function in `api/chat.js`

## Project Structure

- `index.html`: Vite app shell
- `src/main.tsx`: React entrypoint
- `src/App.tsx`: main dashboard screen
- `src/components/`: reusable UI pieces
- `src/data/`: dashboard seed data
- `src/styles.css`: global styles and theme tokens
- `api/chat.js`: Vercel serverless proxy for chat completions
- `supabase/migrations/20260312154745_initial_schema.sql`: canonical schema migration
- `supabase-schema.sql`: schema copy for manual SQL editor runs
- `vercel.json`: Vercel route handling

## Local Run

1. Install dependencies:

```bash
npm install
```

2. Start the Vite dev server:

```bash
npm start
```

3. Open:

```text
http://127.0.0.1:4173
```

Do not open the project with Live Server on `127.0.0.1:5500`. That serves the raw `index.html`, but this app needs Vite to compile `src/main.tsx` and the React code before the browser can run it.

## Production Build

Create the production bundle with:

```bash
npm run build
```

Preview the built app locally with:

```bash
npm run preview
```

## Supabase Setup

1. Create a new Supabase project.
2. Open the SQL Editor.
3. Run `supabase-schema.sql` or the migration file in `supabase/migrations/`.

## Deploy

### Vercel

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Deploy it as a project that serves the frontend and the `/api/chat` function.

### Static hosting

If you want to host only the frontend on a static service, upload the contents of `dist/` after running `npm run build`.
