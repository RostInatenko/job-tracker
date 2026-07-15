# Job Application Tracker

A Kanban-style board for tracking a job search — drag applications between **Applied → Interview → Offer → Rejected**, add new ones with a quick-add form, edit or delete existing ones, and undo an accidental drag. Built as a hands-on Angular/NgRx portfolio project, backed by a real Supabase database.

**Live demo:** https://rostinatenko.github.io/job-tracker/

## Features

- Drag-and-drop Kanban board with four fixed columns
- Optimistic updates with automatic rollback if a change fails to save
- Undo-after-drag, with a 5-second window before it's committed
- Quick-add form for fast entry, plus a full edit modal for every field
- Persisted to Supabase (Postgres) — refresh the page, your board is still there
- Empty-state messaging per column

## Tech stack

- **Angular 21** (standalone components, zoneless change detection, signals)
- **NgRx** — `@ngrx/store`, `@ngrx/effects`, `@ngrx/entity`
- **Tailwind CSS** for styling
- **Angular CDK** for drag-and-drop and focus management
- **Supabase** (Postgres + auto-generated REST API) for persistence
- **Vitest** for unit tests

## Architecture notes

- Feature-based folder structure (`data-access` / `feature` / `ui`), with one subfolder per UI component.
- The `applications` NgRx slice uses `@ngrx/entity` for the collection, with dedicated actions/reducer cases for every optimistic mutation and its failure-rollback counterpart.
- Presentational components (`board`, `board-column`, `application-card`) hold no state — they only take inputs and emit outputs. All state lives in `board-page.ts` (via the store) or the NgRx store itself.
- Two form styles side by side, deliberately: the quick-add form is template-driven (`ngModel`), the edit modal is reactive (`FormBuilder`).

## Known limitations

These are deliberate scope decisions, not bugs:

- **Single-user, no authentication.** The Supabase table has an open row-level-security policy. Not intended for multi-tenant use.
- **Card order within a column isn't persisted** — only which column a card is in. Reloading may not preserve exact drag order.
- **Keyboard drag-and-drop between columns isn't supported.** Angular CDK provides keyboard support for reordering *within* a list out of the box, but moving an item *between* connected lists via keyboard requires custom logic CDK doesn't provide — out of scope for this project. Editing and deleting applications is fully keyboard-accessible.

## Running locally

```bash
git clone https://github.com/RostInatenko/job-tracker.git
cd job-tracker
npm install
```

Copy the environment template and fill in your own Supabase project's values (Project Settings → API):

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.development.ts
```

You'll also need an `applications` table with an open RLS policy — see the SQL in the project history, or ask.

```bash
npm start
```

## Testing

```bash
npm test
```
