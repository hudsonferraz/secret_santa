# secret_santa

![Next.js 16](https://img.shields.io/badge/Next.js-16-black)
![React 19](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black)](https://hfo-amigo-secreto.vercel.app/)

**Private Secret Santa organizer** built for real family use. Create an event, add participants, optionally split them into groups, run a valid draw, and send each person a private reveal link over WhatsApp.

This is a **personal, useful, and portfolio project**. I built it to replace the usual spreadsheet/manual-message workflow for my family's Secret Santa — the kind of small, day-to-day tool I enjoy shipping: clear UX, privacy boundaries, and enough engineering care to be reliable.

**What it does:** organizer creates event → adds groups/participants → validates and runs draw → sends one private link per participant.  
**How it's built:** Next.js App Router, React, TypeScript, Prisma/PostgreSQL, JWT cookies, Zod validation, Vitest.  
**Scope and limits:** organizer-managed sharing, no participant accounts, private links are bearer tokens — see [Operational assumptions](#operational-assumptions) and [design decisions](docs/design-decisions.md).

## Live links

| Service | URL |
|---------|-----|
| Web (Vercel) | [https://hfo-amigo-secreto.vercel.app](https://hfo-amigo-secreto.vercel.app/) |
| Organizer area | [https://hfo-amigo-secreto.vercel.app/admin](https://hfo-amigo-secreto.vercel.app/admin) |

![Landing page](docs/images/landing.png)

## Highlights

- **Private reveal links** — each participant gets a unique `/r/{token}` URL instead of looking up results by phone or name
- **Organizer dashboard** — create events, groups, and participants; run/reset draws; track sent links
- **Grouped draw rules** — prevent matches inside the same family/group when grouped mode is enabled
- **Draw preview** — validates participant/group composition before the organizer commits the draw
- **WhatsApp workflow** — copy personal links, copy ready-to-send messages, or open WhatsApp with the message prefilled
- **Reveal confirmation** — participants confirm before seeing their assigned person
- **Mobile-friendly admin** — responsive layout, touch-sized controls, sticky bottom action bar
- **Relational assignments** — matches stored as `matched_person_id`, not encoded text
- **15 automated tests** — matching edge cases for two-person events, grouped draws, impossible compositions, and repeated runs

## Screenshots

| Landing | Organizer events |
|---------|------------------|
| ![Landing](docs/images/landing.png) | ![Organizer events](docs/images/admin-events.png) |

| Event detail (after draw) | Architecture |
|---------------------------|--------------|
| ![Event detail](docs/images/admin-event-detail.png) | ![Architecture](docs/images/architecture.svg) |

## Capabilities

| Area | What you get |
|------|--------------|
| **Events** | Title, description, pending/drawn status, grouped or ungrouped mode |
| **Participants** | Add/remove people before the draw; each receives a unique reveal token |
| **Groups** | Optional family/group separation so matches only happen across groups |
| **Draw validation** | Blocks impossible draws and explains what needs to change |
| **Reveal flow** | Private link + confirmation step; participants see only their own match |
| **Sharing** | Copy link, copy WhatsApp-ready message, open WhatsApp, mark link as sent |
| **Organizer auth** | Email/password registration and login with HTTP-only session cookie |

## Quickstart (local)

Requires Node.js 20+ and PostgreSQL.

```bash
cd secret_santa
npm install
cp .env.example .env
```

Fill `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
SESSION_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Apply migrations and start the app:

```bash
npm run db:migrate:dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an organizer account, create an event, add participants, and run the draw.

## Tests

```bash
npm test
npm run lint
npm run build
```

## Database

Prisma migrations live in `prisma/migrations`.

```bash
npm run db:migrate:dev   # local development
npm run db:migrate       # deploy existing migrations
npm run db:push          # quick local sync when appropriate
```

If an existing database was first created with `prisma db push`, baseline it before applying migrations — see notes in `prisma/migrations/20250630153000_init/migration.sql` and use `npm run db:migrate:resolve -- <migration_name>`.

## Deploy

Production: [https://hfo-amigo-secreto.vercel.app](https://hfo-amigo-secreto.vercel.app/) (Vercel + Neon PostgreSQL).

1. Set env vars: `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL` (e.g. `https://hfo-amigo-secreto.vercel.app`).
2. Run migrations against production: `npm run db:migrate`.
3. Build and deploy: `npm run build` then `npm start` (or connect the repo to Vercel for automatic deploys).

`postinstall` runs `prisma generate` only — migrations are **not** applied automatically during deploy.

## API

| Endpoint | Description |
|----------|-------------|
| `POST /api/admin/register` | Create organizer account |
| `POST /api/admin/login` | Start session cookie |
| `GET/POST /api/admin/events` | List or create events |
| `GET/PATCH/DELETE /api/admin/events/[id]` | Read, update, delete event; `PATCH status=true` runs draw |
| `GET /api/admin/events/[id]/draw-preview` | Pre-draw validation summary |
| `GET /api/admin/events/[id]/people-summary` | Participant/sent counts across all groups |
| `GET/POST /api/admin/groups/[idEvent]` | List or create groups |
| `GET/POST /api/admin/people/[idEvent]/[idGroup]` | List or create participants |
| `PUT /api/admin/people/.../[id]` | Update participant (e.g. `link_sent`) |
| `GET /api/reveal/[token]` | Reveal lookup (used by reveal page) |

## Architecture

See [docs/architecture.md](docs/architecture.md) for the route map, data model, draw lifecycle, and privacy boundaries.

## Operational assumptions

This project is intentionally small and organizer-led:

- **No participant accounts** — participants authenticate by possession of a private reveal link.
- **Links are bearer secrets** — anyone with a participant's link can see that participant's result; send links privately.
- **Organizer sends messages manually** — the app prepares links/messages but does not integrate with the WhatsApp Business API.
- **Draw locks editing** — once the draw is run, participants/groups are locked until the organizer resets the draw.
- **Grouped events require feasible group sizes** — if one group is too large, a cross-group-only draw may be impossible.

For rationale behind these choices, see [docs/design-decisions.md](docs/design-decisions.md).

## Configuration

See `.env.example`.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret used to sign organizer session JWTs |
| `NEXT_PUBLIC_APP_URL` | Public app origin used to build full reveal/share links |
| `PORT` | Optional local server port |

## Portfolio story

This project started from a practical family problem: organizing Secret Santa without leaking assignments, juggling spreadsheets, or asking people to type phone numbers into a lookup form. The result is a focused full-stack app that shows product judgment as much as code — private links, mobile-first sharing, draw validation, confirmation before reveal, and a dashboard built around how an organizer actually sends messages.

## Design decisions

Extended write-up: [docs/design-decisions.md](docs/design-decisions.md).

## Author

**Hudson Ferraz** — [@hudsonferraz](https://github.com/hudsonferraz)
