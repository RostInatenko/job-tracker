# job-tracker (frontend)

Angular 21 Kanban board for tracking job applications. Backend lives in the sibling repo `../job-tracker-api` (NestJS + Prisma + Postgres).

## Commands

- `npm start` serves on http://localhost:4200, `npm run build` builds, `npm test` runs Vitest through `ng test`.
- `npm start` uses `src/environments/environment.development.ts` (API at http://localhost:3000); production builds use `environment.ts`. Both are committed and hold only the API URL, no secrets.
- The API requires Node 24+. Start it from `../job-tracker-api` with `npm run start:dev`.

## Architecture

- Feature folders: `src/app/features/<feature>/{data-access,feature,ui}`. Every component in `ui/` and `feature/` gets its own subfolder with `.ts`, `.html` and `.spec.ts`. `data-access/` stays flat and feature-prefixed.
- `ui/` components are presentational: inputs and outputs only, no store access. State lives in the `feature/` page components and the NgRx store.
- The `applications` slice uses `@ngrx/entity`. Every mutation is optimistic and has a Succeeded/Failed action pair, with rollback on failure. Keep reducers pure: ids (`crypto.randomUUID()`) and defaults are created in the page component.
- Feature state and effects are registered per route with `provideState` / `provideEffects`, not in `app.config.ts`.
- Auth: access token held in memory, refresh token in an `HttpOnly` cookie. The interceptor attaches the token and retries once through `/auth/refresh` on a 401.
- Zoneless change detection and signals. The edit modal is a reactive form; populate it in `ngOnInit`, not the constructor, because required inputs are not readable earlier.

## Gotchas

- Classes that size a flex or grid child must go on the component tag where it is used. A component's own root element is not the item its parent lays out.
- Board columns are sized by flex, so keep `items-start` on the board row or columns stretch to the tallest one.
- Long unbroken text overflows cards unless `wrap-anywhere` stays on the card.
- Required-field styling is global: `styles.css` turns any `.ng-invalid.ng-touched` input red, and the templates add the asterisk and message.

## Conventions

- Tailwind v4 with the colour tokens in `src/styles.css`. Use the tokens, not raw colours, so dark mode keeps working.
- Commits follow Angular Conventional Commits: `type(scope): summary`.
- Pushing to `master` deploys to GitHub Pages through `.github/workflows/deploy.yml` (`npm ci`, build with `--base-href /job-tracker/`).
