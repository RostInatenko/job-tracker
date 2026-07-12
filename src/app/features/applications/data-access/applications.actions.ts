import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { MovePayload } from './application.model';

export const ApplicationsActions = createActionGroup({
  source: 'Applications',
  events: {
    'Application Moved': props<MovePayload>(),
    'Undo Last Move': emptyProps(),
    'Last Move Cleared': emptyProps(),
  },
});
