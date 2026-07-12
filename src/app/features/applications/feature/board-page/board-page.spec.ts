import { TestBed } from '@angular/core/testing';
import { BoardPage } from './board-page';
import { By } from '@angular/platform-browser';
import { Board } from '../../ui/board/board';
import { UndoToast } from '../../ui/undo-toast/undo-toast';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { JobApplication } from '../../data-access/application.model';
import { provideState, provideStore } from '@ngrx/store';
import { APPLICATIONS_FEATURE_KEY } from '../../data-access/applications.selectors';
import { applicationsReducer } from '../../data-access/applications.reducer';

describe('BoardPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardPage],
      providers: [provideStore(), provideState(APPLICATIONS_FEATURE_KEY, applicationsReducer)],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BoardPage);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('moves the application into the target column and out of the source column', () => {
    const fixture = TestBed.createComponent(BoardPage);
    fixture.detectChanges();
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
    const fixture = TestBed.createComponent(BoardPage);
    fixture.detectChanges();
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
});
