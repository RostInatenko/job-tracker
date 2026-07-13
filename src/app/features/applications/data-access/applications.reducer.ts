import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { JobApplication, MovePayload } from './application.model';
import { MOCK_APPLICATIONS } from './mock-applications';
import { ApplicationsActions } from './applications.actions';
import { groupByStatus } from './group-by-status';
import { applyMove, invertMove } from './apply-move';

export interface LastMove extends MovePayload {
  applicationId: string;
  company: string;
}

export interface ApplicationsState extends EntityState<JobApplication> {
  lastMove: LastMove | null;
}

export const applicationsAdapter = createEntityAdapter<JobApplication>();

export const initialApplicationsState: ApplicationsState = {
  ...applicationsAdapter.setAll(MOCK_APPLICATIONS, applicationsAdapter.getInitialState()),
  lastMove: null,
};

export const applicationsReducer = createReducer(
  initialApplicationsState,
  on(ApplicationsActions.applicationMoved, (state, move) => {
    const applications = applicationsAdapter.getSelectors().selectAll(state);
    const movedApplication = groupByStatus(applications)[move.previousStatus][move.previousIndex];

    const reordered = applyMove(applications, move);

    return {
      ...applicationsAdapter.setAll(reordered, state),
      lastMove: {
        ...move,
        applicationId: movedApplication.id,
        company: movedApplication.company,
      },
    };
  }),
  on(ApplicationsActions.undoLastMove, (state) => {
    if (!state.lastMove) {
      return state;
    }

    const applications = applicationsAdapter.getSelectors().selectAll(state);
    const reordered = applyMove(applications, invertMove(state.lastMove));

    return {
      ...applicationsAdapter.setAll(reordered, state),
      lastMove: null,
    };
  }),
  on(ApplicationsActions.lastMoveCleared, (state) => ({
    ...state,
    lastMove: null,
  })),
  on(ApplicationsActions.applicationAdded, (state, { application }) => ({
    ...applicationsAdapter.addOne(application, state),
    lastMove: null,
  })),
  on(ApplicationsActions.applicationUpdated, (state, { application }) => ({
    ...applicationsAdapter.setOne(application, state),
    lastMove: null,
  })),
  on(ApplicationsActions.applicationDeleted, (state, { id }) => ({
    ...applicationsAdapter.removeOne(id, state),
    lastMove: null,
  })),
);
