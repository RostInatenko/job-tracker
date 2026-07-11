import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { BoardColumn } from './board-column';
import { JobApplication } from '../../data-access/application.model';

describe('BoardColumn', () => {
  const mockApplications: JobApplication[] = [
    {
      id: '1',
      company: 'Nordic Fintech',
      role: 'Mid-level Angular Developer',
      status: 'applied',
      dateApplied: '2026-06-28',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardColumn],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(BoardColumn);
    fixture.componentRef.setInput('columnId', 'applied');
    fixture.componentRef.setInput('label', 'Applied');
    fixture.componentRef.setInput('connectedTo', ['interview', 'offer', 'rejected']);
    fixture.componentRef.setInput('applications', mockApplications);
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the label and application count', () => {
    const fixture = createComponent();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Applied');
    expect(compiled.textContent).toContain('1');
  });

  it('re-emits the raw drop event unchanged', () => {
    const fixture = createComponent();
    const dropListDebugEl = fixture.debugElement.query(By.directive(CdkDropList));
    const fakeEvent = { previousIndex: 0, currentIndex: 1 } as CdkDragDrop<JobApplication[]>;

    let emitted: CdkDragDrop<JobApplication[]> | undefined;
    fixture.componentInstance.dropped.subscribe((event) => (emitted = event));

    dropListDebugEl.triggerEventHandler('cdkDropListDropped', fakeEvent);

    expect(emitted).toBe(fakeEvent);
  });
});
