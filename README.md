# magica-frontend

Web UI for a Galaxy-style agent chat. Users sign in, describe a task, and watch an agent load skills and run real media tools (crop, generate or edit images, merge videos). Tool steps, timers and generated media update live while the agent works.

The API and agent runtime live in a separate repo: [magica-backend](https://github.com/kk-source/magica-backend).

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 App Router + React 19, TypeScript strict |
| Auth | Clerk (`@clerk/nextjs`) |
| Server state | TanStack Query 5 |
| Client state | Zustand 5 |
| Live updates | Trigger.dev Realtime (`@trigger.dev/react-hooks`) |
| Validation | Zod 4, parses every API response |
| UI | Tailwind CSS 4 + shadcn-style Radix components, lucide icons |
| Markdown | `react-markdown` + `remark-gfm` |
| Uploads | Uppy + Transloadit (resumable, direct to Transloadit) |

## Architecture

```
 app/page.tsx (home composer + templates)      app/chat/[chatId]/page.tsx
            │                                            │
            └──────────── components/chat/ChatView ──────┘
                               │
     TanStack Query (lib/api/*) ───► magica-backend REST (Clerk Bearer token)
                               │
     useRunStatus ── useRealtimeRun ───► Trigger.dev Realtime (live text + tool steps)
                               │
     Zustand (lib/stores/*): active run, optimistic user turns, outbox, sidebar/composer UI
```

### How a turn works

1. The user types in the composer. On the home page a chat is created first and the message is put in the Zustand `outbox`, then sent by the chat page once it opens.
2. The user turn shows immediately as an optimistic message while `POST /api/chats/:id/messages` returns `{ message, runId }`. Messages typed while a run is active are queued, not dropped.
3. `useRunStatus` (`lib/api/runs.ts`) fetches the run. While it is active the backend returns a Realtime token, and the hook subscribes to the Trigger.dev run so streamed text and tool steps update instantly. A 5s poll is the fallback.
4. When the run finishes the chat query refetches and the persisted assistant message (text, inline media, credit cost, follow-up chips) replaces the live view. The stop button cancels a running agent.
5. If the run pauses on a waitpoint (status `WAITING`: credit approval before an image, or an `ask_user` choice), the live bubble shows `WaitpointCard` with the question and option buttons. The first click posts `POST /api/chats/:id/waitpoints/:waitpointId`; the buttons then lock, and duplicate submits get the stored answer back from the backend. The question comes from both Realtime metadata and the run route, so it is restored after a reload.

### UI, matching the reference app

- User messages: right-aligned rounded pill. Assistant replies: plain markdown, no bubble.
- Tool steps above each reply: a collapsible summary ("Loaded a skill, 2 other steps"), expanding into one row per step with a label, the key argument in bold and an elapsed timer. While running the header shows the live action and a ticking timer.
- Generated images and videos render inline in the reply.
- Under each reply: credit cost, copy and feedback actions, timestamp and a suggested follow-up chip.
- Collapsible dark sidebar with recent tasks, delete, credit balance, theme toggle and profile.

### Code layout

| Path | What |
|---|---|
| `app/page.tsx` | Home: composer and template gallery |
| `app/chat/[chatId]/page.tsx` | Chat page |
| `components/chat/*` | `ChatView`, `MessageList`, `MessageBubble`, `ToolSteps`, `Composer`, `Markdown`, `ChatHeader` |
| `components/sidebar/*` | Sidebar and theme toggle |
| `components/ui/*` | shadcn-style primitives (hand-written on Radix) |
| `lib/api/client.ts` | Fetch wrapper: base URL, Bearer token, Zod parsing, typed errors |
| `lib/api/schemas.ts` | Zod schemas, mirror of the backend's `lib/contracts.ts` |
| `lib/api/{chats,messages,runs,me,uploads}.ts` | Query and mutation hooks per resource |
| `lib/hooks/useUploads.ts` | Uppy + Transloadit upload state for the composer |
| `lib/stores/*` | Zustand stores |
| `middleware.ts` | Clerk: `/chat/*` requires sign-in |

## Local setup

Requirements: Node 20+, pnpm 10, and the backend running on http://localhost:4000 (see its README).

```bash
pnpm install
cp .env.example .env.local  # fill in the keys below
pnpm dev                    # http://localhost:3000
```

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes | Must be the same Clerk app as the backend, or tokens are rejected |
| `CLERK_SECRET_KEY` | yes | Same Clerk app |
| `NEXT_PUBLIC_BACKEND_URL` | yes | `http://localhost:4000` locally, the backend's Vercel URL in production (no trailing slash) |

No other secrets live in the frontend. Transloadit params are signed by the backend, and Realtime tokens are issued per run by the backend.

## Deploy (Vercel)

1. Import the repo into Vercel (framework: Next.js, build command `pnpm build`).
2. Set the three variables above. `NEXT_PUBLIC_*` values are inlined at build time, so redeploy after changing them.
3. On the backend, set `FRONTEND_ORIGIN` to this deployment's URL so CORS allows it.
4. In Clerk, add the production domain. Use production Clerk keys for a public demo; development keys work but show a console warning and a dev banner.

Pushes to `main` deploy automatically.

## Design decisions and trade-offs

- **Separate frontend and backend repos and deploys.** Keeps the UI deploy fast and independent of the agent worker. The cost is that the API contract is duplicated in `lib/api/schemas.ts`; Zod parsing on every response makes any drift fail loudly instead of rendering wrong data.
- **TanStack Query for server state, Zustand for client state.** Query owns chats, messages, runs and credits (caching, refetch, invalidation). Zustand holds only things the server does not know yet: the active run, optimistic turns, the outbox and UI toggles.
- **Realtime with a polling fallback.** Trigger.dev Realtime gives token-by-token text and live tool steps without the backend holding open connections. A slow poll still finishes the turn if the socket drops, and timers tick client-side from each step's `startedAt`.
- **Optimistic user turns.** The message shows instantly, which matters because creating a run takes a round trip.
- **Waitpoint state from two sources.** The approval card reads the question from Realtime metadata for instant display and from the run route for reloads, so a paused run is never lost on refresh. The backend enforces exactly-once; the UI just locks its buttons after the first click.
- **Direct-to-Transloadit uploads.** Large images and videos skip Vercel's body limits and upload resumably; only the resulting URL is sent with the message.
- **Hand-written shadcn components.** The shadcn registry was unreachable from the build environment, so the few needed primitives were written on Radix in the same style.
- **Out of scope for the timeline:** automated tests, mobile-first layout polish, and the decorative nav items from the reference app (shown disabled).

## What I'd improve with more time

- **Tests.** Component tests for `ToolSteps`, `WaitpointCard` and the composer queue, plus a Playwright end-to-end run against a mocked backend.
- **Older messages and search.** Infinite scroll for long chats and a search box over chat titles and content.
- **Retry and branch.** A retry button on failed turns and a working branch action (currently visual only).
- **Thinking stream.** Show the model's reasoning live, as the reference app does.
- **Mobile layout** and full keyboard and screen-reader accessibility.
- **Shared contract package** with the backend so `lib/api/schemas.ts` isn't a hand-maintained copy.
