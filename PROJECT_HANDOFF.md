# Portfolio Project Handoff

This file is the detailed maintainer and AI handoff for Mithlesh Kumar's portfolio. Read this before changing the application. The public GitHub repository is `llllmithulllll/mithlesh-portfolio`, production branch `main`.

> **Secrets rule:** This document intentionally contains no actual keys, IDs, passwords, account email addresses, access tokens, or environment-variable values. Do not add them. `.env.example` is placeholder-only. Never include `.env` in an archive or commit.

## 1. Project purpose and current product

The project is a personal portfolio presented as a responsive Windows XP desktop. The visitor lands in **My Computer**, then explores About Me, Projects, Skills, Resume, and Contact through one shared portfolio window. The wallpaper is the supplied Windows XP Bliss image. Desktop icons remain fixed and reflect the current section. A sidebar remains available in the portfolio window and adapts for small screens. The taskbar includes navigation, theme, clock, and Start controls.

The goal is a playful desktop metaphor that remains easy to read and use. Content should stay visible and usable rather than being made tiny to imitate a literal operating system.

## 2. Current interaction and visual requirements

- Keep My Computer as the landing view and shortcut hub for portfolio sections and social links.
- About Me is a separate scroll section and displays the uploaded portrait, with an initials placeholder if no portrait is available.
- Keep one main window and its sidebar while section content changes. Previous window cards appear behind the active window as a readable visual stack.
- Desktop icons stay in place and only the current section is highlighted. The section status and scroll cue use the Windows XP blue palette.
- Scroll outside the window content changes sections. Scroll inside the content area (including the Resume) must scroll that content and must not trigger a section change. Touch scrolling follows the same rule.
- Keep content readable on desktop and mobile. Respect reduced-motion preferences and preserve keyboard navigation and focus states.
- The Start menu shows the current profile avatar from Admin. Shut down attempts `window.close()`; browsers may block closing a tab that the site did not open, so the app presents a fallback with the browser close shortcut.
- Keep the XP Luna colors and Bliss wallpaper, avoid window tilt, terminal UI, AI branding, and unused Recycle Bin/Experience content.

## 3. Runtime and architecture

- **Frontend:** React 19, TypeScript, Vite 7, Lucide React.
- **PDF rendering:** PDF.js loads the configured resume and draws each page to canvas inside the window. The app does not rely on the browser's embedded PDF viewer.
- **Hosting/build:** Cloudflare Pages serves the static Vite build (`npm run build`, output `dist/`) from the GitHub repository. The repository production branch is `main`; pushes trigger deployment when the Pages Git integration is enabled. Check Cloudflare deployment status if the site does not update.
- **No custom server:** the browser calls Supabase and EmailJS services directly. There is no application server or private backend layer in this repository.
- **Static fallback:** `src/data/portfolio.ts` provides default profile, skills, projects, and resume path so the site can render from the frontend build when live content has not loaded.

## 4. External services and their roles

### GitHub

GitHub hosts the source repository. Cloudflare Pages is connected to the repository to build and deploy frontend commits. GitHub profile/project URLs are visitor-facing links. The project does not currently use GitHub OAuth, private repository access, PATs, write operations, or automatic GitHub-to-portfolio project synchronization. Project CRUD is manual in `/admin`.

### Cloudflare Pages

Cloudflare Pages builds the static frontend from GitHub. Configure build command `npm run build`, output folder `dist`, production branch `main`, and automatic deployments as desired. It needs the two Supabase build variables described below. EmailJS settings are saved in Admin/Supabase profile content; they are not Cloudflare build variables. The static response-header file is `public/_headers`.

A source commit causes a site build/deployment. Profile, link, skill, resume, and project edits saved through the authenticated dashboard update Supabase directly and do not require a frontend deployment.

### Supabase

Supabase provides:

1. **Auth** for the owner-only `/admin` dashboard.
2. **Postgres/PostgREST** for published profile/skills and project records.
3. **Storage** for the profile photo and resume uploads.
4. **RLS** for public read access and owner-only content/asset writes.

The frontend uses a small custom REST/Auth/Storage client in `src/lib/portfolioBackend.ts`; it does not import the Supabase JS SDK. Local and Pages build configuration uses variable names `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These are public browser configuration, not a place for an elevated secret. Never expose a service-role key or database password.

The SQL in `supabase/schema.sql` creates `portfolio_content`, `portfolio_projects`, and the public `portfolio-assets` bucket. Replace every `REPLACE_WITH_ADMIN_USER_UUID` placeholder with the owner's Auth UUID before executing. Public sign-ups should remain disabled; create the owner user from the Supabase dashboard. Policies grant public reads and restrict inserts/updates/deletes to the owner UUID. RLS is the real security boundary.

The public bucket is needed so visitors can load the portrait and resume. It accepts JPG, PNG, WebP, and PDF up to 5 MB. Never upload confidential or private files there.

### EmailJS and Gmail

EmailJS sends the public contact form through the Gmail service connected by the owner. The site POSTs to `https://api.emailjs.com/api/v1.0/email/send` with the configured service, template, public key, and template parameters. The receiving address comes from the profile email saved in Admin. The visitor's address is passed as the reply-to value so the owner can reply to the visitor.

In Admin → Links & resume, the owner saves EmailJS Service ID, Template ID, and Public Key. The configured EmailJS contact template should use:

- **To Email:** `{{to_email}}`
- **From Name:** `{{from_name}}` (the compatible `{{name}}` alias is also supplied)
- **From Email:** EmailJS default sender address
- **Reply To:** `{{reply_to}}` (compatible `{{email}}` alias supplied)
- **Subject:** `{{subject}}` (compatible `{{title}}` alias supplied)
- **Body:** `{{message}}` and optionally sender name/email

`Contact` sends `to_email`, `from_name`, `from_email`, `reply_to`, `subject`, `message`, plus template aliases `name`, `email`, and `title`. Current behavior has a honeypot and client-side one-second throttle; these are basic friction, not server-side rate limiting. Configure available origin restrictions and usage monitoring in EmailJS. Provider free-tier limits can change; check the EmailJS account rather than relying on a number in old screenshots.

The EmailJS public key is intended for browser use, but do not include its actual value in docs, source, or Git. Service and template IDs are also omitted here. No Gmail password or EmailJS private key belongs in the frontend or Supabase profile.

## 5. Content persistence and editing

### Public portfolio defaults

`src/data/portfolio.ts` holds source-controlled default profile data, skills, projects, and the local resume path. If Supabase is unconfigured or has not yet published content, these defaults keep the frontend useful. A code-default change requires a new frontend build/deployment.

### Authenticated dashboard

`src/ui/PortfolioAdmin.tsx` serves `/admin`. It supports:

- Profile, biography, location, education, interests, and goals.
- Photo upload and publishing.
- Standard profile links plus additional social links and selectable icons.
- Resume URL and PDF upload.
- Editable skill categories.
- Manual project create, edit, and delete.
- EmailJS service/template/public-key fields.

Saving content writes through the Supabase REST client and publishes immediately to visitors. An authenticated owner session is required for writes. The public `/` portfolio does not embed owner controls.

Supabase live rows are merged with default projects by ID; deletions are represented in row data. Do not silently describe local browser state or GitHub repo metadata as live publishing.

### Social icons

`src/ui/socialIcons.tsx` maps predefined services (such as LinkedIn, GitHub, WhatsApp, Instagram, YouTube, email, and website) to icons; admin lets the owner choose an available icon for additional links. Custom link URLs are sanitized to HTTPS before public rendering. Mail links use `mailto:`.

## 6. Contact template setup and troubleshooting

1. In EmailJS, connect the owner's sending Gmail account as an Email Service and allow the send permission during Google authorization.
2. Create/select the Contact Us template and set To Email to `{{to_email}}` (or the owner's fixed inbox address if preferred). Keep the From Email default enabled; set Reply To to `{{reply_to}}` or `{{email}}`.
3. Use the template variables above and save. Verify it with EmailJS's own test action.
4. In `/admin` → Links & resume, enter Service ID, Template ID, Public Key, and the portfolio recipient email; save.
5. Submit a test through the live Contact section and confirm delivery. If it fails, check browser-visible form notice, EmailJS test result, template mapping, configured profile email, service authorization, and EmailJS usage limits.

Never paste secrets into a public README or chat. Only enter required EmailJS client configuration through the authenticated admin UI. Avoid confusing the EmailJS Public Key with a private key.

## 7. Project map

| Path | Purpose |
| --- | --- |
| `src/main.tsx` | App entry; routes `/` to `Desktop` and `/admin` to `PortfolioAdmin`; imports styles. |
| `src/ui/Desktop.tsx` | Main desktop, scroll sections, shared window/sidebar, Start menu, contact form, PDF renderer, and visible content. |
| `src/ui/PortfolioAdmin.tsx` | Owner login and live content editor. |
| `src/ui/socialIcons.tsx` | Social icon options and label/URL inference. |
| `src/data/portfolio.ts` | Default profile, skills, and project content. |
| `src/lib/portfolioBackend.ts` | Supabase Auth, REST table reads/writes, token refresh, and Storage upload. |
| `src/style.css`, `src/scroll.css`, `src/desktop-theme.css`, `src/xp-theme.css` | Base layout, desktop/window styling, scroll scenes, and XP styling. |
| `src/shared-navigation.css`, `src/window-stack.css` | Persistent navigation and offset window stack. |
| `src/mobile.css`, `src/admin.css`, `src/admin-social.css`, `src/content-editor.css` | Responsive and admin/editor layouts. |
| `src/xp-polish.css`, `src/dark-mode.css`, `src/taskbar.css`, `src/social-buttons.css`, `src/about-portrait.css` | Wallpaper/XP refinements, dark mode, taskbar, social buttons, and portrait details. |
| `public/windows-xp-bliss.jpg` | Active Windows XP wallpaper. |
| `public/win7-hills.svg` | Legacy hills wallpaper asset; not the active desktop wallpaper. |
| `public/resume-placeholder.pdf` | Placeholder resume; replace through Admin or with real portfolio content before launch. |
| `public/_headers` | Cloudflare Pages response headers and CSP. |
| `supabase/schema.sql` | Supabase schema, RLS policies, owner UUID placeholders, and storage bucket policies. |
| `.env.example` | Placeholder-only local environment template; no credentials. |
| `README.md` | Public project overview and setup instructions. |

## 8. Local development and deployment workflow

Prerequisites: Node.js 20.19+ and npm.

```sh
npm install
npm run dev
npm run build
npm run preview
```

The dev server prints its URL (normally `http://localhost:5173`). Use `/` for the portfolio and `/admin` for the dashboard. `npm run build` runs TypeScript project checks then Vite and writes `dist/`.

Cloudflare Pages deployment configuration:

- Repository: `llllmithulllll/mithlesh-portfolio`
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Build environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Keep `.env`, `.env.*` (except `.env.example`), `node_modules/`, and `dist/` out of Git. `portfolio-handoff.zip` is ignored by Git and is a local handoff artifact. The repo's `.gitignore` excludes synced `sources/` and `AGENTS.md`; those must remain untouched.

## 9. Security and privacy model

- **No actual secrets in version control:** no passwords, Supabase service-role values, EmailJS private keys, access tokens, or environment values in code, docs, or archives. Check staged filenames and diffs before commit. `.env.example` must stay placeholder-only.
- **Supabase browser config:** Supabase URL and anon/publishable key are compiled into the app. They are public by design. RLS and the owner UUID must secure writes. A service-role key must never be used client-side.
- **Owner access:** disable public sign-ups, provision the owner account in Supabase, and verify the RLS UUID in every table and storage write policy. Never remove RLS to make the dashboard work.
- **Public content:** portfolio data and assets are intentionally readable by visitors. Public profile content includes contact addresses and EmailJS public configuration fields. Do not save private data there.
- **Sessions:** the custom client stores Supabase Auth tokens in browser localStorage and refreshes them as needed. Avoid XSS and untrusted script additions.
- **Input/output:** editable content is rendered as React text, not raw HTML. URL validation requires HTTPS for public web links; links opening another tab use `noopener noreferrer`. File uploads are MIME/size constrained in the client and storage bucket.
- **Contact abuse:** a honeypot and a short client-side delay are present. They are not a secure server-side rate limiter. Use EmailJS origin restrictions and monitor usage.
- **Headers:** `public/_headers` sets CSP, frame denial, `nosniff`, Referrer Policy, and Permissions Policy. CSP permits the app's own assets plus Supabase, GitHub API, and EmailJS connections. Revisit when adding fonts, APIs, analytics, or embeds; inspect the headers actually served in production.
- **Dependency check:** Vite was upgraded from 7.1.7 to 7.3.8 to address an advisory affecting exposed Vite dev servers. The production build was confirmed after the upgrade. `npm audit` may be unable to reach the npm advisory endpoint in restricted network environments.

## 10. Known limitations and maintenance notes

- This repository is a static frontend; Supabase and EmailJS are separate hosted services and require their own account configuration.
- The `/admin` interface depends on correct Supabase Auth, schema, environment settings, and RLS. If Supabase is unavailable, the public app can fall back to source defaults, but live publishing will not work.
- EmailJS must have a valid connected mail service and matching template. The Contact form is not sent by Cloudflare or Supabase.
- Project CRUD is manual. There is no automated GitHub sync/import, no private GitHub access, and no app-server integration.
- The live `/admin` path is not a substitute for the `/admin` route being private: its writes are protected by Supabase Auth and RLS. Verify policies against the owner's actual UUID.
- The resume placeholder must be replaced if the real resume is to be shown.
- Browsers may refuse the Start menu's `window.close()` request; the fallback asks the visitor to close the tab manually.

## 11. Instructions for future contributors and AI assistants

1. Read this handoff and `README.md`; then inspect the relevant source and SQL before editing.
2. Preserve the XP desktop, Bliss wallpaper, My Computer landing page, one shared readable window, fixed icons, responsive layout, and contained inner scrolling unless the owner requests a change.
3. Distinguish source-default edits/deployments from `/admin` live content saves. Do not imply a Supabase save needs a code redeployment.
4. Do not add or publish keys, tokens, emails, passwords, or environment values. Do not modify files under `sources/`.
5. Do not weaken Supabase RLS or add client-side privileged secrets. Keep the manual project workflow reliable.
6. Build with `npm run build` when validating code changes; do not add tests unless requested.
7. Review `git status`, staged files, and staged diffs before pushing. Keep `.env`, the handoff ZIP, build output, and dependencies out of commits.
