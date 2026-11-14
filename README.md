# Mithlesh Kumar — Portfolio Desktop

A responsive portfolio presented as a Windows XP desktop. Visitors start in **My Computer**, use shortcuts to explore the portfolio, and scroll between sections inside one shared window. The desktop uses the supplied Windows XP Bliss wallpaper, XP-style window chrome, fixed desktop icons, a taskbar, and an optional dark palette.

## Features

- **My Computer landing section** with shortcuts and social/contact buttons.
- **About, Projects, Skills, Resume, and Contact** sections in the same readable window.
- Scroll-driven section transitions, persistent navigation, and contained scrolling inside long content such as the resume.
- Responsive layouts for desktop, tablet, and mobile; light and dark XP palettes.
- Owner dashboard at `/admin` for editing profile information, photo, links, resume, skills, and projects.
- Manual project create, edit, and delete. Manual entry remains the dependable project-management path.
- Contact form delivery through EmailJS using a Gmail service.
- PDF.js renders resume pages inside the portfolio window.

## Technology and services

| Technology/service | How this project uses it |
| --- | --- |
| React 19 + TypeScript | Client-side UI and typed content. |
| Vite 7 | Local development server and static production build. |
| Lucide React | Interface and social-link icon components. |
| PDF.js | Renders the resume PDF into readable pages inside the app. |
| GitHub | Hosts the source repository and triggers the connected Cloudflare Pages build when changes are pushed to `main`. The site does not use GitHub authentication or private-repository access. |
| Cloudflare Pages | Builds and serves the static app from the GitHub repository. Build command: `npm run build`; output directory: `dist`. |
| Supabase Auth, Postgres, and Storage | Authenticates the owner dashboard; stores published profile/skills/projects; stores public portfolio assets. Row Level Security (RLS) restricts writes to the configured owner account. |
| EmailJS + Gmail | Sends contact-form messages using an EmailJS Gmail service and template. The form submits to EmailJS's REST API from the visitor's browser. |

This is a static frontend; it has no custom application server. GitHub is used for source hosting and deployment automation, not for live project synchronization. Projects are managed manually in the admin dashboard.

## Run locally

Prerequisites: Node.js 20.19+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The owner dashboard route is `/admin`.

Build the static site with:

```sh
npm run build
npm run preview
```

The deployable files are written to `dist/`.

## Cloudflare Pages deployment

The GitHub repository is connected to Cloudflare Pages. With automatic deployments enabled, a push to the production branch (`main`) starts a build and publishes the new frontend. Dashboard content saves do **not** need a new build; they update Supabase directly.

Set these build-time variables in Cloudflare Pages and in a local `.env` when developing against Supabase:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (the Supabase publishable/anon key)

The values are intentionally not included in this repository or these documents. Vite-prefixed values are bundled into the browser app, so use only the Supabase publishable/anon key here. **Never use a Supabase service-role key, database password, or other server secret in a `VITE_` variable.** `.env` is ignored by Git; `.env.example` contains placeholders only.

Cloudflare Pages serves the static output from `dist/`. `public/_headers` supplies the project's response security headers and Content Security Policy for Cloudflare Pages. Review the deployed response headers after changing hosting providers or adding external services.

## Supabase setup and live editing

The `/admin` dashboard signs in with a Supabase Auth owner account and saves content to Supabase, so updates are available to visitors without rebuilding or restarting the site.

1. Create a Supabase project and create the owner's Auth user from the Supabase dashboard. Disable public sign-ups; do not provide an open registration route for the owner dashboard.
2. Copy the owner Auth user's UUID.
3. In `supabase/schema.sql`, replace every `REPLACE_WITH_ADMIN_USER_UUID` placeholder with that UUID. Run the completed SQL in the Supabase SQL Editor. The SQL creates the content/project tables, RLS policies, and `portfolio-assets` Storage bucket.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` locally and in Cloudflare Pages' build settings. The Supabase URL and publishable/anon key are public client configuration, not admin secrets.
5. Build/deploy once after changing the frontend configuration. Then sign in at `/admin` and edit the site.

### What the admin can edit

- **Profile & photo:** name, role, location, biography, goals, education, interests, and portrait.
- **Links & resume:** email/contact links, LinkedIn, GitHub, website, custom social links with selectable icons, EmailJS settings, and resume URL/upload.
- **Skills:** categories and skill lists.
- **Projects:** create, edit, and delete projects with descriptions, details, status, technologies, GitHub URL, and demo URL.

Uploads accept JPG, PNG, WebP, and PDF up to 5 MB. Uploaded assets are served from the public `portfolio-assets` bucket so the public portfolio can show the profile picture and resume. Do not upload private documents.

### Supabase access model

`src/lib/portfolioBackend.ts` calls Supabase Auth, PostgREST, and Storage REST endpoints directly; the Supabase JavaScript package is not used. Public visitors can read published portfolio content and public assets. The SQL policies restrict content changes and storage writes to the configured owner UUID. RLS is the authorization boundary; hiding the dashboard in the UI is not sufficient. Keep public sign-ups disabled and do not loosen these policies to work around setup problems.

## EmailJS and Gmail contact delivery

EmailJS is the delivery provider for the Contact form. The owner connects a Gmail account to an EmailJS **Email Service** and creates an EmailJS **Template**. EmailJS sends through that connected Gmail account; the recipient is the portfolio email saved in Admin → Links & resume.

In Admin → Links & resume, enter the EmailJS **Service ID**, **Template ID**, and **Public Key**, then save. These settings are part of the public portfolio profile and are sent by the browser to EmailJS. The Public Key is intended for client-side use, but its actual value—and the service/template identifiers—are deliberately not stored in source control or this documentation. Never put an EmailJS private key or Gmail password in the site.

Template field mapping supported by the form:

| EmailJS template field | Value |
| --- | --- |
| To Email | `{{to_email}}` (the email address saved in the portfolio profile) |
| From Name | `{{from_name}}` or `{{name}}` |
| From Email | Keep EmailJS's default sender email selected. |
| Reply To | `{{reply_to}}` or `{{email}}` |
| Subject | `Portfolio contact: {{subject}}` or `Contact Us: {{title}}` |
| Message body | `{{message}}`; you may also include `{{from_email}}` / `{{email}}`. |

The form sends `to_email`, `from_name`, `from_email`, `reply_to`, `subject`, `message`, `name`, `email`, and `title`. The aliases are provided so the default Contact Us template and the recommended mapping both work. Test the template in EmailJS, then submit a test from the live Contact section. EmailJS plan limits and Gmail sending limits can change; check the current provider dashboard. The form includes a honeypot and a small client-side send cooldown; neither replaces provider-side abuse controls.

## Content defaults and assets

For source-controlled defaults, edit `src/data/portfolio.ts`. Changes to defaults require a build/deploy; changes saved through `/admin` publish from Supabase immediately. Replace `public/resume-placeholder.pdf` with the actual resume before launch.

The current wallpaper is `public/windows-xp-bliss.jpg`. `public/win7-hills.svg` is a legacy asset and is not the active wallpaper. The site uses `src/ui/socialIcons.tsx` for selectable link icons.

## Security and privacy

- No actual API keys, passwords, tokens, or environment-variable values belong in README, the handoff, source control, or chat attachments.
- The Supabase anon/publishable key is expected to be visible to browser users; access is limited by RLS. Never publish the service-role key.
- Supabase public reads and public asset downloads are intentional. Only the owner may modify content or upload/delete assets.
- User-editable text renders through React text nodes; do not add raw HTML injection. External portfolio links are validated as HTTPS.
- `public/_headers` configures CSP, `X-Frame-Options`, `X-Content-Type-Options`, Referrer Policy, and Permissions Policy. Its CSP allows the app's Supabase, GitHub API, and EmailJS endpoints. Revisit the allowlist whenever an integration changes.
- Supabase auth tokens are held in browser local storage by the frontend backend helper. Treat them as sensitive; keep scripts and editable content safe from XSS.
- The Start menu's Shut down action attempts to close the current tab. Browsers usually block pages from closing tabs they did not open; the UI then explains the browser's close-tab shortcut.

## More detail

See [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) for the full system map, decisions, data flow, security constraints, and instructions for a future maintainer or AI assistant.
