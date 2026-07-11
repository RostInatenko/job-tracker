import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/applications/feature/board-page/board-page').then((m) => m.BoardPage),
  },
];
