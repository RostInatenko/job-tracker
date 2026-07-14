import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { ApplicationsEffects } from './applications.effects';
import { ApplicationsActions } from './applications.actions';
import { ApplicationsService } from './applications.service';
import { JobApplication } from './application.model';

describe('ApplicationsEffects', () => {
  const application: JobApplication = {
    id: '1',
    company: 'Nordic Fintech',
    role: 'Angular Developer',
    status: 'applied',
    dateApplied: '2026-06-28',
  };

  let actions$: Observable<unknown>;
  let applicationsService: { getAll: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    applicationsService = { getAll: vi.fn() };
  });

  function createEffects(): ApplicationsEffects {
    TestBed.configureTestingModule({
      providers: [
        ApplicationsEffects,
        provideMockActions(() => actions$),
        { provide: ApplicationsService, useValue: applicationsService },
      ],
    });

    return TestBed.inject(ApplicationsEffects);
  }

  it('maps a successful load to loadApplicationsSuccess', async () => {
    applicationsService.getAll.mockReturnValue(of([application]));
    actions$ = of(ApplicationsActions.loadApplications());

    const effects = createEffects();
    const result = await firstValueFrom(effects.loadApplications$);

    expect(result).toEqual(
      ApplicationsActions.loadApplicationsSuccess({ applications: [application] }),
    );
  });

  it('maps a failed load to loadApplicationsFailure', async () => {
    applicationsService.getAll.mockReturnValue(throwError(() => new Error('network error')));
    actions$ = of(ApplicationsActions.loadApplications());

    const effects = createEffects();
    const result = await firstValueFrom(effects.loadApplications$);

    expect(result).toEqual(
      ApplicationsActions.loadApplicationsFailure({ error: 'network error' }),
    );
  });
});
