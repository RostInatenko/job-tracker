# Job Application Tracker

A Kanban-style board for tracking a job search — drag applications between **Applied → Interview → Offer → Rejected**, add new ones with a quick-add form, edit or delete existing ones, undo an accidental drag, or prefill the form by pasting a job posting and letting AI extract the fields. Built as a hands-on Angular/NgRx portfolio project, backed by [job-tracker-api](https://github.com/RostInatenko/job-tracker-api), a companion NestJS + Postgres backend.

**Live demo:** https://rostinatenko.github.io/job-tracker/

## Features

- Drag-and-drop Kanban board with four fixed columns
- Optimistic updates with automatic rollback if a change fails to save
- Undo-after-drag, with a 5-second window before it's committed
- Quick-add form for fast entry, plus a full edit modal for every field
- Paste a job posting and let AI (Gemini) prefill the add-application form — company, role, tech stack, salary, link, and work mode
- Account-based, multi-user — sign up, log in, and your board is yours alone
- Persisted to Postgres via the job-tracker-api backend — refresh the page, your board is still there
- Empty-state messaging per column

## Tech stack

- **Angular 21** (standalone components, zoneless change detection, signals)
- **NgRx** — `@ngrx/store`, `@ngrx/effects`, `@ngrx/entity`
- **Tailwind CSS** for styling
- **Angular CDK** for drag-and-drop and focus management
- **Vitest** for unit tests
- Backend: **NestJS** + **Prisma/Postgres**, JWT auth (access + refresh tokens), Gemini for AI prefill — see [job-tracker-api](https://github.com/RostInatenko/job-tracker-api)

## Architecture notes

- Feature-based folder structure (`data-access` / `feature` / `ui`), with one subfolder per UI component.
- The `applications` NgRx slice uses `@ngrx/entity` for the collection, with dedicated actions/reducer cases for every optimistic mutation and its failure-rollback counterpart.
- Presentational components (`board`, `board-column`, `application-card`) hold no state — they only take inputs and emit outputs. All state lives in `board-page.ts` (via the store) or the NgRx store itself.
- Two form styles side by side, deliberately: the quick-add form is template-driven (`ngModel`), the edit modal is reactive (`FormBuilder`).
- Auth is handled by a short-lived access token (kept in memory) plus an `HttpOnly` refresh cookie; an HTTP interceptor attaches the access token and retries once through `/auth/refresh` on a 401.

## Known limitations

These are deliberate scope decisions, not bugs:

- **Card order within a column isn't persisted** — only which column a card is in. Reloading may not preserve exact drag order.
- **Keyboard drag-and-drop between columns isn't supported.** Angular CDK provides keyboard support for reordering *within* a list out of the box, but moving an item *between* connected lists via keyboard requires custom logic CDK doesn't provide — out of scope for this project. Editing and deleting applications is fully keyboard-accessible.
- **AI prefill is capped at 10 requests per user per day** to keep the shared Gemini API key's usage in check.

## Running locally

This app needs the [job-tracker-api](https://github.com/RostInatenko/job-tracker-api) backend running too — set that up first (it needs its own Postgres database and a Gemini API key for the AI prefill feature).

```bash
git clone https://github.com/RostInatenko/job-tracker.git
cd job-tracker
npm install
```

Copy the environment template and point it at your local API instance:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.development.ts
```

```bash
npm start
```

## Testing

```bash
npm test
```
