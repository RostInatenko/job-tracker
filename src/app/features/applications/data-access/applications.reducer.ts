import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { BOARD_COLUMNS, JobApplication } from './application.model';
import { MOCK_APPLICATIONS } from './mock-applications';
import { ApplicationsActions } from './applications.actions';
import { groupByStatus } from './group-by-status';

export type ApplicationsState = EntityState<JobApplication>;

export const applicationsAdapter = createEntityAdapter<JobApplication>();

export const initialApplicationsState: ApplicationsState = applicationsAdapter.setAll(
  MOCK_APPLICATIONS,
  applicationsAdapter.getInitialState(),
);

export const applicationsReducer = createReducer(
  initialApplicationsState,
  on(
    ApplicationsActions.applicationMoved,
    (state, { status, previousStatus, previousIndex, currentIndex }) => {
      const grouped = groupByStatus(applicationsAdapter.getSelectors().selectAll(state));

      const sourceList = [...grouped[previousStatus]];
      const [moved] = sourceList.splice(previousIndex, 1);
      const movedApplication: JobApplication = { ...moved, status };

      if (previousStatus === status) {
        sourceList.splice(currentIndex, 0, movedApplication);
        grouped[status] = sourceList;
      } else {
        const targetList = [...grouped[status]];
        targetList.splice(currentIndex, 0, movedApplication);
        grouped[previousStatus] = sourceList;
        grouped[status] = targetList;
      }

      const reordered = BOARD_COLUMNS.flatMap((column) => grouped[column.status]);
      return applicationsAdapter.setAll(reordered, state);
    },
  ),
);
