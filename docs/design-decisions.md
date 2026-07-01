# Design decisions

This document records **why** secret_santa is shaped the way it is - not just what the code does.

---

## Private links instead of phone lookup

**Context**  
The first version used participant phone numbers as lookup keys. That is convenient, but phone numbers are personal data, easy to mistype, and sometimes guessable inside a family/group.

**Decision**  
Each participant gets a unique reveal token and private link (`/r/{token}`). The organizer sends the link directly, usually through WhatsApp.

**Trade-off**  
The link is a bearer secret: if someone forwards it, the result is visible to the recipient. In return, participants do not need accounts, passwords, or phone-number lookup.

**Revisit when**  
The app needs stronger participant identity, link revocation, or audit logs of who opened a reveal page.

---

## Organizer-led sharing

**Context**  
For family Secret Santa, the organizer usually already has the WhatsApp group or private chats open. A full WhatsApp Business API integration would require app registration, templates, phone setup, and delivery handling.

**Decision**  
The app prepares the workflow: copy link, copy message, open WhatsApp with prefilled text, and mark each participant as sent.

**Trade-off**  
Sending remains manual, but the app avoids external messaging complexity and keeps the UX understandable for a small event.

**Revisit when**  
Automated delivery, reminders, or large event support become project goals.

---

## No participant accounts

**Context**  
The participant side should be frictionless. In a family setting, asking everyone to register just to see one name would make the product feel heavier than the problem.

**Decision**  
Only organizers have accounts. Participants open private reveal links.

**Trade-off**  
There is no participant-level authentication or history. This is acceptable for a short-lived social event.

**Revisit when**  
Participants need wishlists, RSVP, gift preferences, or editable profiles.

---

## Relational match storage

**Context**  
Encoding a matched participant id in a text field is hard to validate and not actually secure if database rows are visible.

**Decision**  
Store assignments as `matched_person_id`, a self-relation on `EventPeople`.

**Trade-off**  
The schema is slightly more explicit and needs migrations, but queries are safer and easier to reason about.

**Revisit when**  
Assignment history, multiple redraws, or audit snapshots are needed.

---

## Randomized backtracking for draws

**Context**  
Grouped Secret Santa has constraints: no self-match, one receiver per giver, and optionally no same-group matches. Simple shuffling can fail often when group sizes are uneven.

**Decision**  
Use randomized backtracking to search for a complete valid assignment. The preview panel and the actual draw use the same matching rules.

**Trade-off**  
Backtracking is more complex than a single shuffle, but it handles constrained events reliably at family-sized scale.

**Revisit when**  
Events grow large enough to need a deterministic bipartite matching algorithm or stricter performance guarantees.

---

## Lock event edits after draw

**Context**  
If participants or groups change after assignments are generated, existing links may reveal stale or unfair results.

**Decision**  
When an event is drawn, participant/group edits are blocked. The organizer must reset the draw before editing.

**Trade-off**  
This adds one step for corrections, but protects the integrity of the draw and makes state easier to explain.

**Revisit when**  
Partial redraws or late participant replacement become requirements.

---

## Draw preview before commit

**Context**  
Grouped draws can be impossible, especially when one group has more than half the participants.

**Decision**  
Show participant counts, group counts, warnings, and blocking errors before the organizer confirms the draw.

**Trade-off**  
The preview runs matching logic before the final draw, but family-sized events are small enough that this is cheap.

**Revisit when**  
The app supports very large events or more constraints like exclusions between specific people.

---

## Mobile-first organizer workflow

**Context**  
The organizer will likely create the event and send messages from a phone, especially if WhatsApp is the sharing channel.

**Decision**  
Use touch-sized controls, responsive participant lists, collapsible groups, and a sticky mobile action bar for adding participants and running the draw.

**Trade-off**  
Some admin actions are duplicated between desktop cards and mobile bottom actions, but the common phone workflow is faster.

**Revisit when**  
Desktop-heavy workflows like bulk import/export become more important.

---

## People summary endpoint for lazy groups

**Context**  
Grouped events can lazily load each group's participant list to keep the UI lighter. But sent-link totals should still reflect the whole event.

**Decision**  
Expose `GET /api/admin/events/[id]/people-summary` for aggregate participant and sent counts.

**Trade-off**  
One extra API route, but the UI can show accurate progress before every group is opened.

**Revisit when**  
The event detail page moves to server components or loads all groups in one optimized query.

---

## JWT session cookie

**Context**  
The app needs simple organizer auth without adding a full auth provider or OAuth setup.

**Decision**  
Use email/password with `scrypt` password hashing and a signed JWT stored in an HTTP-only cookie.

**Trade-off**  
Session invalidation is coarse because tokens are stateless. Fine for a small portfolio/family app.

**Revisit when**  
Password reset, email verification, multi-device session management, or OAuth login are needed.

---

## Manual migrations

**Context**  
This is a compact portfolio project with a single Next.js app and Prisma/PostgreSQL.

**Decision**  
Keep Prisma migrations in `prisma/migrations` and run them explicitly with `npm run db:migrate`.

**Trade-off**  
Deployment needs a deliberate migration step. In return, schema changes are visible and reviewable.

**Revisit when**  
CI/CD should run reviewed migrations automatically before deploy.
