import { createFeatureSelector, createSelector } from '@ngrx/store';
import { applicationsAdapter, ApplicationsState } from './applications.reducer';
import { groupByStatus } from './group-by-status';

export const APPLICATIONS_FEATURE_KEY = 'applications';

export const selectApplicationsState = createFeatureSelector<ApplicationsState>(
  APPLICATIONS_FEATURE_KEY,
);

const { selectAll } = applicationsAdapter.getSelectors();

export const selectAllApplications = createSelector(selectApplicationsState, selectAll);

export const selectApplicationsByStatus = createSelector(selectAllApplications, groupByStatus);

export const selectLastMove = createSelector(
  selectApplicationsState,
  (state) => state.lastMove,
);

export const selectLoading = createSelector(selectApplicationsState, (state) => state.loading);

export const selectError = createSelector(selectApplicationsState, (state) => state.error);
