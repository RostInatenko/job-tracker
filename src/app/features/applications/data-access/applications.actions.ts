import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { JobApplication, MovePayload } from './application.model';

export const ApplicationsActions = createActionGroup({
  source: 'Applications',
  events: {
    'Application Moved': props<MovePayload>(),
    'Undo Last Move': emptyProps(),
    'Last Move Cleared': emptyProps(),
    'Application Added': props<{ application: JobApplication }>(),
    'Application Updated': props<{ application: JobApplication }>(),
    'Application Deleted': props<{ id: string }>(),
  },
});
