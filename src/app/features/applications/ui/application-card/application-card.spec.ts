import { TestBed } from '@angular/core/testing';
import { ApplicationCard } from './application-card';
import { JobApplication } from '../../data-access/application.model';

function isoDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

describe('ApplicationCard', () => {
  const mockApplication: JobApplication = {
    id: '1',
    company: 'Nordic Fintech',
    role: 'Mid-level Angular Developer',
    status: 'applied',
    dateApplied: '2026-06-28',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationCard],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(ApplicationCard);
    fixture.componentRef.setInput('application', mockApplication);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the company and role', () => {
    const fixture = createComponent();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nordic Fintech');
    expect(compiled.textContent).toContain('Mid-level Angular Developer');
  });

  it('does not render a link when none is provided', () => {
    const fixture = createComponent();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a');
    expect(link).toBeNull();
  });

  it('emits edit with the application when the card is clicked', () => {
    const fixture = createComponent();
    let emitted: JobApplication | undefined;
    fixture.componentInstance.edit.subscribe((application) => (emitted = application));

    (fixture.nativeElement as HTMLElement).querySelector('article')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );

    expect(emitted).toEqual(mockApplication);
  });

  it('emits edit exactly once when the Edit button is activated', () => {
    const fixture = createComponent();
    let emitCount = 0;
    fixture.componentInstance.edit.subscribe(() => emitCount++);

    const editButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.trim() === 'Edit');
    editButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(emitCount).toBe(1);
  });

  it('renders a work mode badge when set', () => {
    const withWorkMode: JobApplication = { ...mockApplication, workMode: 'hybrid' };
    const fixture = TestBed.createComponent(ApplicationCard);
    fixture.componentRef.setInput('application', withWorkMode);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Hybrid');
  });

  it('does not render a work mode badge when unset', () => {
    const fixture = createComponent();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Office');
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Hybrid');
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Remote');
  });

  it('shows the interview stage time when set', () => {
    const withStage: JobApplication = {
      ...mockApplication,
      interviewStages: [{ stage: 'Tech interview', date: '2026-09-15', time: '14:30' }],
    };
    const fixture = TestBed.createComponent(ApplicationCard);
    fixture.componentRef.setInput('application', withStage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('15/09/2026, 14:30');
  });

  it('falls back to a date-only interview stage badge when no time is set', () => {
    const withStage: JobApplication = {
      ...mockApplication,
      interviewStages: [{ stage: 'Tech interview', date: '2026-09-15' }],
    };
    const fixture = TestBed.createComponent(ApplicationCard);
    fixture.componentRef.setInput('application', withStage);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('15/09/2026');
    expect(text).not.toContain('PM');
    expect(text).not.toContain('AM');
  });

  it('shows a relative label for an interview stage coming up within two weeks', () => {
    const withStage: JobApplication = {
      ...mockApplication,
      interviewStages: [{ stage: 'Tech interview', date: isoDateOffset(3) }],
    };
    const fixture = TestBed.createComponent(ApplicationCard);
    fixture.componentRef.setInput('application', withStage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('in 3 days');
  });

  it('shows a relative label for a recent past interview stage', () => {
    const withStage: JobApplication = {
      ...mockApplication,
      interviewStages: [{ stage: 'HR screen', date: isoDateOffset(-2) }],
    };
    const fixture = TestBed.createComponent(ApplicationCard);
    fixture.componentRef.setInput('application', withStage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('2 days ago');
  });

  it('appends the time to a relative label when the stage has one', () => {
    const withStage: JobApplication = {
      ...mockApplication,
      interviewStages: [{ stage: 'Tech interview', date: isoDateOffset(3), time: '09:30' }],
    };
    const fixture = TestBed.createComponent(ApplicationCard);
    fixture.componentRef.setInput('application', withStage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('in 3 days, 09:30');
  });

  it('includes the exact date and time in the badge tooltip', () => {
    const withStage: JobApplication = {
      ...mockApplication,
      interviewStages: [{ stage: 'Tech interview', date: isoDateOffset(3), time: '09:30' }],
    };
    const fixture = TestBed.createComponent(ApplicationCard);
    fixture.componentRef.setInput('application', withStage);
    fixture.detectChanges();

    const badge = (fixture.nativeElement as HTMLElement).querySelector('[title]');
    expect(badge?.getAttribute('title')).toContain('09:30');
  });

  it('does not emit edit when the posting link is clicked', () => {
    const withLink: JobApplication = { ...mockApplication, link: 'https://example.com/job' };
    const fixture = TestBed.createComponent(ApplicationCard);
    fixture.componentRef.setInput('application', withLink);
    fixture.detectChanges();

    let emitted = false;
    fixture.componentInstance.edit.subscribe(() => (emitted = true));

    (fixture.nativeElement as HTMLElement)
      .querySelector('a')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(emitted).toBe(false);
  });
});
