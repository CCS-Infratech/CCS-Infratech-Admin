# CCS Infratech Admin

Internal dashboard for managing CCS Infratech content — blogs, projects, project groups, events, press, site settings, leadership, and leads.

**Repository:** [github.com/CCS-Infratech/CCS-Infratech-Admin](https://github.com/CCS-Infratech/CCS-Infratech-Admin)

Related apps:

- API — [CCS-Infratech-Backend](https://github.com/CCS-Infratech/CCS-Infratech-Backend)
- Public site — [CCS-Infratech-Frontend](https://github.com/CCS-Infratech/CCS-Infratech-Frontend)

---

## What it includes

- Email / password login against the backend JWT API
- Cookie-guarded dashboard routes (`authToken`)
- Dashboard hub that jumps into each CMS section
- Blogs — list, create, edit, rich text (Tiptap)
- Projects — listing plus a multi-step create/edit form (overview, specs, amenities, plans, gallery)
- Project groups — collections that the public site uses
- Events & Campaigns (gallery CMS) and press coverage
- Website settings (contact, offices, social, branding)
- Leadership / partner profiles shown on the public About page
- Lead inbox — filter, update status, delete enquiries
- S3 image picker / upload
- Data tables, forms, and a sidebar layout
- Next.js 16 App Router, Tailwind CSS v4, shadcn/ui, Zustand, Zod, React Hook Form

---

## Architecture

```
Browser  ─►  Next.js Admin (:3002)
                │
                ├─ proxy.ts   checks authToken cookie
                │     /auth/sign-in  ↔  /dashboard/*
                │
                └─ Axios (credentials)  ─►  Backend /api/v1
                                              ├─ /auth/login, /auth/logout
                                              ├─ /blog, /projects, /project-groups
                                              ├─ /gallary, /press
                                              ├─ /settings, /leadership, /leads
                                              └─ /images  (S3)
```

```
src/
├── app/
│   ├── auth/sign-in/         # Login
│   └── dashboard/            # Protected CMS pages
│       ├── blog/
│       ├── projects/
│       ├── project-groups/
│       ├── gallary/          # Events & Campaigns
│       ├── press-coverage/
│       ├── settings/
│       ├── leadership/
│       ├── leads/
│       └── profile/
├── features/                 # Feature modules (forms, tables, views)
├── http/                     # Axios instance + API clients
├── components/               # Shared UI and layout
├── context/authContext.tsx   # Session state
└── proxy.ts                  # Auth redirect for dashboard routes
```

The dashboard runs on port **3002** so it can sit next to the public site on `3000`. On 401 the Axios client logs out and sends the user back to `/auth/sign-in`.

---

## How to run

**Requirements:** Node.js 20+, bun or pnpm, and a running [backend](https://github.com/CCS-Infratech/CCS-Infratech-Backend) with an admin user (`npm run prisma:seed` on the API).

```bash
git clone https://github.com/CCS-Infratech/CCS-Infratech-Admin.git
cd CCS-Infratech-Admin
bun install
# or: pnpm install
```

Create a `.env` (or `.env.local`) in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
bun run dev
# or: pnpm dev
```

Open [http://localhost:3002](http://localhost:3002). You will be redirected to `/auth/sign-in`.

Sign in with the admin account created by the backend seed. After login the app stores `authToken` and opens the dashboard hub. The root `/` route redirects to `/dashboard/blog`.

### Production

```bash
bun run build
bun run start
```

Set `NEXT_PUBLIC_API_URL` to the deployed API (`https://api.ccsinfratech.com`). The backend CORS list already includes `https://admin.ccsinfratech.com`.

---

## Dashboard routes

| Path | Purpose |
| --- | --- |
| `/auth/sign-in` | Admin login |
| `/dashboard` | CMS hub |
| `/dashboard/blog` | Blog list / editor |
| `/dashboard/projects` | Project list / editor |
| `/dashboard/project-groups` | Collections |
| `/dashboard/gallary` | Events & Campaigns |
| `/dashboard/press-coverage` | Press items |
| `/dashboard/settings` | Public website contact / branding |
| `/dashboard/leadership` | Leadership / partner profiles |
| `/dashboard/leads` | Enquiry inbox |
| `/dashboard/profile` | Profile |

---

CCS Infratech
