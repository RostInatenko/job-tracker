import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';
import { ApplicationsActions } from './applications.actions';
import { ApplicationsService } from './applications.service';
import { selectApplicationEntities, selectLastMove } from './applications.selectors';
import { MovePayload } from './application.model';

function toErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return 'Something went wrong. Please try again.';
}

@Injectable()
export class ApplicationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly applicationsService = inject(ApplicationsService);
  private readonly store = inject(Store);

  loadApplications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApplicationsActions.loadApplications),
      switchMap(() =>
        this.applicationsService.getAll().pipe(
          map((applications) => ApplicationsActions.loadApplicationsSuccess({ applications })),
          catchError((error: unknown) =>
            of(ApplicationsActions.loadApplicationsFailure({ error: toErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  addApplication$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApplicationsActions.applicationAdded),
      mergeMap(({ application }) =>
        this.applicationsService.add(application).pipe(
          map(() => ApplicationsActions.applicationAddSucceeded()),
          catchError((error: unknown) =>
            of(
              ApplicationsActions.applicationAddFailed({
                application,
                error: toErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  persistMove$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApplicationsActions.applicationMoved),
      withLatestFrom(
        this.store.select(selectLastMove),
        this.store.select(selectApplicationEntities),
      ),
      mergeMap(([{ status, previousStatus, previousIndex, currentIndex }, lastMove, entities]) => {
        const application = lastMove ? entities[lastMove.applicationId] : undefined;
        const move: MovePayload = { status, previousStatus, previousIndex, currentIndex };

        if (!application) {
          return EMPTY;
        }

        return this.applicationsService.update(application).pipe(
          map(() => ApplicationsActions.applicationMoveSucceeded()),
          catchError((error: unknown) =>
            of(ApplicationsActions.applicationMoveFailed({ move, error: toErrorMessage(error) })),
          ),
        );
      }),
    ),
  );

  persistUndo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApplicationsActions.undoLastMove),
      withLatestFrom(this.store.select(selectApplicationEntities)),
      mergeMap(([{ applicationId }, entities]) => {
        const application = entities[applicationId];

        if (!application) {
          return EMPTY;
        }

        return this.applicationsService.update(application).pipe(
          map(() => ApplicationsActions.undoLastMoveSucceeded()),
          catchError((error: unknown) =>
            of(ApplicationsActions.undoLastMoveFailed({ error: toErrorMessage(error) })),
          ),
        );
      }),
    ),
  );

  updateApplication$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApplicationsActions.applicationUpdated),
      mergeMap(({ application, previous }) =>
        this.applicationsService.update(application).pipe(
          map(() => ApplicationsActions.applicationUpdateSucceeded()),
          catchError((error: unknown) =>
            of(
              ApplicationsActions.applicationUpdateFailed({
                previous,
                error: toErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  deleteApplication$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApplicationsActions.applicationDeleted),
      mergeMap(({ application }) =>
        this.applicationsService.delete(application.id).pipe(
          map(() => ApplicationsActions.applicationDeleteSucceeded()),
          catchError((error: unknown) =>
            of(
              ApplicationsActions.applicationDeleteFailed({
                application,
                error: toErrorMessage(error),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
