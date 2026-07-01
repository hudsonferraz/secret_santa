# Architecture

## Overview

secret_santa is a full-stack Secret Santa organizer. An organizer manages events and participants in an authenticated dashboard; participants only receive private reveal links and never need accounts.

```mermaid
flowchart TB
  subgraph public [Public pages]
    Home[Landing + reveal link form]
    Reveal[/r/:token reveal page]
    EventInfo[/event/:id event status]
  end

  subgraph admin [Organizer area]
    Auth[Login/register]
    Events[Events list]
    Detail[Event detail dashboard]
    Share[WhatsApp/link actions]
  end

  subgraph api [Next.js API routes]
    AdminAPI[/api/admin/*]
    RevealAPI[/api/reveal/:token]
    PreviewAPI[draw-preview + people-summary]
  end

  subgraph services [Server services]
    Matching[matching engine]
    EventSvc[events service]
    PeopleSvc[people service]
    Session[JWT session service]
  end

  subgraph data [PostgreSQL]
    Prisma[(Prisma models)]
  end

  Home --> Reveal
  EventInfo --> Prisma
  Reveal --> PeopleSvc
  Auth --> AdminAPI
  Events --> AdminAPI
  Detail --> AdminAPI
  Share --> Detail
  AdminAPI --> EventSvc
  AdminAPI --> PeopleSvc
  PreviewAPI --> Matching
  EventSvc --> Matching
  EventSvc --> Prisma
  PeopleSvc --> Prisma
  Session --> AdminAPI
  RevealAPI --> PeopleSvc
```

## App layout

| Area | Path | Role |
|------|------|------|
| Public landing | `src/app/page.tsx` | Explains the flow and accepts private reveal links |
| Reveal page | `src/app/r/[token]/page.tsx` | Shows pending, incomplete, or revealed result for one participant |
| Event status | `src/app/event/[id]/page.tsx` | Public event status without participant data |
| Admin auth | `src/app/admin/page.tsx`, `src/app/admin/register/page.tsx` | Organizer login and registration |
| Admin events | `src/app/admin/events/` | Event list and event detail dashboard |
| API routes | `src/app/api/` | Authenticated admin APIs plus reveal lookup |
| Services | `src/server/services/` | Prisma access, matching, auth, draw preview |
| Shared UI/helpers | `src/components/`, `src/lib/` | Client components, API client, URL/message helpers |

## Data model

| Model | Purpose |
|-------|---------|
| `Organizer` | Admin user with email, name, and password hash |
| `Event` | Secret Santa event owned by an organizer |
| `EventGroup` | Optional family/group bucket for grouped draws |
| `EventPeople` | Participant, reveal token, sent-link status, and matched participant relation |

Assignments are stored with `EventPeople.matched_person_id`, a self-relation back to another participant. Reveal links use `EventPeople.reveal_token`, which is unique and not derived from personal data.

## Draw lifecycle

1. **Create event** - organizer chooses title, description, and grouped mode.
2. **Add groups** - ungrouped events use a default group; grouped events can have multiple families/groups.
3. **Add participants** - each participant receives a unique reveal token at creation.
4. **Preview draw** - `GET /api/admin/events/[id]/draw-preview` checks participant counts, grouped feasibility, and warnings.
5. **Run draw** - `PUT /api/admin/events/[id]` with `status: true` creates a one-to-one assignment for every participant.
6. **Lock editing** - participant/group edits are blocked while the event is drawn.
7. **Share links** - organizer copies links/messages or opens WhatsApp, then marks links as sent.
8. **Reveal** - participant opens `/r/{token}` and sees only their assigned person.
9. **Reset if needed** - organizer can clear assignments and unlock editing.

## Matching engine

`src/server/services/matching.ts` uses randomized backtracking:

- every giver receives exactly one receiver
- nobody draws themself
- every receiver is used once
- grouped events block same-group assignments
- impossible compositions return `null` instead of partial assignments

The same logic powers both the actual draw and the preview panel.

## API surface

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/admin/register` | POST | Create organizer and set session cookie |
| `/api/admin/login` | POST | Authenticate organizer |
| `/api/admin/logout` | POST | Clear session cookie |
| `/api/admin/ping` | GET | Validate session and return organizer profile |
| `/api/admin/events` | GET, POST | List/create organizer events |
| `/api/admin/events/[id]` | GET, PUT, DELETE | Read/update/delete event; run/reset draw through `status` |
| `/api/admin/events/[id]/draw-preview` | GET | Validate draw feasibility |
| `/api/admin/events/[id]/people-summary` | GET | Link-sent counts across lazily loaded groups |
| `/api/admin/groups/[idEvent]` | GET, POST | List/create groups |
| `/api/admin/groups/[idEvent]/[id]` | GET, PUT, DELETE | Manage one group |
| `/api/admin/people/[idEvent]/[idGroup]` | GET, POST | List/create participants |
| `/api/admin/people/[idEvent]/[idGroup]/[id]` | GET, PUT, DELETE | Manage participant and sent-link status |
| `/api/reveal/[token]` | GET | Resolve one private reveal link |
| `/api/ping` | GET | Public health check |

## Privacy boundaries

- Public event pages expose only selected event fields.
- Reveal pages are marked `noindex`.
- Participant results are only available through reveal tokens.
- Admin APIs require a signed HTTP-only session cookie.
- Share links use `NEXT_PUBLIC_APP_URL` when configured so copied messages contain stable public URLs.

## Testing

Vitest currently covers the matching engine: two-person draws, grouped valid/invalid cases, dominant group failures, and repeated reruns. API routes and database flows are verified through `npm run build` and manual app flows.
