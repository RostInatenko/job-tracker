import { TestBed } from '@angular/core/testing';
import { ApplicationCard } from './application-card';
import { JobApplication } from '../../data-access/application.model';

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
