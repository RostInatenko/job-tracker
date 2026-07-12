import { applicationsAdapter, applicationsReducer, ApplicationsState } from './applications.reducer';
import { ApplicationsActions } from './applications.actions';
import { JobApplication } from './application.model';

describe('applicationsReducer', () => {
  const applied: JobApplication = {
    id: '1',
    company: 'Nordic Fintech',
    role: 'Angular Developer',
    status: 'applied',
    dateApplied: '2026-06-28',
  };
  const interview: JobApplication = {
    id: '2',
    company: 'Cobalt Systems',
    role: 'Angular Developer',
    status: 'interview',
    dateApplied: '2026-06-20',
  };

  function createState(applications: JobApplication[]): ApplicationsState {
    return applicationsAdapter.setAll(applications, applicationsAdapter.getInitialState());
  }

  it('moves an application to a different column and updates its status', () => {
    const state = createState([applied, interview]);

    const nextState = applicationsReducer(
      state,
      ApplicationsActions.applicationMoved({
        status: 'interview',
        previousStatus: 'applied',
        previousIndex: 0,
        currentIndex: 0,
      }),
    );

    const moved = applicationsAdapter.getSelectors().selectEntities(nextState)['1'];
    expect(moved?.status).toBe('interview');
  });

  it('reorders applications within the same column', () => {
    const secondApplied: JobApplication = { ...applied, id: '3', company: 'Vantage Health' };
    const state = createState([applied, secondApplied]);

    const nextState = applicationsReducer(
      state,
      ApplicationsActions.applicationMoved({
        status: 'applied',
        previousStatus: 'applied',
        previousIndex: 0,
        currentIndex: 1,
      }),
    );

    const orderedIds = applicationsAdapter
      .getSelectors()
      .selectAll(nextState)
      .map((application) => application.id);
    expect(orderedIds).toEqual(['3', '1']);
  });
});
