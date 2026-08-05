import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { APPLICATIONS_FEATURE_KEY } from './features/applications/data-access/applications.selectors';
import { applicationsReducer } from './features/applications/data-access/applications.reducer';
import { ApplicationsEffects } from './features/applications/data-access/applications.effects';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/feature/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/feature/register-page/register-page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    providers: [
      provideState(APPLICATIONS_FEATURE_KEY, applicationsReducer),
      provideEffects(ApplicationsEffects),
    ],
    loadComponent: () =>
      import('./features/applications/feature/board-page/board-page').then((m) => m.BoardPage),
  },
  {
    path: 'stats',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/applications/feature/stats-page/stats-page').then((m) => m.StatsPage),
  },
  {
    path: 'archived',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/applications/feature/archived-page/archived-page').then(
        (m) => m.ArchivedPage,
      ),
  },
];
