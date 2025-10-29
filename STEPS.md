 **Outcome**
- Integrate Supabase Auth into your Next.js app (`app` router).
- Provide protected routes, SSR-friendly session handling, and RLS-backed data.
- Keep changes minimal, consistent with current structure.

**Phased Plan**
- Phase 1: Dependencies and environment
- Phase 2: Supabase clients (browser/server) and cookies middleware
- Phase 3: Provider and hooks for session access
- Phase 4: Auth UI (sign-in/out) and redirects
- Phase 5: Protected routes and guards for `app/` pages
- Phase 6: Database schema (profiles, todos) with RLS policies
- Phase 7: API route integration with server clients
- Phase 8: Testing, QA, and deployment setup

**Tasks — Setup**
- Create a Supabase project; enable Email and OAuth providers as needed.
- Add env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
- Install dependencies for Next.js `app` router + SSR cookies.
```bash
npm i @supabase/supabase-js @supabase/auth-helpers-nextjs
```
- Optionally add types for Node/React if missing.
```bash
npm i -D @types/node @types/react
```

**Tasks — Clients & Middleware**
- Add `lib/supabase/client.ts` for the browser client using `createClient`.
- Add `lib/supabase/server.ts` with `createServerClient` for server components/actions.
- Add `middleware.ts` at project root using `createMiddlewareClient` to persist and refresh sessions via cookies.
- Configure protected routes in `middleware.ts` (e.g., redirect unauthenticated users going to `todos`).

**Tasks — Provider & Hooks**
- Add `components/auth-provider.tsx` to expose user/session via React context.
- Add `hooks/useSupabase.ts` and `hooks/useUser.ts` to access client and session data within client components.
- Wrap `app/layout.tsx` with `AuthProvider` to provide session to client components.

**Tasks — Auth UI**
- Add `app/(auth)/sign-in/page.tsx` with:
  - Email/password sign-in and sign-up.
  - Optional OAuth buttons (e.g., Google, GitHub) configured in Supabase.
- Add `app/(auth)/callback/route.ts` if using OAuth to handle provider redirects.
- Add a sign-out button (e.g., in `components/sidebar.tsx`) calling `supabase.auth.signOut()`.

**Tasks — Route Protection**
- Guard client pages with session checks:
  - Gate `app/todos/page.tsx` to show content only when `user` exists.
- Add server-side checks:
  - In server components, call `createServerClient(cookies)` and redirect unauthenticated users to `/sign-in`.
- Align UX: protected pages redirect to sign-in; sign-in redirects back to intended destination.

**Tasks — Database & RLS**
- Create `profiles` table to link `auth.users` to user profile data.
- Create `todos` table with `user_id uuid` referencing `auth.users.id`.
- Enable RLS and add policies:
  - Users can `select/insert/update/delete` rows where `todos.user_id = auth.uid()`.
- Seed sample data with your user to validate end-to-end.

**Tasks — Integrate Todos**
- Update `app/todos/page.tsx` to fetch todos with server client (`createServerClient`) and render.
- Add server actions for insert/update/delete validated by RLS (no service role key).
- Ensure optimistic UI updates and error handling for auth failures.

**Tasks — API Route Alignment**
- If `app/api/chat` is used, decide policy:
  - Require auth: check session via `createServerClient` inside the route handler and return `401` if missing.
- Ensure no service role key is used in edge-exposed code; keep all data ops within RLS constraints.

**Tasks — Testing & QA**
- Validate flows: sign-in, sign-up, OAuth, sign-out, session persistence and refresh.
- Verify protected redirects: unauthenticated → `/sign-in`, authenticated → destination.
- Verify RLS with multiple users:
  - User A cannot read/write User B’s todos.
- Exercise server actions and API routes under auth and unauth cases.

**Tasks — Deployment**
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to hosting environment (e.g., Vercel).
- Confirm `middleware.ts` runs at the edge; avoid Node-only APIs in middleware.
- Verify cookies work on your domain; test redirects and session refresh after deploy.

**File Map (Suggested)**
- `lib/supabase/client.ts` — browser `createClient`.
- `lib/supabase/server.ts` — server `createServerClient(cookies)`.
- `middleware.ts` — cookies-based session refresh + protected route redirects.
- `components/auth-provider.tsx` — context provider for session.
- `hooks/useSupabase.ts` and `hooks/useUser.ts` — helpers for client components.
- `app/(auth)/sign-in/page.tsx` — auth form + OAuth.
- `app/todos/page.tsx` — protected page with server-fetch and server actions.

**Env Vars**
- `NEXT_PUBLIC_SUPABASE_URL`: your project URL from Supabase settings.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: your anon key from Supabase API settings.
- Avoid placing `SUPABASE_SERVICE_ROLE_KEY` in client-side code; only use it server-side if you create admin-only endpoints (not needed for standard user CRUD with RLS).

**Acceptance Criteria**
- Users can sign in/out and see their own todos only.
- Unauthenticated users are redirected from protected pages to `/sign-in`.
- SSR and client components can read the session reliably.
- API routes return `401` without a valid session.
- No secrets are exposed client-side; RLS enforces per-user access.

If you want, I can scaffold the `lib/supabase/*`, `middleware.ts`, and `app/(auth)/sign-in` files now and wire up protection for `app/todos/page.tsx`.
        