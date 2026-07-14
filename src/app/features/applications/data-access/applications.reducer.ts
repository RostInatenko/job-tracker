import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { JobApplication, MovePayload } from './application.model';
import { ApplicationsActions } from './applications.actions';
import { groupByStatus } from './group-by-status';
import { applyMove, invertMove } from './apply-move';

export interface LastMove extends MovePayload {
  applicationId: string;
  company: string;
}

export interface ApplicationsState extends EntityState<JobApplication> {
  lastMove: LastMove | null;
  loading: boolean;
  error: string | null;
  mutationError: string | null;
}

export const applicationsAdapter = createEntityAdapter<JobApplication>();

export const initialApplicationsState: ApplicationsState = {
  ...applicationsAdapter.getInitialState(),
  lastMove: null,
  loading: false,
  error: null,
  mutationError: null,
};

export const applicationsReducer = createReducer(
  initialApplicationsState,
  on(ApplicationsActions.applicationMoved, (state, { status, previousStatus, previousIndex, currentIndex }) => {
    const move: MovePayload = { status, previousStatus, previousIndex, currentIndex };
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
  on(ApplicationsActions.applicationMoveFailed, (state, { move, error }) => {
    const applications = applicationsAdapter.getSelectors().selectAll(state);
    const reordered = applyMove(applications, invertMove(move));

    return {
      ...applicationsAdapter.setAll(reordered, state),
      mutationError: error,
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
  on(ApplicationsActions.undoLastMoveFailed, (state, { error }) => ({
    ...state,
    mutationError: error,
  })),
  on(ApplicationsActions.lastMoveCleared, (state) => ({
    ...state,
    lastMove: null,
  })),
  on(ApplicationsActions.applicationAdded, (state, { application }) => ({
    ...applicationsAdapter.addOne(application, state),
    lastMove: null,
  })),
  on(ApplicationsActions.applicationAddFailed, (state, { application, error }) => ({
    ...applicationsAdapter.removeOne(application.id, state),
    mutationError: error,
  })),
  on(ApplicationsActions.applicationUpdated, (state, { application }) => ({
    ...applicationsAdapter.setOne(application, state),
    lastMove: null,
  })),
  on(ApplicationsActions.applicationUpdateFailed, (state, { previous, error }) => ({
    ...applicationsAdapter.setOne(previous, state),
    mutationError: error,
  })),
  on(ApplicationsActions.applicationDeleted, (state, { application }) => ({
    ...applicationsAdapter.removeOne(application.id, state),
    lastMove: null,
  })),
  on(ApplicationsActions.applicationDeleteFailed, (state, { application, error }) => ({
    ...applicationsAdapter.addOne(application, state),
    mutationError: error,
  })),
  on(ApplicationsActions.mutationErrorCleared, (state) => ({
    ...state,
    mutationError: null,
  })),
  on(ApplicationsActions.loadApplications, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ApplicationsActions.loadApplicationsSuccess, (state, { applications }) => ({
    ...applicationsAdapter.setAll(applications, state),
    loading: false,
  })),
  on(ApplicationsActions.loadApplicationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
