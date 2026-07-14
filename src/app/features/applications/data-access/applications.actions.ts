import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { JobApplication, MovePayload } from './application.model';

export const ApplicationsActions = createActionGroup({
  source: 'Applications',
  events: {
    'Application Moved': props<MovePayload>(),
    'Application Move Succeeded': emptyProps(),
    'Application Move Failed': props<{ move: MovePayload; error: string }>(),
    'Undo Last Move': props<{ applicationId: string }>(),
    'Undo Last Move Succeeded': emptyProps(),
    'Undo Last Move Failed': props<{ error: string }>(),
    'Last Move Cleared': emptyProps(),
    'Application Added': props<{ application: JobApplication }>(),
    'Application Add Succeeded': emptyProps(),
    'Application Add Failed': props<{ application: JobApplication; error: string }>(),
    'Application Updated': props<{ application: JobApplication; previous: JobApplication }>(),
    'Application Update Succeeded': emptyProps(),
    'Application Update Failed': props<{ previous: JobApplication; error: string }>(),
    'Application Deleted': props<{ application: JobApplication }>(),
    'Application Delete Succeeded': emptyProps(),
    'Application Delete Failed': props<{ application: JobApplication; error: string }>(),
    'Load Applications': emptyProps(),
    'Load Applications Success': props<{ applications: JobApplication[] }>(),
    'Load Applications Failure': props<{ error: string }>(),
    'Mutation Error Cleared': emptyProps(),
  },
});
