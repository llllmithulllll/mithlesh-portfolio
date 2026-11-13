# Portfolio Project Handoff

This document is a self-contained briefing for a new AI assistant working on this portfolio. Read it first, then inspect the source files before changing behavior. The canonical project is the GitHub repository [`llllmithulllll/mithlesh-portfolio`](https://github.com/llllmithulllll/mithlesh-portfolio), branch `main`.

## 1. What this project is

A personal portfolio for Mithlesh Kumar, styled as a Windows XP desktop with a Windows 7 green-hills wallpaper. It is a single-window portfolio: scrolling moves through portfolio sections inside the window, while desktop icons stay fixed and indicate the currently active section. The app has a static-content mode that works without a backend and an optional authenticated Supabase dashboard for publishing edits to all visitors.

The project is a client-rendered web app built with React 19, TypeScript, Vite 7, and Lucide icons. It does not have a custom application server. The browser loads the site; Vite builds static files into `dist/`.

## 2. Product requirements gathered in this conversation

The design and feature requests were refined over time. The current direction is:

- Keep the desktop-era visual style: XP/Luna window chrome and colors, familiar desktop icons, and the green hills wallpaper associated with Windows 7.
- Keep one main portfolio window on screen. Scrolling transitions the window contents through sections such as Home/About, Projects, Skills, Resume, and Contact, using smooth close/open-inspired motion.
- Keep the desktop icons fixed while scrolling. Highlight only the icon for the section currently in view. The active section label/status must remain readable.
- Restore the earlier, preferred landing/home presentation. It introduces Mithlesh and includes direct links into key sections.
- Remove the terminal and AI logo/branding. The user wanted a tidy but detailed portfolio rather than a busy interface.
- Make profile, picture, projects, skills, resume, and social links maintainable without editing application controls or taking down the site.
- Support manual project entry as a reliable fallback and optionally import public GitHub repository metadata.
- Include LinkedIn and other social links, plus clear editing and publishing guidance.
- Check security, especially the owner-editing experience. Visitors must not receive owner-only live editing privileges.

When making a future visual change, preserve the single-window/desktop metaphor and these interaction requirements unless Mithlesh explicitly changes direction.

## 3. Important distinction: there are two editing experiences

### Browser-local editor on the portfolio

The desktop Start menu includes **Edit Portfolio**. It edits the current browser's `localStorage`; its export/import controls save and restore a JSON backup. The Projects section also offers manual project entry and a public GitHub repository metadata import. These changes are local to that browser and are not automatically published to other visitors. Clearing browser data can remove them unless backed up.

This local editor is useful for previewing and experimenting, but it is not a private publishing dashboard. Any visitor can open their own browser's copy and change their own local view; those edits do not change the hosted site.

### Authenticated live dashboard at `/admin`

`src/ui/PortfolioAdmin.tsx` serves the separate owner dashboard at `/admin`. With Supabase configured, it supports sign-in and editing profile/about information, profile picture, links, resume, skill groups, and projects. Saves write to Supabase and become visible to all visitors without rebuilding the front end. Live editing controls are not embedded in the public portfolio view.

This dashboard is optional and is **not connected until the Supabase setup is completed**. If Supabase is not configured, the admin login is disabled and the portfolio uses its source defaults. Do not represent the local browser editor as live publishing.

### GitHub project import

The portfolio's GitHub tool uses the unauthenticated public GitHub API for a username. It can import metadata for public, non-fork, non-archived repositories and is subject to GitHub API rate limits. It does not authenticate to GitHub, access private repositories, write to repositories, or keep projects in sync after import. Imported entries are saved in the browser-local editor unless separately entered and published through `/admin`.

## 4. Requirements and architecture decisions

- **Static-first:** the site should remain viewable from the checked-in defaults in `src/data/portfolio.ts`, even when no Supabase project exists. This avoids making the portfolio depend on an admin backend just to render.
- **Supabase for live editing:** an authenticated browser dashboard is the current route to live edits without redeploying. PostgreSQL Row Level Security (RLS) is the actual access boundary; hiding controls in the UI alone would not protect writes.
- **Manual projects first:** manual input ensures the projects section remains usable if the GitHub API is unavailable, rate-limited, or not desired.
- **No server secrets in the browser:** the client uses only the Supabase publishable/anon key. Never add a Supabase service-role key, GitHub personal access token, passwords, or other secrets to Vite variables beginning with `VITE_`.
- **Text, not raw HTML:** user-supplied portfolio content should continue to render as React text. Do not add `dangerouslySetInnerHTML` for editable content.
- **External links:** normalize and validate web links as HTTPS and keep `rel="noopener noreferrer"` on links opened in another tab.
- **Progressive motion:** preserve smooth transitions but honor reduced-motion preferences and avoid making scrolling or section navigation hard to use.

## 5. Project map

| Path | Purpose |
| --- | --- |
| `src/main.tsx` | Entry point. Renders `Desktop` on `/` and `PortfolioAdmin` on `/admin`. |
| `src/ui/Desktop.tsx` | Desktop, sticky icons/navigation, portfolio window, sections, local editor, project browser, and GitHub public-repository import. |
| `src/ui/PortfolioAdmin.tsx` | Separate authenticated live content dashboard. |
| `src/data/portfolio.ts` | Default profile, skills, and sample projects used in static mode. |
| `src/lib/portfolioBackend.ts` | Supabase REST/Auth/storage client, session refresh, published content/project operations, and asset upload. |
| `src/*.css` | Base styles, desktop/window visuals, scroll transitions, XP theme, taskbar, admin, and editor styling. |
| `public/win7-hills.svg` | Green-hills desktop wallpaper asset. |
| `public/resume-placeholder.pdf` | Placeholder resume; replace with the real resume before public launch. |
| `public/_headers` | Netlify-style response security headers and CSP. Other hosts need equivalent header configuration. |
| `public/_redirects` | SPA fallback rewrite for static hosts that support this convention. |
| `public/robots.txt`, `public/sitemap.xml` | Search-engine metadata; update the sitemap URL when the final domain is known. |
| `supabase/schema.sql` | Tables, public-read/owner-write RLS policies, and asset bucket policies. Replace the admin UUID placeholder before executing. |
| `README.md` | Short installation, Supabase setup, editing, and security notes. |
| `.env.example` | Placeholder-only environment-variable template. Copy to `.env` locally; `.env` is ignored by Git. |

## 6. Local setup and commands

Prerequisite: Node.js 20.19 or later and npm.

```sh
npm install
npm run dev
```

Vite prints the local URL (usually `http://localhost:5173`). Open `/` for the portfolio or `/admin` for the owner dashboard. Static production output is created with:

```sh
npm run build
npm run preview
```

Do not commit `node_modules/`, `dist/`, `.env`, or `.env.*` (except the deliberately safe `.env.example`). The repository `.gitignore` also excludes synced `sources/`, local workspace `AGENTS.md`, and TypeScript build metadata.

## 7. Editing content and publishing

### Source-controlled, static edits

Edit `src/data/portfolio.ts` to update the default profile, sample projects, skills, links, and resume path. Replace `public/resume-placeholder.pdf` with the actual resume. Build and redeploy so the new defaults reach visitors. Keep project links real and HTTPS; update the placeholder sample details before presenting them as completed work.

### Browser-local edits

Use **Start → Edit Portfolio** and the Projects tools. These edits are saved only in the current browser. Use **Export settings backup** before clearing browser storage or changing devices. Importing that JSON restores the local settings in the current browser.

### Live `/admin` editing setup

1. Create a Supabase project and create the owner's Auth user from the Supabase dashboard. Keep public sign-ups disabled; do not expose an unrestricted account-creation path.
2. Copy the owner's Supabase Auth user UUID.
3. In `supabase/schema.sql`, replace **every** `REPLACE_WITH_ADMIN_USER_UUID` value with that UUID. Run the resulting SQL in Supabase SQL Editor. Check the resulting policies and the Storage policies in the Supabase dashboard.
4. Copy `.env.example` to `.env` for local development. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the project URL and publishable/anon key. The browser key is public by design; database/storage policies must enforce authorization.
5. Configure the same two variables in the hosting provider's build environment, then build and deploy once. These build-time variables are compiled into the static front end. After deployment, `/admin` can save content to Supabase without another deployment.
6. Sign in at `/admin`. Uploads accept JPG, PNG, WebP, and PDF up to 5 MB. The bucket is public for visitor-readable portfolio assets; owner-only write policies are essential.

For a GitHub-only/local static workflow, update source defaults and redeploy. Do not store actual content credentials in the repository.

## 8. Security and privacy notes

This is a source-level handoff, not a formal penetration test or independent security audit.

- The GitHub repository is public. It contains source code and `.env.example` placeholders, not `.env` or project credentials. Recheck before adding files or committing changes.
- Supabase anon/publishable keys are designed to be exposed to browser clients. They are safe only when RLS is enabled and correct. The SQL policies intentionally allow public reads and only allow writes/deletes when `auth.uid()` matches the configured owner UUID.
- Keep public sign-ups disabled and create only the intended owner account. Verify that all write policies and storage upload/update/delete policies use the same real owner UUID. A placeholder UUID or misconfigured policy means the dashboard will not work correctly; an overly broad policy can expose edits.
- The dashboard session is stored in browser `localStorage` and refreshed by the client. Treat this as an XSS-sensitive browser session. Keep all user-controlled content rendered as text, validate URLs and uploaded MIME/size, avoid third-party scripts, and do not add unsafe HTML rendering.
- `public/_headers` applies CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and frame restrictions only on hosts that honor the Netlify `_headers` file. Verify equivalent production response headers on the actual host; the file alone does not guarantee headers on every static host.
- The CSP allows inline styles for the app's current style approach and allows connections/images to Supabase and the public GitHub API. Review/adjust it if adding analytics, fonts, APIs, embeds, or hosting domains.
- The Supabase asset bucket is intentionally public for the portfolio's images and resume. Never upload private files there. Owner-only upload/update/delete relies on the Storage RLS policies in `supabase/schema.sql`.
- The contact section currently presents links, but there is no functioning message-delivery backend. The README notes the contact form validates locally but does not send messages. Do not claim it delivers email until a trusted provider or backend is integrated.
- The current resume file is a placeholder. Replace it before public launch, and make sure any personal/contact details in the public profile are intentionally published.
- The static-host SPA rewrite and security headers are provider-specific. Verify the selected host supports `_redirects` and `_headers`, or port those rules to its configuration.

## 9. Current boundaries and follow-up work

- No automatic GitHub-to-live-portfolio sync or authenticated GitHub integration exists. Current GitHub import is one-time public metadata import into local browser state.
- The two editing systems are intentionally separate in the current implementation. If simplification is requested, decide whether to keep browser-local export/import, the authenticated Supabase dashboard, or both; label their persistence scope clearly.
- Profile defaults have blank email/GitHub/LinkedIn/website fields, and the resume points to the placeholder PDF. These should be filled by the owner before launch.
- Check the active icon/window section behavior with keyboard navigation, direct clicks, and scroll at different viewport sizes if changing the section observer or animation code.
- Revisit the contact form, deployment-domain sitemap, production headers, and Supabase settings before treating the site as production-ready.
- Keep the Windows XP palette, green hills wallpaper, single-window scroll sequence, fixed desktop icons, and sparse layout cohesive when editing CSS.

## 10. Guidance for the next AI assistant

1. Read this file and `README.md`, then inspect the relevant TypeScript/CSS/SQL before coding.
2. Preserve user-provided visual and functional requirements above. Ask only for genuinely missing details; do not replace the requested design based on personal preference.
3. Be explicit whether a requested edit is browser-local or live for every visitor. Do not imply that localStorage edits are published.
4. Never add secrets to source, the public repository, or Vite `VITE_*` variables. Do not weaken Supabase RLS to make the UI work.
5. For deployment or new integration work, make the implementation reviewable and state which host/provider settings must be configured. Check actual host headers and database policies rather than assuming config files are applied.
6. Keep source changes focused. Do not modify synced reference files under `sources/` in the ChatGPT project workspace.

