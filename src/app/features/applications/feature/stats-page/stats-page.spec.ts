import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { StatsPage } from './stats-page';
import { ApplicationsService } from '../../data-access/applications.service';
import { ApplicationStats } from '../../data-access/application.model';

describe('StatsPage', () => {
  const stats: ApplicationStats = {
    totalApplications: 4,
    responseRate: 50,
    avgDaysToFirstInterview: 2.5,
    avgInterviewStageCount: 1.5,
    topTechStack: [
      { tech: 'React', count: 2 },
      { tech: 'TypeScript', count: 2 },
    ],
    statusBreakdown: [
      { status: 'applied', count: 2 },
      { status: 'interview', count: 1 },
      { status: 'offer', count: 1 },
      { status: 'rejected', count: 0 },
    ],
    staleApplicationsCount: 1,
    rejectionBreakdown: [
      { category: 'ghostedBeforeInterview', count: 0 },
      { category: 'rejectedBeforeInterview', count: 0 },
      { category: 'ghostedAfterInterview', count: 0 },
      { category: 'rejectedAfterInterview', count: 0 },
      { category: 'unknown', count: 0 },
    ],
  };

  function configure(applicationsServiceStub: Partial<ApplicationsService>) {
    TestBed.configureTestingModule({
      imports: [StatsPage],
      providers: [
        provideRouter([]),
        { provide: ApplicationsService, useValue: applicationsServiceStub },
      ],
    });
  }

  it('shows a loading state while stats are being fetched', () => {
    const pending = new Subject<ApplicationStats>();
    configure({ getStats: () => pending.asObservable() });
    const fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Loading stats');
  });

  it('renders the fetched stats', () => {
    configure({ getStats: () => of(stats) });
    const fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('50%');
    expect(text).toContain('2.5');
    expect(text).toContain('1.5');
    expect(text).toContain('React');
    expect(text).toContain('Interview');
  });

  it('does not render a rejection breakdown section when there are no rejections', () => {
    configure({ getStats: () => of(stats) });
    const fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain(
      'Rejection breakdown',
    );
  });

  it('renders non-zero rejection breakdown categories', () => {
    const statsWithRejections: ApplicationStats = {
      ...stats,
      rejectionBreakdown: [
        { category: 'ghostedBeforeInterview', count: 2 },
        { category: 'rejectedBeforeInterview', count: 0 },
        { category: 'ghostedAfterInterview', count: 0 },
        { category: 'rejectedAfterInterview', count: 1 },
        { category: 'unknown', count: 0 },
      ],
    };
    configure({ getStats: () => of(statsWithRejections) });
    const fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Rejection breakdown');
    expect(text).toContain('No response, before interview');
    expect(text).toContain('Rejected, after interview');
    expect(text).not.toContain('No response, after interview');
  });

  it('shows an error state with a retry option when loading fails', () => {
    configure({ getStats: () => throwError(() => new Error('network error')) });
    const fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Could not load stats');

    const retryButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.trim() === 'Retry');
    expect(retryButton).toBeTruthy();
  });

  it('retries loading when the retry button is clicked', () => {
    let callCount = 0;
    configure({
      getStats: () => {
        callCount++;
        return callCount === 1 ? throwError(() => new Error('network error')) : of(stats);
      },
    });
    const fixture = TestBed.createComponent(StatsPage);
    fixture.detectChanges();

    fixture.componentInstance['onRetry']();
    fixture.detectChanges();

    expect(callCount).toBe(2);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('50%');
  });
});
