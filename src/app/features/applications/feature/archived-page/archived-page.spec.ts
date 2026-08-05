import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ArchivedPage } from './archived-page';
import { ApplicationsService } from '../../data-access/applications.service';
import { JobApplication } from '../../data-access/application.model';

describe('ArchivedPage', () => {
  const archivedApplication: JobApplication = {
    id: '1',
    company: 'Nordic Fintech',
    role: 'Angular Developer',
    status: 'rejected',
    dateApplied: '2026-06-28',
    archived: true,
  };

  function configure(applicationsServiceStub: Partial<ApplicationsService>) {
    TestBed.configureTestingModule({
      imports: [ArchivedPage],
      providers: [
        provideRouter([]),
        { provide: ApplicationsService, useValue: applicationsServiceStub },
      ],
    });
  }

  it('shows a loading state while archived applications are being fetched', () => {
    const pending = new Subject<JobApplication[]>();
    configure({ getArchived: () => pending.asObservable() });
    const fixture = TestBed.createComponent(ArchivedPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Loading archived applications',
    );
  });

  it('renders the fetched archived applications', () => {
    configure({ getArchived: () => of([archivedApplication]) });
    const fixture = TestBed.createComponent(ArchivedPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nordic Fintech');
  });

  it('shows an empty state when there are no archived applications', () => {
    configure({ getArchived: () => of([]) });
    const fixture = TestBed.createComponent(ArchivedPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No archived applications yet',
    );
  });

  it('shows an error state with a retry option when loading fails', () => {
    configure({ getArchived: () => throwError(() => new Error('network error')) });
    const fixture = TestBed.createComponent(ArchivedPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Could not load archived applications',
    );
  });

  it('removes an application from the list once it is unarchived and saved', () => {
    configure({
      getArchived: () => of([archivedApplication]),
      update: () => of(undefined),
    });
    const fixture = TestBed.createComponent(ArchivedPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component['onEdit'](archivedApplication);
    component['onSaveEdit']({ ...archivedApplication, archived: false });

    expect(component['applications']()).toEqual([]);
    expect(component['editingApplication']()).toBeNull();
  });

  it('removes an application from the list when deleted', () => {
    configure({
      getArchived: () => of([archivedApplication]),
      delete: () => of(undefined),
    });
    const fixture = TestBed.createComponent(ArchivedPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component['onEdit'](archivedApplication);
    component['onDeleteEdit']();

    expect(component['applications']()).toEqual([]);
    expect(component['editingApplication']()).toBeNull();
  });
});
