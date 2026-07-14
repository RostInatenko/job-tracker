import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { APPLICATIONS_FEATURE_KEY } from './features/applications/data-access/applications.selectors';
import { applicationsReducer } from './features/applications/data-access/applications.reducer';
import { ApplicationsEffects } from './features/applications/data-access/applications.effects';

export const routes: Routes = [
  {
    path: '',
    providers: [
      provideState(APPLICATIONS_FEATURE_KEY, applicationsReducer),
      provideEffects(ApplicationsEffects),
    ],
    loadComponent: () =>
      import('./features/applications/feature/board-page/board-page').then((m) => m.BoardPage),
  },
];
