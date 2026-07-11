import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Board } from './board';
import { BoardColumn } from '../board-column/board-column';
import {
  ApplicationStatus,
  BOARD_COLUMNS,
  JobApplication,
} from '../../data-access/application.model';

describe('Board', () => {
  const applicationsByStatus: Record<ApplicationStatus, JobApplication[]> = {
    applied: [
      {
        id: '1',
        company: 'Nordic Fintech',
        role: 'Angular Developer',
        status: 'applied',
        dateApplied: '2026-06-28',
      },
    ],
    interview: [],
    offer: [],
    rejected: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Board],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(Board);
    fixture.componentRef.setInput('columns', BOARD_COLUMNS);
    fixture.componentRef.setInput('applicationsByStatus', applicationsByStatus);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one column per configured status', () => {
    const fixture = createComponent();
    const columns = fixture.debugElement.queryAll(By.directive(BoardColumn));
    expect(columns.length).toBe(BOARD_COLUMNS.length);
  });

  it('tags a re-emitted drop event with the column status it came from', () => {
    const fixture = createComponent();
    const columnDebugEls = fixture.debugElement.queryAll(By.directive(BoardColumn));
    const appliedColumnDebugEl = columnDebugEls[0];
    const fakeEvent = { previousIndex: 0, currentIndex: 0 } as CdkDragDrop<JobApplication[]>;

    let emitted: { status: ApplicationStatus; event: CdkDragDrop<JobApplication[]> } | undefined;
    fixture.componentInstance.dropped.subscribe((value) => (emitted = value));

    appliedColumnDebugEl.triggerEventHandler('dropped', fakeEvent);

    expect(emitted?.status).toBe('applied');
    expect(emitted?.event).toBe(fakeEvent);
  });
});
