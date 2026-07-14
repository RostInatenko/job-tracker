import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideState, provideStore, Store } from '@ngrx/store';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { ApplicationsEffects } from './applications.effects';
import { ApplicationsActions } from './applications.actions';
import { ApplicationsService } from './applications.service';
import { JobApplication } from './application.model';
import { APPLICATIONS_FEATURE_KEY } from './applications.selectors';
import { applicationsReducer } from './applications.reducer';

describe('ApplicationsEffects', () => {
  const application: JobApplication = {
    id: '1',
    company: 'Nordic Fintech',
    role: 'Angular Developer',
    status: 'applied',
    dateApplied: '2026-06-28',
  };

  let actions$: Observable<unknown>;
  let applicationsService: {
    getAll: ReturnType<typeof vi.fn>;
    add: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    applicationsService = { getAll: vi.fn(), add: vi.fn(), update: vi.fn() };
  });

  function createEffects(): { effects: ApplicationsEffects; store: Store } {
    TestBed.configureTestingModule({
      providers: [
        provideStore(),
        provideState(APPLICATIONS_FEATURE_KEY, applicationsReducer),
        ApplicationsEffects,
        provideMockActions(() => actions$),
        { provide: ApplicationsService, useValue: applicationsService },
      ],
    });

    return { effects: TestBed.inject(ApplicationsEffects), store: TestBed.inject(Store) };
  }

  it('maps a successful load to loadApplicationsSuccess', async () => {
    applicationsService.getAll.mockReturnValue(of([application]));
    actions$ = of(ApplicationsActions.loadApplications());

    const { effects } = createEffects();
    const result = await firstValueFrom(effects.loadApplications$);

    expect(result).toEqual(
      ApplicationsActions.loadApplicationsSuccess({ applications: [application] }),
    );
  });

  it('maps a failed load to loadApplicationsFailure', async () => {
    applicationsService.getAll.mockReturnValue(throwError(() => new Error('network error')));
    actions$ = of(ApplicationsActions.loadApplications());

    const { effects } = createEffects();
    const result = await firstValueFrom(effects.loadApplications$);

    expect(result).toEqual(ApplicationsActions.loadApplicationsFailure({ error: 'network error' }));
  });

  it('maps a successful add to applicationAddSucceeded', async () => {
    applicationsService.add.mockReturnValue(of(undefined));
    actions$ = of(ApplicationsActions.applicationAdded({ application }));

    const { effects } = createEffects();
    const result = await firstValueFrom(effects.addApplication$);

    expect(result).toEqual(ApplicationsActions.applicationAddSucceeded());
    expect(applicationsService.add).toHaveBeenCalledWith(application);
  });

  it('maps a failed add to applicationAddFailed', async () => {
    applicationsService.add.mockReturnValue(throwError(() => new Error('network error')));
    actions$ = of(ApplicationsActions.applicationAdded({ application }));

    const { effects } = createEffects();
    const result = await firstValueFrom(effects.addApplication$);

    expect(result).toEqual(
      ApplicationsActions.applicationAddFailed({ application, error: 'network error' }),
    );
  });

  it('persists the moved application using post-reducer state', async () => {
    applicationsService.update.mockReturnValue(of(undefined));
    const movedAction = ApplicationsActions.applicationMoved({
      status: 'interview',
      previousStatus: 'applied',
      previousIndex: 0,
      currentIndex: 0,
    });
    actions$ = of(movedAction);

    const { effects, store } = createEffects();
    store.dispatch(ApplicationsActions.loadApplicationsSuccess({ applications: [application] }));
    store.dispatch(movedAction);

    const result = await firstValueFrom(effects.persistMove$);

    expect(result).toEqual(ApplicationsActions.applicationMoveSucceeded());
    expect(applicationsService.update).toHaveBeenCalledWith({
      ...application,
      status: 'interview',
    });
  });

  it('rolls back with the original move payload when persisting a move fails', async () => {
    applicationsService.update.mockReturnValue(throwError(() => new Error('network error')));
    const movedAction = ApplicationsActions.applicationMoved({
      status: 'interview',
      previousStatus: 'applied',
      previousIndex: 0,
      currentIndex: 0,
    });
    actions$ = of(movedAction);

    const { effects, store } = createEffects();
    store.dispatch(ApplicationsActions.loadApplicationsSuccess({ applications: [application] }));
    store.dispatch(movedAction);

    const result = await firstValueFrom(effects.persistMove$);

    expect(result).toEqual(
      ApplicationsActions.applicationMoveFailed({
        move: {
          status: 'interview',
          previousStatus: 'applied',
          previousIndex: 0,
          currentIndex: 0,
        },
        error: 'network error',
      }),
    );
  });
});
