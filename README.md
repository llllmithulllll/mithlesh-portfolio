# Mithlesh Kumar · Portfolio Desktop

Windows XP Luna inspired interactive portfolio built with React, TypeScript, Vite, and Lucide icons. It keeps one window on screen and switches its contents as visitors scroll through the green hills desktop. My Computer is the landing view and provides shortcuts to the portfolio sections; About Me follows as the next scroll window. A persistent section sidebar stays visible across windows, with a compact horizontal version on small screens.

## Run locally

1. Install Node.js 20.19+.
2. Run `npm install`.
3. Run `npm run dev`.
4. Run `npm run build` to create the deployable `dist/` folder.

## Live editing dashboard

The owner dashboard is served at `/admin`. Once configured, sign in there to edit your profile, picture, education, links, skills, resume, and projects. Saves are written to Supabase and appear on the public site without rebuilding or restarting it. The public portfolio does not show the owner editing controls.

### One-time setup

1. Create a Supabase project and an Auth user for yourself. Turn off public sign-ups in Supabase Auth; create the owner account from the Supabase dashboard.
2. Copy that Auth user's UUID. In `supabase/schema.sql`, replace every `REPLACE_WITH_ADMIN_USER_UUID` with your UUID, then run the SQL in Supabase SQL Editor. This creates the tables, public read policies, owner-only write policies, and a public asset bucket with owner-only uploads.
3. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project API settings. The publishable/anon key is expected to be present in a browser app; never put a service-role key in this project.
4. Add those same two environment variables to your hosting provider's build settings, then deploy this version once. After that, dashboard saves update the database and live content directly.

To try the dashboard locally, start Vite and open `http://localhost:5173/admin`. Project and profile updates are stored online. Uploads support JPG, PNG, WebP, and PDF files up to 5 MB.

This site uses Supabase Auth and Postgres Row Level Security to allow public reads while restricting writes to the configured owner UUID. Keep public sign-ups disabled and do not weaken the database policies. Supabase describes the `auth.uid()` policy pattern in its [Row Level Security documentation](https://supabase.com/docs/guides/database/postgres/row-level-security). Public bucket reads are intentional for portfolio images and resume files; upload, update, and delete remain owner-only.

### Source defaults

For source-controlled updates, edit `src/data/portfolio.ts` directly:

- Add projects to `projects`. Each item can include an overview, technologies, status, and real `github` / `demo` HTTPS URLs.
- Update skills in `skills`.
- Update your biography, education, email, GitHub, and LinkedIn in `profile`.
- Unsupported or non-HTTPS project and social URLs are not rendered as links.

The dashboard currently supports manual project management. GitHub public repository sync remains a possible future addition.

Replace `public/resume-placeholder.pdf` with your actual PDF. Update the sitemap URL in `public/sitemap.xml` when you know the deployed domain.

## Security notes

- User controlled content is rendered as text; the app does not use raw HTML injection.
- External portfolio links require HTTPS and open with `noopener noreferrer`.
- `public/_headers` sets a restrictive Content Security Policy and common browser security headers for hosts that support the Netlify `_headers` convention. Configure equivalent response headers on other hosting providers.
- Dashboard saves require a configured Supabase project. No Supabase service-role secret is used in the browser.
- The contact form validates locally but does not send anything. Connect a trusted form provider before enabling delivery.
