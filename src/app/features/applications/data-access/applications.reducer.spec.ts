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
    return {
      ...applicationsAdapter.setAll(applications, applicationsAdapter.getInitialState()),
      lastMove: null,
    };
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

  it('reverses the last move and clears it on undo', () => {
    const state = createState([applied, interview]);
    const movedState = applicationsReducer(
      state,
      ApplicationsActions.applicationMoved({
        status: 'interview',
        previousStatus: 'applied',
        previousIndex: 0,
        currentIndex: 0,
      }),
    );

    const undoneState = applicationsReducer(movedState, ApplicationsActions.undoLastMove());

    const moved = applicationsAdapter.getSelectors().selectEntities(undoneState)['1'];
    expect(moved?.status).toBe('applied');
    expect(undoneState.lastMove).toBeNull();
  });

  it('does nothing when undoing with no last move', () => {
    const state = createState([applied, interview]);

    const nextState = applicationsReducer(state, ApplicationsActions.undoLastMove());

    expect(nextState).toBe(state);
  });

  it('clears the last move without changing entities', () => {
    const state = createState([applied, interview]);
    const movedState = applicationsReducer(
      state,
      ApplicationsActions.applicationMoved({
        status: 'interview',
        previousStatus: 'applied',
        previousIndex: 0,
        currentIndex: 0,
      }),
    );

    const clearedState = applicationsReducer(movedState, ApplicationsActions.lastMoveCleared());

    expect(clearedState.lastMove).toBeNull();
    expect(applicationsAdapter.getSelectors().selectEntities(clearedState)['1']?.status).toBe(
      'interview',
    );
  });
});
