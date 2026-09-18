# Software Requirements Specification (SRS) for Mentra - Education Management System

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) documents the comprehensive requirements for "Mentra," an Education Management System. It outlines the architectural design, functional capabilities, user roles, database schema, and operational environment needed to operate the system.

### 1.2 Intended Audience
This document is intended for software developers, project managers, QA testers, and educational institution administrators who will interact with, maintain, or deploy the Mentra platform.

### 1.3 Project Scope
Mentra is a full-stack web application designed to facilitate end-to-end education management by integrating the workflows of Admins, Teachers, Mentors, Students, and Parents into a single cohesive platform. The system tracks academic marks, attendance, mentorship meetings, continuous feedback, and parental communication.

---

## 2. Overall Description

### 2.1 Product Perspective
Mentra is architected as a unified, full-stack Next.js application backed directly by PostgreSQL, replacing the previous separate Express/REST backend with a feature-based, server-first architecture:

- **Application Layer (Frontend + Backend):** Next.js 16.x (App Router) with TypeScript 6.x. UI is rendered via React Server Components, with Route Handlers and Server Actions serving as the API layer (no standalone Express server is required).
- **UI Component Library:** shadcn/ui (built on Radix UI primitives + Tailwind CSS), providing accessible, composable, source-owned components (Button, Card, Table, Dialog, Dropdown, Form, Sidebar, etc.) that are copied into the codebase under `components/ui/` rather than installed as an opaque npm dependency, allowing full styling control per role dashboard.
- **Theming:** Built-in **light and dark mode** support via `next-themes`, using shadcn's CSS-variable-based theme tokens (`--background`, `--foreground`, `--primary`, etc.) defined for both `:root` (light) and `.dark` (dark) scopes. A theme toggle is available in the shell/header of every role dashboard, and the user's preference persists across sessions.
- **Styling:** Tailwind CSS 4.x (CSS-first configuration via `@theme`, no separate `tailwind.config.js` required), extended with shadcn/ui's design tokens.
- **Authentication:** NextAuth.js (Auth.js v5) using the Credentials provider, with a JWT-based session persisted in an httpOnly cookie for **4 days** before requiring re-login (see Section 3.1).
- **Data Layer (Database):** PostgreSQL is the sole database engine for every environment. During development, a local PostgreSQL instance is administered and inspected via **pgAdmin4**; in staging/production, PostgreSQL runs on whatever host/provider the team selects at deployment time (e.g., a self-managed instance or any standard managed-PostgreSQL provider) — no environment depends on a proprietary backend-as-a-service.
- **ORM / Data Access:** **Prisma ORM** (`@prisma/client` + `prisma`) is the single data access layer for all typed queries and mutations (profiles, marks, attendance, meetings, notifications, file metadata, etc.), connecting to whichever PostgreSQL instance is active for the current environment via `DATABASE_URL`/`DIRECT_URL`. The schema is defined once in `prisma/schema.prisma`, which is the single source of truth for models and relations, and `prisma generate` produces fully typed Prisma Client bindings consumed across Server Actions and Route Handlers. NextAuth's Credentials provider validates login attempts by querying the `users`/`profiles` tables through Prisma Client.
- **File Storage:** Handled entirely by the existing Next.js/Node stack rather than a third-party storage service — uploaded files (profile photos, meeting attachments) are received by Route Handlers/Server Actions and written to a server-side filesystem directory (e.g., `/storage/uploads`, or a mounted volume in production), while file metadata (owner, path, MIME type, size) is tracked in Postgres via Prisma. This keeps storage swappable later (e.g., to an object store) without changing the application's data-access patterns.
- **Live/Durable Notifications:** Implemented with the existing stack rather than a managed realtime service — a lightweight polling `useNotifications` hook on the client re-fetches a Route Handler (backed by Prisma) on a short interval (e.g., every 20–30s) to surface new, unread rows from the `notifications` table. This is sufficient for Mentra's near-real-time needs (dashboard alerts, not chat) and can be upgraded later to Server-Sent Events/WebSockets if truly instantaneous delivery becomes a requirement.
- **Email / Transactional Messaging:** **Nodemailer** is used server-side (within Server Actions/Route Handlers) to send transactional emails — password reset links, first-login credential notices, meeting invitations, and parent/teacher feedback alerts — via an SMTP transport configured per environment (e.g., a provider such as Gmail SMTP, SendGrid SMTP, or Amazon SES SMTP in production, and a local Mailhog/Ethereal transport in development).
- **In-App Notifications (UI Feedback):** Toast-style, ephemeral UI notifications (success/error/info banners for actions like saving marks, scheduling a meeting, or sending an email) are rendered via **`sonner`** (shadcn/ui's recommended toast library), mounted once via a `<Toaster />` provider in the root layout and triggered from Server Actions/client components with `toast.success()` / `toast.error()`. This is distinct from the persisted, database-backed `notifications` feature (Section 3.6, FR-PAR-3), which uses the polling mechanism described above for durable, historical alerts.

### 2.2 User Classes and Characteristics
The system identifies five distinct user roles. Each role has its **own dedicated login route and login form** (`/admin/login`, `/teacher/login`, `/mentor/login`, `/student/login`, `/parent/login`) rather than a single shared login page, and each is authenticated via NextAuth (Credentials provider) and authorized via application-level RBAC in addition to database-level checks:
1. **Admin:** Supreme authority; manages all system entities, users, and overall analytics.
2. **Teacher:** Academic staff responsible for marking attendance, grading, and recording class-specific feedback.
3. **Mentor:** Assigned to specific students (mentees); handles career/academic guidance, remarks, and scheduling meetings.
4. **Student:** The core user; consumes their academic performance data, receives feedback, and tracks their own attendance.
5. **Parent:** Connected to a specific student; monitors their ward's marks, attendance, and communicates with faculty.

### 2.3 Operating Environment
- **Framework:** Next.js 16.x (App Router, Turbopack) running on Node.js (v20 LTS+ recommended).
- **Language:** TypeScript 6.x across the entire codebase (frontend, server actions, route handlers, and shared types).
- **Styling & UI:** Tailwind CSS 4.x with PostCSS, plus shadcn/ui components and `next-themes` for light/dark mode.
- **Authentication:** NextAuth.js (Auth.js v5), JWT session strategy, 4-day (`maxAge: 60 * 60 * 24 * 4`) rolling session before re-authentication is required.
- **Database (Local Development):** A standalone local PostgreSQL instance (v15+), installed directly or run as a Docker Postgres container, administered and inspected using **pgAdmin4**.
- **Database (Staging/Production):** PostgreSQL (v15+) on whichever host is chosen at deployment time (self-managed VM/container, or any managed-PostgreSQL provider); the application only requires a standard `DATABASE_URL`/`DIRECT_URL` connection string and has no dependency on a specific provider.
- **File Storage:** A server-side filesystem directory (local disk in development, a mounted volume in production) written to and read from by Route Handlers/Server Actions; file metadata is stored in Postgres via Prisma.
- **ORM:** Prisma (`prisma`, `@prisma/client`) targeting the `postgresql` provider; `prisma migrate dev` is used locally and `prisma migrate deploy` is used in CI/CD to apply schema changes.
- **Email Delivery:** Nodemailer (`nodemailer`) with an SMTP transport; credentials (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`) are supplied per environment via environment variables.
- **UI Toast Notifications:** `sonner` for transient, client-rendered success/error/info toasts across all role dashboards.
- **Client:** Modern web browser (Chrome, Firefox, Safari, Edge) supporting JavaScript and HTML5.
- **Ports (local dev):** Next.js app on `3000`; local PostgreSQL on `5432`; pgAdmin4 typically on `5050`; local SMTP testing via Mailhog/Ethereal (typically `1025`/web UI `8025`).
- **Environments:** `.env.local` (local, pointing to the local Postgres `DATABASE_URL` for Prisma, a local uploads directory, and local SMTP settings), `.env.staging`, and `.env.production` (pointing to the staging/production `DATABASE_URL`/`DIRECT_URL`, production uploads path, and production SMTP credentials), all consumed via typed environment variable validation.

---

## 3. System Features & Functional Requirements

### 3.1 Authentication & Security (Common to All)
- **FR-AUTH-1 (Per-Role Login Routes):** Each user role shall have its own dedicated login page — `/admin/login`, `/teacher/login`, `/mentor/login`, `/student/login`, and `/parent/login` — each rendering a role-scoped `LoginForm` from the `auth` feature module. There is no single shared/generic login page.
- **FR-AUTH-2 (Credential Authentication):** The system shall require users to authenticate using an email and password. Submission is handled by NextAuth's `signIn("credentials", ...)` call, whose `authorize()` callback validates the credentials against the `users`/`profiles` table (via a server-side Prisma Client query) and verifies the bcrypt password hash.
- **FR-AUTH-3 (Role-Locked Login):** Each login route shall pass its expected role to the `authorize()` callback. A login attempt shall be rejected with an "invalid credentials" error if the authenticated user's stored `role` does not match the role expected by the route they logged in from (e.g., a Teacher account cannot sign in via `/admin/login`), even if the email/password pair is otherwise valid.
- **FR-AUTH-4 (Persistent Session):** The system shall use NextAuth's JWT session strategy with a session lifetime of **4 days** (`maxAge` = 4 days) from the moment of login. Users shall remain authenticated and shall not be prompted to re-enter credentials for any request within that 4-day window; the session is renewed (rolling expiry) on activity via NextAuth's `updateAge` setting.
- **FR-AUTH-5 (RBAC Enforcement):** The system shall enforce role-based access control (RBAC) at two layers: (a) Next.js middleware that reads the NextAuth JWT's `role` claim and redirects/blocks access to role-specific routes (e.g., a Student cannot navigate to `/admin/*`), and (b) server-side authorization checks in every Server Action/query that re-verify the caller's role and ownership before touching the database, preventing cross-role data access.
- **FR-AUTH-6 (Password Change):** Users shall have the ability to change their initial password via a Server Action that re-hashes and updates the password column. For first-time logins, users must change their password if the `password_changed` flag (stored in the `profiles` table) is false.
- **FR-AUTH-7 (Sign-Out):** Users shall be able to explicitly sign out at any time via NextAuth's `signOut()`, which immediately invalidates the session JWT/cookie regardless of the remaining 4-day window.
- **FR-AUTH-8 (Password Reset Email):** Users shall be able to request a password reset from `/reset-password`; the system shall generate a signed, time-limited reset token, persist it against the user's record via Prisma, and send a reset link to the user's registered email address using **Nodemailer**. Submitting a new password via the emailed link invalidates the token after use.
- **FR-AUTH-9 (Toast Feedback):** All authentication actions (sign-in failure, password change success/failure, password reset email sent, sign-out) shall surface immediate, non-blocking feedback to the user via a **`sonner`** toast, in addition to any inline form validation messages.

### 3.2 Admin Module
- **FR-ADM-1 (User Management):** Admins shall be able to view, add, edit, and suspend users across all roles (Students, Teachers, Mentors, Parents), using server-only Server Actions that perform the corresponding create/update/suspend operations directly through Prisma Client against the `users`/`profiles` tables.
- **FR-ADM-2 (Subject Management):** Admins shall be able to create course subjects and assign teachers to them.
- **FR-ADM-3 (Mentorship Allocation):** Admins shall have the ability to link students to mentors (`student_mentors` table).
- **FR-ADM-4 (Analytics):** The dashboard shall display aggregate counts of active students, teachers, mentors, and subjects, computed via Postgres views and/or aggregate queries executed through Prisma (`prisma.$queryRaw`/`groupBy` as needed).
- **FR-ADM-5 (Bulk Onboarding):** Admins shall be able to upload student and faculty records in bulk via Excel files, including data format validation, error handling, and compatibility adjustments for existing records.
- **FR-ADM-6 (Advanced Filtering):** Admins shall be able to apply advanced, controlled filters to student and faculty lists (e.g., by program, semester, department, or status) for precise data retrieval and management.
### 3.3 Teacher Module
- **FR-TCH-1 (Class Roster):** Teachers shall view a list of students assigned to the classes and subjects they teach.
- **FR-TCH-2 (Attendance Logging):** Teachers shall record daily student attendance (Present, Absent, Leave, Late).
- **FR-TCH-3 (Marks Entry):** Teachers shall enter academic marks per subject, automatically calculating percentage and grades.
- **FR-TCH-4 (Feedback Generation):** Teachers shall post academic and behavioral feedback that can optionally be visible to parents.

### 3.4 Mentor Module
- **FR-MNT-1 (Mentee Tracking):** Mentors shall view a list of their assigned mentees, including their aggregated attendance percentage and average marks percentage.
- **FR-MNT-2 (Meeting Scheduler):** Mentors shall schedule 1-on-1 or group meetings with students, storing dates, topics, and virtual links.
- **FR-MNT-3 (Remarks):** Mentors shall record qualitative remarks (progress, concern, achievement, suggestion) on student profiles.
- **FR-MNT-4 (Parent Contact):** Mentors shall have access to parent contact information for their mentees.

### 3.5 Student Module
- **FR-STU-1 (Dashboard Overview):** Students shall see a summary of their recent marks and current attendance metrics.
- **FR-STU-2 (Marks & Backlogs):** Students shall view detailed subject-wise marks and historical backlogs.
- **FR-STU-3 (Feedback & Meetings):** Students shall view feedback left by teachers/mentors and see upcoming scheduled mentor meetings.
- **FR-STU-4 (Profile Management):** Students shall be able to update non-critical profile information.

### 3.6 Parent Module
- **FR-PAR-1 (Child Monitoring):** Parents shall view read-only dashboards displaying their linked child's attendance and academic marks.
- **FR-PAR-2 (Faculty Feedback):** Parents shall view teacher and mentor feedback explicitly marked as `visible_to_parent = TRUE`.
- **FR-PAR-3 (Notifications):** Parents shall receive system notifications (alerts, reminders) related to their child's academic standing. A durable copy is written to the `notifications` table immediately when the triggering event occurs; the client's polling `useNotifications` hook picks up new/unread rows on its next interval and surfaces them in-app as **`sonner`** toasts when the parent is active in the dashboard, in addition to being viewable later in the notifications list.
- **FR-PAR-4 (Email Alerts):** For high-priority events (e.g., a new mentor remark flagged "concern," attendance falling below a configurable threshold, or a new meeting invite), the system shall additionally send an email to the parent's registered address via **Nodemailer**, independent of whether the parent is currently online.

---

## 4. Data & Database Requirements

The PostgreSQL database `mentra_db` — a local instance managed through pgAdmin4 during development, and a standard PostgreSQL instance on the team's chosen host in staging/production — is modeled and versioned through **Prisma** (`prisma/schema.prisma`) and enforces the following logical constraints:

- **`users`**: Base authentication table, owned and queried directly by NextAuth's Credentials `authorize()` callback via Prisma Client — stores `email`, `bcrypt`-hashed `password`, and the `role` enum (`admin`, `teacher`, `mentor`, `student`, `parent`). This table is Mentra's own schema, fully owned by the application (no external auth provider's schema involved).
- **`profiles`**: Extends `users` via a `user_id` foreign key, storing `password_changed` and shared profile attributes (name, avatar, phone, etc.) surfaced across all dashboards.
- **`students`, `teachers`, `mentors`, `parents`**: Extension tables connected to `users`/`profiles` via foreign key `user_id`, maintaining specific attributes like roll numbers, expertise, or guardian details.
- **`subjects`**: Represents the course catalog.
- **`marks` & `attendance`**: Transactional tables bound to `student_id` and `subject_id` with timestamps.
- **`student_mentors` & `student_parents`**: Junction tables for many-to-many or specific linking relationships.
- **`feedback`, `remarks`, `meetings`, `notifications`**: Operational tables maintaining the communication and scheduling histories.
- **`password_reset_tokens`**: Stores hashed reset tokens, an `expires_at` timestamp, and a `used_at` nullable timestamp, supporting the Nodemailer-driven password reset flow (FR-AUTH-8).
- **Authorization model:** Since authentication/session state lives entirely in NextAuth, the database is accessed exclusively through Prisma Client using a trusted server-side connection string from trusted server-side code (Server Actions/Route Handlers) — there is no client-side database access path at all. Row-level authorization is therefore enforced in the application layer — every Prisma query is scoped by the `role`/`user_id` extracted from the verified NextAuth JWT — rather than via database-level row-level-security policies.
- Data deletion on `users` automatically cascades down to `profiles` and linked profiles/transactional records (`onDelete: Cascade` in the Prisma schema) to maintain referential integrity.
- **Local vs. Live parity:** Schema changes are authored once in `prisma/schema.prisma` and versioned as migrations under `prisma/migrations/*` via `prisma migrate dev` (local) and `prisma migrate deploy` (CI/CD to staging/production), applied identically to the local Postgres instance (inspected/administered via pgAdmin4) and the staging/production Postgres instance, ensuring both environments stay in sync.

---

## 5. Non-Functional Requirements

### 5.1 Performance
- API/server-action response times should optimally be under 300ms for standard dashboard retrieval requests.
- The PostgreSQL database utilizes indexes on common query paths (e.g., `user_id`, `student_id`, `email`, `role`) to ensure swift lookups even as the row count scales.
- Next.js Server Components and route-level caching are used to minimize client-side data fetching waterfalls for read-heavy dashboards.

### 5.2 Security
- All database reads/writes go through **Prisma Client** inside server-side contexts (Server Actions / Route Handlers) only; the Prisma `DATABASE_URL`/`DIRECT_URL` connection string is never exposed to the client bundle, and no direct database access is performed from client components.
- There is no client-side database or storage SDK in the application at all — the browser only ever talks to Mentra's own Route Handlers/Server Actions, which perform all Prisma queries, file reads/writes, and notification polling responses server-side.
- Passwords are hashed with bcrypt at the application layer and stored in the Prisma-managed `users` table; no plaintext or third-party-managed password hashes exist in custom tables.
- SMTP credentials for Nodemailer (`SMTP_USER`, `SMTP_PASSWORD`) are stored as server-only environment variables and never referenced from client components; password-reset tokens sent by email are single-use, expiring, and hashed at rest (see `password_reset_tokens`).
- CORS and allowed origins are configured at the Next.js/hosting-platform level to only accept requests from approved frontend origins.

### 5.3 Reliability & Availability
- The system prevents redundant admin creation by checking for an existing `admin@mentra.edu` record in `profiles` via Prisma before running the Server Action that creates a new admin user.
- SQL constraints (like `UNIQUE(student_id, subject_id, attendance_date)`) prevent duplicate and corrupt operational data entry.
- Automated backups (e.g., scheduled `pg_dump`, or point-in-time recovery if the chosen production host provides it) are configured on the production PostgreSQL instance.

### 5.4 Maintainability
- The codebase follows a **feature-based, modular architecture** rather than a technical-layer (MVC) split, so that each business capability (auth, admin, teacher, mentor, student, parent, and shared/common concerns) is self-contained and independently extensible.
- Shared, cross-feature primitives (the Prisma client singleton, the email transporter, design-system UI primitives, generated DB types, utility functions) live in a common `lib/` and `shared/` layer that features depend on, but never the reverse.
- All new features are expected to conform to the standard feature-module shape defined in Section 6, keeping ownership boundaries clear as the system scales.

---

## 6. Codebase & Folder Structure

The application follows a **feature-based, colocated folder structure** on top of the Next.js App Router. Each role/domain feature owns its own `components/`, `hooks/`, and `actions.ts` (Server Actions), plus any other files it needs (`types.ts`, `queries.ts`, `schema.ts`, etc.), rather than splitting code by technical layer across the whole app.

```
mentra/
├── src/
│   ├── app/                          # Next.js App Router (routing shell only)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── subjects/page.tsx
│   │   │   │   └── mentorship/page.tsx
│   │   │   ├── teacher/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── attendance/page.tsx
│   │   │   │   ├── marks/page.tsx
│   │   │   │   └── feedback/page.tsx
│   │   │   ├── mentor/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── mentees/page.tsx
│   │   │   │   ├── meetings/page.tsx
│   │   │   │   └── remarks/page.tsx
│   │   │   ├── student/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── marks/page.tsx
│   │   │   │   └── meetings/page.tsx
│   │   │   └── parent/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       └── feedback/page.tsx
│   │   ├── api/
│   │   │   ├── notifications/route.ts       # polled by useNotifications (Prisma-backed)
│   │   │   └── uploads/route.ts             # receives/serves files, writes to server filesystem
│   │   ├── layout.tsx
│   │   └── globals.css                      # Tailwind v4 entry (@import "tailwindcss")
│   │
│   ├── features/                     # Feature-based business logic (the core of the app)
│   │   ├── auth/
│   │   │   ├── components/           # LoginForm, PasswordResetForm, etc.
│   │   │   ├── hooks/                # useSession, useRequirePasswordChange
│   │   │   ├── actions.ts            # signIn, signOut, changePassword (Server Actions)
│   │   │   ├── queries.ts            # getCurrentUser, getRoleClaims
│   │   │   ├── schema.ts             # zod schemas for login/reset forms
│   │   │   └── types.ts
│   │   ├── admin/
│   │   │   ├── components/           # UserTable, SubjectForm, MentorshipLinker
│   │   │   ├── hooks/                # useUsers, useAnalytics
│   │   │   ├── actions.ts            # createUser, suspendUser, assignMentor
│   │   │   ├── queries.ts
│   │   │   └── types.ts
│   │   ├── teacher/
│   │   │   ├── components/           # AttendanceGrid, MarksEntryForm, FeedbackComposer
│   │   │   ├── hooks/                # useClassRoster, useAttendance
│   │   │   ├── actions.ts            # markAttendance, submitMarks, postFeedback
│   │   │   ├── queries.ts
│   │   │   └── types.ts
│   │   ├── mentor/
│   │   │   ├── components/           # MenteeList, MeetingScheduler, RemarkForm
│   │   │   ├── hooks/                # useMentees, useMeetings
│   │   │   ├── actions.ts            # scheduleMeeting, addRemark
│   │   │   ├── queries.ts
│   │   │   └── types.ts
│   │   ├── student/
│   │   │   ├── components/           # MarksSummary, AttendanceCard, MeetingList
│   │   │   ├── hooks/                # useDashboardSummary
│   │   │   ├── actions.ts            # updateProfile
│   │   │   ├── queries.ts
│   │   │   └── types.ts
│   │   ├── parent/
│   │   │   ├── components/           # ChildOverview, FeedbackFeed
│   │   │   ├── hooks/                # useChildData, useNotifications
│   │   │   ├── actions.ts
│   │   │   ├── queries.ts
│   │   │   └── types.ts
│   │   └── notifications/
│   │       ├── components/
│   │       ├── hooks/                # useNotifications (polling)
│   │       ├── actions.ts
│   │       └── types.ts
│   │
│   ├── shared/                       # Cross-feature, reusable, no feature-specific logic
│   │   ├── components/               # Button, Card, DataTable, Modal, DashboardShell, Toaster (sonner)
│   │   ├── hooks/                    # useDebounce, useMediaQuery
│   │   └── utils/                    # formatDate, calculateGrade, percentageHelpers
│   │
│   ├── lib/                          # Infrastructure / third-party integration
│   │   ├── prisma/
│   │   │   └── client.ts             # singleton PrismaClient instance (server-only)
│   │   ├── email/
│   │   │   ├── transporter.ts        # Nodemailer SMTP transporter (env-driven config)
│   │   │   ├── templates/            # HTML/text templates: password-reset, meeting-invite, parent-alert
│   │   │   └── send.ts               # sendPasswordResetEmail, sendParentAlertEmail, etc.
│   │   ├── storage/
│   │   │   ├── uploadFile.ts         # writes a file to the server-side storage directory
│   │   │   ├── getFile.ts            # streams/serves a stored file by path
│   │   │   └── deleteFile.ts         # removes a file and its metadata row
│   │   └── validation/                # shared zod schemas/constants
│   │
│   └── middleware.ts                 # Next.js middleware: session refresh + RBAC route guards
│
├── prisma/
│   ├── schema.prisma                 # single source of truth for all data models (incl. file metadata)
│   ├── migrations/                   # versioned Prisma migrations (SQL, auto-generated)
│   └── seed.ts                       # local seed script (`prisma db seed`)
│
├── storage/                          # server-side upload directory (dev); mounted volume in prod
├── public/
├── .env.local                        # local Postgres DATABASE_URL (pgAdmin4-managed) + local SMTP
├── .env.production                   # production Postgres DATABASE_URL/DIRECT_URL + production SMTP
├── next.config.ts
├── tailwind.config.ts                # optional in Tailwind v4 (CSS-first @theme is primary)
├── tsconfig.json
└── package.json
```

**Conventions:**
- Every entry under `features/<feature-name>/` is self-contained: `components/` for UI, `hooks/` for client-side state/data hooks, `actions.ts` for Server Actions (mutations), `queries.ts` for server-side reads, `schema.ts` for form/input validation (Zod), and `types.ts` for feature-local TypeScript types.
- `app/` stays thin — pages and layouts import from `features/*` rather than containing business logic directly, keeping routing concerns separate from domain logic.
- `shared/` and `lib/` never import from `features/*`, preventing circular dependencies and keeping features independently removable/replaceable as the system scales.
- Database types flow entirely from `prisma/schema.prisma`: running `prisma generate` after every migration regenerates the typed Prisma Client, keeping all queries (via `lib/prisma/client.ts`) fully type-safe end-to-end. There is no separate, hand-maintained or externally-generated types file — Prisma Client's own types are the single source of truth for data shapes across the app.

---

## 7. Technology Stack Summary

| Layer | Technology | Notes |
|---|---|---|
| Frontend Framework | Next.js 16.x (App Router) | React Server Components, Turbopack, Server Actions |
| Language | TypeScript 6.x | Strict mode enabled across the codebase |
| Styling | Tailwind CSS 4.x | CSS-first `@theme` configuration |
| Backend/API | Next.js Route Handlers & Server Actions | No separate Express server |
| Database (Local) | PostgreSQL, administered via **pgAdmin4** | Standalone local instance or Docker Postgres container |
| Database (Staging/Production) | PostgreSQL (host TBD at deployment) | Any self-managed or standard managed-Postgres provider; connected via `DATABASE_URL`/`DIRECT_URL` |
| ORM / Data Access | **Prisma** (`prisma`, `@prisma/client`) | Single schema source of truth; fully typed queries end-to-end; sole path to the database |
| Authentication | NextAuth.js (Auth.js v5), JWT-based sessions | Credentials validated against Prisma-backed `users`/`profiles` tables |
| Authorization | RBAC (app layer) + Prisma-scoped queries | Defense-in-depth via middleware + server-side role checks |
| Email Delivery | **Nodemailer** (SMTP) | Password resets, meeting invites, parent alerts |
| UI Toast Notifications | **`sonner`** | Ephemeral success/error/info feedback across all dashboards |
| Durable Notifications | Polling of a Prisma-backed Route Handler | Client-side `useNotifications` hook; upgradeable to SSE/WebSockets later |
| File Storage | Server-side filesystem (local dir / mounted volume) | Metadata tracked in Postgres via Prisma; swappable to an object store later |
