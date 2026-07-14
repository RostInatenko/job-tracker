import { TestBed } from '@angular/core/testing';
import { BoardPage } from './board-page';
import { By } from '@angular/platform-browser';
import { Store, provideState, provideStore } from '@ngrx/store';
import { Board } from '../../ui/board/board';
import { UndoToast } from '../../ui/undo-toast/undo-toast';
import { QuickAddForm } from '../../ui/quick-add-form/quick-add-form';
import { ApplicationEditModal } from '../../ui/application-edit-modal/application-edit-modal';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { JobApplication } from '../../data-access/application.model';
import { APPLICATIONS_FEATURE_KEY } from '../../data-access/applications.selectors';
import { applicationsReducer } from '../../data-access/applications.reducer';
import { ApplicationsActions } from '../../data-access/applications.actions';

const testApplications: JobApplication[] = [
  {
    id: '1',
    company: 'Nordic Fintech',
    role: 'Angular Developer',
    status: 'applied',
    dateApplied: '2026-06-28',
  },
];

describe('BoardPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardPage],
      providers: [provideStore(), provideState(APPLICATIONS_FEATURE_KEY, applicationsReducer)],
    }).compileComponents();
  });

  function createLoadedFixture() {
    const fixture = TestBed.createComponent(BoardPage);
    fixture.detectChanges();

    const store = TestBed.inject(Store);
    store.dispatch(ApplicationsActions.loadApplicationsSuccess({ applications: testApplications }));
    fixture.detectChanges();

    return fixture;
  }

  it('should create', () => {
    const fixture = TestBed.createComponent(BoardPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows a loading message before the applications arrive', () => {
    const fixture = TestBed.createComponent(BoardPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Loading');
    expect(fixture.debugElement.query(By.directive(Board))).toBeNull();
  });

  it('shows an error with a retry option when loading fails', () => {
    const fixture = TestBed.createComponent(BoardPage);
    fixture.detectChanges();

    const store = TestBed.inject(Store);
    store.dispatch(ApplicationsActions.loadApplicationsFailure({ error: 'network error' }));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('network error');

    const retryButton = fixture.debugElement
      .queryAll(By.css('button'))
      .find((button) => button.nativeElement.textContent.trim() === 'Retry');
    retryButton?.nativeElement.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Loading');
  });

  it('moves the application into the target column and out of the source column', () => {
    const fixture = createLoadedFixture();
    const boardDebugEl = fixture.debugElement.query(By.directive(Board));
    const payload = { status: 'interview', event: { previousContainer: { id: 'applied' }, previousIndex: 0, currentIndex: 0 } as CdkDragDrop<JobApplication[]> };

    boardDebugEl.triggerEventHandler('dropped', payload);
    fixture.detectChanges();

    const board = boardDebugEl.componentInstance as Board;
    expect(
      board.applicationsByStatus().interview.some((application) => application.id === '1'),
    ).toBe(true);
    expect(board.applicationsByStatus().applied.some((application) => application.id === '1')).toBe(
      false,
    );
  });

  it('shows an undo toast after a move and reverses it on click', () => {
    const fixture = createLoadedFixture();
    const boardDebugEl = fixture.debugElement.query(By.directive(Board));
    const payload = {
      status: 'interview',
      event: {
        previousContainer: { id: 'applied' },
        previousIndex: 0,
        currentIndex: 0,
      } as CdkDragDrop<JobApplication[]>,
    };

    boardDebugEl.triggerEventHandler('dropped', payload);
    fixture.detectChanges();

    const toastButton = fixture.debugElement
      .query(By.directive(UndoToast))
      .query(By.css('button'));
    toastButton.nativeElement.click();
    fixture.detectChanges();

    const board = boardDebugEl.componentInstance as Board;
    expect(board.applicationsByStatus().applied.some((application) => application.id === '1')).toBe(
      true,
    );
    expect(fixture.debugElement.query(By.directive(UndoToast))).toBeNull();
  });

  it('adds a new application from the quick-add form', () => {
    const fixture = createLoadedFixture();

    const quickAddDebugEl = fixture.debugElement.query(By.directive(QuickAddForm));
    quickAddDebugEl.triggerEventHandler('added', { company: 'Vantage Health', role: 'Frontend Engineer' });
    fixture.detectChanges();

    const boardDebugEl = fixture.debugElement.query(By.directive(Board));
    const board = boardDebugEl.componentInstance as Board;
    expect(
      board
        .applicationsByStatus()
        .applied.some(
          (application) => application.company === 'Vantage Health' && application.role === 'Frontend Engineer',
        ),
    ).toBe(true);
  });

  it('opens the edit modal for a clicked card and saves changes', () => {
    const fixture = createLoadedFixture();
    const boardDebugEl = fixture.debugElement.query(By.directive(Board));

    boardDebugEl.triggerEventHandler('edit', {
      id: '1',
      company: 'Nordic Fintech',
      role: 'Angular Developer',
      status: 'applied',
      dateApplied: '2026-06-28',
    } satisfies JobApplication);
    fixture.detectChanges();

    const modalDebugEl = fixture.debugElement.query(By.directive(ApplicationEditModal));
    expect(modalDebugEl).toBeTruthy();

    const modal = modalDebugEl.componentInstance as ApplicationEditModal;
    modal.save.emit({
      id: '1',
      company: 'Nordic Fintech Renamed',
      role: 'Angular Developer',
      status: 'applied',
      dateApplied: '2026-06-28',
    });
    fixture.detectChanges();

    const board = boardDebugEl.componentInstance as Board;
    expect(
      board.applicationsByStatus().applied.some((application) => application.company === 'Nordic Fintech Renamed'),
    ).toBe(true);
    expect(fixture.debugElement.query(By.directive(ApplicationEditModal))).toBeNull();
  });

  it('deletes the application being edited and closes the modal', () => {
    const fixture = createLoadedFixture();
    const boardDebugEl = fixture.debugElement.query(By.directive(Board));

    boardDebugEl.triggerEventHandler('edit', {
      id: '1',
      company: 'Nordic Fintech',
      role: 'Angular Developer',
      status: 'applied',
      dateApplied: '2026-06-28',
    } satisfies JobApplication);
    fixture.detectChanges();

    const modalDebugEl = fixture.debugElement.query(By.directive(ApplicationEditModal));
    const modal = modalDebugEl.componentInstance as ApplicationEditModal;
    modal.delete.emit();
    fixture.detectChanges();

    const board = boardDebugEl.componentInstance as Board;
    expect(board.applicationsByStatus().applied.some((application) => application.id === '1')).toBe(
      false,
    );
    expect(fixture.debugElement.query(By.directive(ApplicationEditModal))).toBeNull();
  });

  it('shows a dismissable mutation error banner without hiding the board', () => {
    const fixture = createLoadedFixture();

    const store = TestBed.inject(Store);
    store.dispatch(
      ApplicationsActions.applicationAddFailed({
        application: testApplications[0],
        error: 'could not save',
      }),
    );
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('could not save');
    expect(fixture.debugElement.query(By.directive(Board))).toBeTruthy();

    const dismissButton = fixture.debugElement
      .queryAll(By.css('button'))
      .find((button) => button.nativeElement.textContent.trim() === 'Dismiss');
    dismissButton?.nativeElement.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('could not save');
  });
});
