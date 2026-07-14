import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ApplicationsActions } from './applications.actions';
import { ApplicationsService } from './applications.service';

function toErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return 'Something went wrong loading your applications.';
}

@Injectable()
export class ApplicationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly applicationsService = inject(ApplicationsService);

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
}
