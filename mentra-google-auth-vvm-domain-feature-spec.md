# Google Authentication & `@vvm.edu.in` Domain Restriction — Feature Specification

## 1. Feature Overview

Mentra currently uses email/password authentication through NextAuth.js (Auth.js v5) and the application-managed `users` / `profiles` tables.

This feature introduces **Google OAuth authentication** while restricting Google sign-in to users whose Google Workspace email address belongs to the approved institutional domain:

`@vvm.edu.in`

The existing `@mentra.edu` authentication flow should remain available unless explicitly removed in a later release.

### Primary Objective

Allow users to sign in to Mentra using their institutional Google account while ensuring that:

- Only `@vvm.edu.in` Google accounts can use Google Sign-In.
- Personal Gmail accounts are rejected.
- Google accounts from other domains are rejected.
- A user's Google identity is linked to the existing Mentra user record where appropriate.
- Authentication and authorization remain separate concerns.
- Existing role-based access control (RBAC) remains enforced after Google authentication.

---

## 2. Relationship to Existing Authentication

The current SRS defines:

- NextAuth.js (Auth.js v5) for authentication.
- JWT-based sessions.
- Role-specific login routes.
- Credentials-based email/password authentication.
- Application-level RBAC.
- Prisma as the sole database access layer.
- `users` and `profiles` as the application's authentication/profile records.

This feature extends the existing authentication architecture rather than replacing it.

### Authentication methods

The system should support:

1. **Google OAuth**
   - Restricted to `@vvm.edu.in`.
   - Primary institutional login method.

2. **Existing credentials authentication**
   - Existing email/password authentication remains available for accounts that still require it.
   - The existing `@mentra.edu` behavior can remain during migration or coexistence.

The authorization layer must not trust the authentication method. A successfully authenticated Google user must still be assigned and checked against a valid Mentra role.

---

# 3. Functional Requirements

## FR-GAUTH-1 — Google Sign-In

The system shall provide a **Continue with Google** authentication option on the applicable login page.

The Google authentication flow shall use Auth.js/NextAuth.js with the Google OAuth provider.

After successful Google authentication, Auth.js shall return the authenticated Google identity to the application's authentication callback/authorization logic.

---

## FR-GAUTH-2 — Institutional Domain Restriction

The system shall allow Google OAuth authentication only when the authenticated user's email address ends with:

`@vvm.edu.in`

The domain comparison shall be case-insensitive.

Examples:

| Email | Result |
|---|---|
| `student@vvm.edu.in` | Allowed |
| `teacher@vvm.edu.in` | Allowed |
| `admin@vvm.edu.in` | Allowed, subject to role authorization |
| `student@gmail.com` | Rejected |
| `student@googlemail.com` | Rejected |
| `student@othercollege.edu` | Rejected |
| `student@vvm.edu` | Rejected |
| `student@vvm.edu.in.attacker.com` | Rejected |

The validation must compare the parsed email domain rather than performing an unsafe substring check.

---

## FR-GAUTH-3 — Server-Side Domain Validation

The `@vvm.edu.in` restriction shall be enforced server-side.

The application shall not rely only on:

- Client-side validation.
- Hiding the Google button.
- Frontend form validation.
- A query parameter.
- A browser-provided value.

The final authorization decision must occur on the server after Google has authenticated the user.

---

## FR-GAUTH-4 — Google Identity Verification

The application shall use the identity information returned by the trusted Google OAuth/Auth.js flow.

The system shall not accept an arbitrary email address supplied directly by the browser as proof of institutional identity.

The Google identity should be associated with a stable provider account identifier, such as Google's provider account ID, where supported by the Auth.js configuration.

---

## FR-GAUTH-5 — Existing User Matching

After successful Google authentication, the system shall determine whether the institutional email already belongs to a Mentra user.

Recommended matching rule:

`normalized Google email -> existing users.email`

Email comparison should be normalized consistently, including lowercase conversion.

If an existing user is found, the system shall authenticate that existing account rather than creating a duplicate user.

---

## FR-GAUTH-6 — New Google User Policy

The system shall define an explicit policy for a valid `@vvm.edu.in` Google account that does not already exist in the Mentra database.

Recommended initial policy:

**Do not automatically create a privileged Mentra account.**

Instead, one of the following controlled approaches should be used:

### Option A — Admin Provisioning (Recommended)

Only users previously created/provisioned by an Admin can access Mentra.

If a valid institutional Google account is not found in the database:

- Reject the login.
- Display a message such as:
  `Your institutional Google account is valid, but you do not have a Mentra account yet. Please contact the administrator.`

This prevents arbitrary institutional accounts from entering the system.

### Option B — Controlled Auto-Provisioning

The system may create a new user automatically only if a safe default role and onboarding workflow have been explicitly defined.

Automatic assignment of sensitive roles such as Admin, Teacher, Mentor, or Parent must never be based solely on the email domain.

---

## FR-GAUTH-7 — Role Authorization

Google authentication shall not replace Mentra's RBAC.

After Google authentication, the system shall load the user's Mentra role from the database.

The existing roles remain:

- Admin
- Teacher
- Mentor
- Student
- Parent

The role stored in the Mentra database is authoritative for application authorization.

Example:

A `student@vvm.edu.in` Google account may authenticate successfully, but if the corresponding Mentra account has role `student`, it must not gain access to `/admin/*`.

This preserves the existing RBAC requirements defined in the SRS.

---

## FR-GAUTH-8 — Role-Locked Login

If the application continues to use role-specific login routes, Google Sign-In must respect the expected role.

Example:

`/student/login`

A Google account mapped to a Teacher record must not become a Student session simply because the user clicked Google Sign-In from the Student login page.

The application shall verify:

`Google identity -> Mentra user -> stored role -> requested role`

If the roles do not match, the login shall be rejected or redirected to the appropriate login flow.

---

## FR-GAUTH-9 — Session Creation

After successful Google authentication and authorization, the application shall create the normal Mentra Auth.js session.

The existing session policy should remain unchanged unless intentionally revised.

Current SRS policy:

- JWT-based session.
- 4-day session lifetime.
- Session stored in an httpOnly cookie.
- Role information available to middleware/server-side authorization.

Google authentication therefore becomes an authentication mechanism, not a separate session system.

---

## FR-GAUTH-10 — Middleware Protection

The existing Next.js middleware shall continue protecting role-specific routes.

The middleware shall verify:

1. The user has a valid Auth.js session.
2. The session contains the expected user identity.
3. The role claim is valid.
4. The requested route is permitted for that role.

Google-authenticated users shall pass through the same authorization pipeline as credentials-authenticated users.

---

## FR-GAUTH-11 — Server-Side Authorization

Every protected Server Action and server-side query shall continue to verify the authenticated user.

A Google-authenticated session must not bypass database-level application authorization.

Prisma queries shall continue to be scoped using the authenticated user's identity and role.

---

## FR-GAUTH-12 — Sign-Out

The existing `signOut()` behavior shall apply to Google-authenticated users.

Signing out of Mentra shall invalidate the Mentra application session.

The implementation should clearly distinguish between:

- Signing out of Mentra.
- Signing out of the user's Google account.

Mentra should not unexpectedly sign the user out of all Google services.

---

## FR-GAUTH-13 — Error Handling

The system shall provide clear, non-sensitive feedback for authentication failures.

Suggested messages:

### Wrong domain

`Only @vvm.edu.in institutional Google accounts are allowed to sign in.`

### Valid domain but no Mentra account

`Your institutional account is valid, but you do not have access to Mentra yet. Please contact the administrator.`

### Role mismatch

`This account is not authorized for this section.`

### OAuth failure

`Google sign-in could not be completed. Please try again.`

Authentication errors shall not expose internal database details, OAuth tokens, provider configuration, or stack traces.

---

## FR-GAUTH-14 — Duplicate Account Prevention

The system shall prevent duplicate Mentra users from being created when a Google account corresponds to an existing email/password account.

The system should use the normalized institutional email as the primary matching mechanism.

Where supported, the Google provider account identifier should also be stored for reliable provider-account linking.

---

## FR-GAUTH-15 — Account Linking Policy

The application shall define a controlled policy for linking Google authentication to an existing Mentra account.

Recommended behavior:

- If the Google email exactly matches an existing verified Mentra email, allow controlled linking.
- Do not link accounts solely because the display name matches.
- Do not link accounts based on manually supplied email addresses.
- Do not allow one Google identity to be silently attached to multiple Mentra users.

For an existing password account, account linking should preferably occur only after the existing account has already been verified/provisioned or through an explicit secure linking workflow.

---

## FR-GAUTH-16 — Email Verification Trust

The system shall treat the Google OAuth identity as the source of the authenticated email identity.

The application should use Google's verified email information rather than accepting an unverified client-side email field.

For institutional Google Workspace environments, the application may additionally use the Google-hosted domain (`hd`) as an optimization/hint, but it must not replace server-side email-domain authorization.

The final application authorization rule remains:

`normalized email domain === vvm.edu.in`

---

## FR-GAUTH-17 — Login UI

The existing login interface shall be extended with a Google authentication option.

Recommended layout:

`Email`
`Password`
`Sign In`

`──────── OR ────────`

`Continue with Google`

The Google button should clearly communicate that only institutional accounts are accepted.

Suggested helper text:

`Use your @vvm.edu.in institutional Google account.`

---

# 4. Security Requirements

## SEC-GAUTH-1 — OAuth Credentials

Google OAuth client credentials shall be stored only in server-side environment variables.

Example configuration:

```env
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

The exact environment variable names should follow the Auth.js configuration used by the project.

Secrets must never be committed to Git or exposed through client-side environment variables.

---

## SEC-GAUTH-2 — Callback URL Security

Google OAuth redirect/callback URLs shall be explicitly configured for the application's approved environments.

Separate callback configuration should be maintained for:

- Local development.
- Staging.
- Production.

---

## SEC-GAUTH-3 — Exact Domain Validation

The implementation shall reject domains that merely contain the approved domain as a substring.

Unsafe example:

```text
user@vvm.edu.in.attacker.com
```

Safe validation concept:

```text
domain === "vvm.edu.in"
```

after normalizing the email.

---

## SEC-GAUTH-4 — No Client-Side Authorization

The client shall not determine whether a user is authorized based on:

```text
email.endsWith("@vvm.edu.in")
```

alone.

Client-side checks may improve UI feedback, but server-side validation remains mandatory.

---

## SEC-GAUTH-5 — OAuth State/CSRF Protection

The Auth.js OAuth implementation shall retain its standard OAuth state/CSRF protections.

The application shall not implement a custom OAuth flow unless there is a specific requirement that cannot be fulfilled by Auth.js.

---

## SEC-GAUTH-6 — Token Protection

Google access tokens, refresh tokens, client secrets, and other OAuth credentials shall never be exposed to client components unless there is an explicit and justified requirement.

Mentra only needs the authenticated identity for normal login/authorization.

---

# 5. Database Requirements

The current SRS defines `users` as the base authentication table containing:

- Email
- Password hash
- Role

The Google authentication feature should extend this model without unnecessarily replacing the existing credential fields.

Recommended additions:

```text
users
├── id
├── email
├── password
├── role
├── auth_provider
├── google_account_id
├── created_at
└── updated_at
```

Suggested semantics:

### `auth_provider`

Possible values:

```text
credentials
google
both
```

`both` is useful during a migration where an existing user can sign in using either password or Google.

### `google_account_id`

Stores the stable Google provider account identifier associated with the Mentra user.

This field should be unique when populated.

### Email

The existing email field remains the canonical application identity and should have a unique constraint.

---

# 6. Recommended Database Model

A more scalable approach, especially if additional OAuth providers may be added later, is to separate authentication providers from the core user table.

Example logical model:

```text
users
├── id
├── email
├── role
├── created_at
└── updated_at

accounts
├── id
├── user_id
├── provider
├── provider_account_id
├── access_token
├── refresh_token
├── expires_at
└── token_type
```

This follows the general account/provider relationship used by Auth.js-style authentication systems and avoids adding provider-specific columns directly to `users`.

The exact Prisma schema should be aligned with the Auth.js version and adapter strategy actually used by the project.

---

# 7. Authentication Flow

## Google Login Flow

```text
User
  |
  v
Mentra Login Page
  |
  | Click "Continue with Google"
  v
Auth.js Google Provider
  |
  v
Google OAuth
  |
  | User authenticates
  v
Google Callback
  |
  v
Verify authenticated identity
  |
  v
Normalize email
  |
  v
Check email domain
  |
  +---- domain != vvm.edu.in ----> Reject
  |
  v
Find Mentra user by email
  |
  +---- User not found ---------> Reject / Provisioning flow
  |
  v
Load Mentra role
  |
  v
Check requested role
  |
  +---- Role mismatch ----------> Reject
  |
  v
Create Auth.js JWT session
  |
  v
Next.js Middleware
  |
  v
Role-specific Dashboard
```

---

# 8. Account Provisioning Flow

Recommended controlled workflow:

```text
Admin creates/provisions user
        |
        v
Mentra user record created
        |
        v
User receives/accesses Mentra login
        |
        v
User chooses "Continue with Google"
        |
        v
Google authenticates @vvm.edu.in account
        |
        v
Mentra matches institutional email
        |
        v
Google identity linked to Mentra user
        |
        v
Role loaded from database
        |
        v
Dashboard access granted
```

This is preferable to granting access to every person who possesses a `@vvm.edu.in` address.

---

# 9. Login UX Requirements

The login page should make the authentication policy obvious.

Recommended UI:

```text
Welcome to Mentra

Institutional Account
Use your @vvm.edu.in account

[ Continue with Google ]

──────── OR ────────

Email
[________________________]

Password
[________________________]

[ Sign In ]
```

For role-specific pages, retain the existing role context.

Example:

```text
Student Login

[ Continue with Google ]

Only @vvm.edu.in institutional accounts are supported.
```

The same Google button can be reused across Student, Teacher, Mentor, Parent, and Admin login interfaces if the application continues to use separate role-specific routes.

---

# 10. Migration Strategy

The safest implementation should be incremental.

## Phase 1 — Add Google Provider

Add Google OAuth to Auth.js without removing the existing Credentials provider.

Expected state:

```text
Credentials Login  -> Existing users
Google Login       -> New institutional authentication path
```

## Phase 2 — Add Domain Restriction

Implement server-side:

```text
email domain == vvm.edu.in
```

Test with:

- Valid institutional account.
- Personal Gmail.
- Another organization's Google account.
- Similar-looking malicious domains.

## Phase 3 — Link Existing Users

Map Google accounts to existing Mentra users by normalized email.

Avoid creating duplicates.

## Phase 4 — Apply RBAC

Ensure Google users receive the same database-backed role and route restrictions as credentials users.

## Phase 5 — Admin Provisioning

Decide whether valid institutional accounts must already exist in the database.

Recommended:

**Yes — require provisioning.**

## Phase 6 — Production Hardening

Verify:

- HTTPS.
- OAuth callback URLs.
- Environment secrets.
- Cookie/session behavior.
- Middleware.
- Server-side authorization.
- Duplicate account prevention.
- Error handling.
- Logging and audit events.

---

# 11. Testing Requirements

## Authentication Tests

| Test | Expected Result |
|---|---|
| Valid `@vvm.edu.in` Google account with existing Mentra user | Login succeeds |
| Valid `@vvm.edu.in` Google account without Mentra user | Rejected or controlled onboarding |
| Personal Gmail account | Rejected |
| Other Google Workspace domain | Rejected |
| `@vvm.edu.in.attacker.com` | Rejected |
| `@VVM.EDU.IN` | Accepted after normalization |
| Existing password account + matching Google email | No duplicate user |
| Google Teacher accessing Student login | Rejected |
| Google Student accessing Admin route | Blocked |
| Signed-out user accessing dashboard | Redirected to login |
| Expired session | Re-authentication required |

---

# 12. Security Test Cases

The implementation should specifically test:

1. Domain spoofing.
2. Email case manipulation.
3. Duplicate account creation.
4. Role escalation.
5. Direct access to protected URLs.
6. Forged client-side email values.
7. OAuth callback manipulation.
8. Session tampering.
9. Unauthorized account linking.
10. Access to another user's records after Google login.

---

# 13. Non-Functional Requirements

## NFR-GAUTH-1 — Security

Authentication shall be performed through a trusted OAuth provider and server-side authorization logic.

## NFR-GAUTH-2 — Reliability

A temporary Google authentication failure shall not corrupt the Mentra user record or create partially provisioned accounts.

## NFR-GAUTH-3 — Maintainability

Google authentication logic shall remain inside the existing `features/auth` and authentication infrastructure rather than being embedded inside individual dashboard pages.

## NFR-GAUTH-4 — Compatibility

Google authentication shall coexist with the existing Credentials provider unless the Credentials provider is explicitly removed in a later release.

## NFR-GAUTH-5 — Performance

OAuth login should not introduce unnecessary database queries after the identity has been verified. User lookup and role loading should be indexed by normalized/unique email and user ID.

---

# 14. Recommended Codebase Changes

Based on the existing feature-based structure, the authentication area can be extended as follows:

```text
src/
├── features/
│   └── auth/
│       ├── components/
│       │   ├── LoginForm.tsx
│       │   └── GoogleSignInButton.tsx
│       ├── hooks/
│       │   ├── useSession.ts
│       │   └── useRequirePasswordChange.ts
│       ├── actions.ts
│       ├── queries.ts
│       ├── schema.ts
│       ├── google.ts              # Google/domain validation helpers
│       └── types.ts
│
├── lib/
│   └── auth/
│       ├── auth.ts                # Auth.js configuration
│       └── domain.ts              # Allowed-domain validation
│
└── middleware.ts
```

The exact structure can be adapted to the existing Auth.js configuration.

---

# 15. Environment Configuration

The production deployment should contain Google OAuth credentials as server-side environment variables.

Conceptually:

```env
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

Optional application configuration:

```env
ALLOWED_GOOGLE_DOMAIN=vvm.edu.in
```

Using an environment variable for the domain makes the restriction configurable between environments, but the production value must be explicitly set to:

```text
vvm.edu.in
```

The application should fail safely if the required authentication configuration is missing.

---

# 16. Audit & Logging

Authentication events should be logged server-side without recording sensitive OAuth tokens or secrets.

Recommended events:

```text
GOOGLE_LOGIN_SUCCESS
GOOGLE_LOGIN_REJECTED_DOMAIN
GOOGLE_LOGIN_REJECTED_NO_ACCOUNT
GOOGLE_LOGIN_ROLE_MISMATCH
GOOGLE_ACCOUNT_LINKED
GOOGLE_LOGIN_ERROR
```

Useful non-sensitive fields:

- User ID, when known.
- Email/domain, subject to the project's privacy policy.
- Timestamp.
- Authentication provider.
- Result.
- Failure reason category.

Do not log:

- Google client secrets.
- Access tokens.
- Refresh tokens.
- Passwords.
- Full OAuth callback payloads.

---

# 17. Acceptance Criteria

The feature shall be considered complete when all of the following are true:

- [ ] A "Continue with Google" option exists on the required Mentra login pages.
- [ ] Google OAuth authentication works through Auth.js.
- [ ] Only `@vvm.edu.in` accounts can pass the institutional-domain check.
- [ ] Personal Gmail accounts are rejected.
- [ ] Other Google Workspace domains are rejected.
- [ ] Domain validation occurs server-side.
- [ ] Existing Mentra users can be matched without creating duplicates.
- [ ] The Google account cannot select or escalate its own Mentra role.
- [ ] Existing RBAC middleware continues to protect all role-specific routes.
- [ ] Server Actions continue to perform server-side authorization.
- [ ] Google-authenticated sessions use the existing Mentra session strategy.
- [ ] Sign-out works correctly.
- [ ] OAuth credentials remain server-side.
- [ ] Unauthorized or unprovisioned institutional accounts receive a clear error.
- [ ] Account linking is controlled and cannot silently attach an account to the wrong user.
- [ ] Authentication failures do not expose internal implementation details.
- [ ] Existing Credentials authentication continues to work if it is retained.
- [ ] Production OAuth callback URLs are configured correctly.
- [ ] Security and role-escalation test cases pass.

---

# 18. Recommended Final Authentication Architecture

```text
                    ┌─────────────────────┐
                    │    Mentra Login     │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 v                           v
        ┌────────────────┐          ┌────────────────┐
        │ Credentials    │          │ Google OAuth   │
        │ Provider       │          │ Provider       │
        └───────┬────────┘          └───────┬────────┘
                │                           │
                │                           v
                │                  Verify Google identity
                │                           │
                │                           v
                │                  Check @vvm.edu.in
                │                           │
                │                  ┌────────┴────────┐
                │                  │                 │
                │                FAIL              PASS
                │                  │                 │
                │                  v                 v
                │                Reject       Find Mentra user
                │                                    │
                └────────────────┬───────────────────┘
                                 v
                         Load Mentra user
                                 │
                                 v
                           Load RBAC role
                                 │
                                 v
                       Create Auth.js session
                                 │
                                 v
                         Next.js Middleware
                                 │
                                 v
                       Role-specific Dashboard
                                 │
                                 v
                       Server-side RBAC checks
                                 │
                                 v
                            Prisma DB
```

## 19. Key Design Decision

The most important architectural rule is:

> **`@vvm.edu.in` proves institutional Google identity; it does not determine Mentra authorization.**

The email domain answers:

**"Is this user allowed to authenticate through institutional Google?"**

The Mentra database role answers:

**"What is this authenticated user allowed to do?"**

Therefore:

```text
Google Identity
      ↓
@vvm.edu.in validation
      ↓
Existing Mentra user
      ↓
Database role
      ↓
RBAC
      ↓
Authorized dashboard
```

This keeps authentication, identity, provisioning, and authorization separate and prevents the Google domain restriction from accidentally becoming a privilege-escalation mechanism.
