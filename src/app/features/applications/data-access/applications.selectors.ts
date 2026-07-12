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
