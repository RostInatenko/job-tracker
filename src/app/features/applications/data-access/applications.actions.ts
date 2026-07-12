import { createActionGroup, props } from '@ngrx/store';
import { ApplicationStatus } from './application.model';

export const ApplicationsActions = createActionGroup({
  source: 'Applications',
  events: {
    'Application Moved': props<{
      status: ApplicationStatus;
      previousStatus: ApplicationStatus;
      previousIndex: number;
      currentIndex: number;
    }>(),
  },
});
