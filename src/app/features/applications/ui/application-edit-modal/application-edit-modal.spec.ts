import { TestBed } from '@angular/core/testing';
import { ApplicationEditModal } from './application-edit-modal';
import { JobApplication } from '../../data-access/application.model';

function emptyInput(): HTMLInputElement {
  return { value: '' } as HTMLInputElement;
}

describe('ApplicationEditModal', () => {
  const application: JobApplication = {
    id: '1',
    company: 'Nordic Fintech',
    role: 'Angular Developer',
    status: 'applied',
    dateApplied: '2026-06-28',
    notes: 'Referred by a friend',
    link: 'https://example.com/jobs/nordic-fintech',
    techStack: ['Angular', 'RxJS'],
    salary: '$90,000 - $110,000',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationEditModal],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(ApplicationEditModal);
    fixture.componentRef.setInput('application', application);
    fixture.detectChanges();
    return fixture;
  }

  it('should create and populate the form from the input application', () => {
    const fixture = createComponent();
    const form = fixture.componentInstance['form'];

    expect(form.getRawValue()).toEqual({
      company: 'Nordic Fintech',
      role: 'Angular Developer',
      status: 'applied',
      dateApplied: '2026-06-28',
      salary: '$90,000 - $110,000',
      workMode: '',
      notes: 'Referred by a friend',
      link: 'https://example.com/jobs/nordic-fintech',
    });
    expect(fixture.componentInstance['techStackTags']()).toEqual(['Angular', 'RxJS']);
  });

  it('adds and removes tech stack tags', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    component['onRemoveTech']('RxJS');
    expect(component['techStackTags']()).toEqual(['Angular']);

    const fakeInput = { value: 'NgRx' } as HTMLInputElement;
    component['onTechInputEnter'](fakeInput);
    expect(component['techStackTags']()).toEqual(['Angular', 'NgRx']);
    expect(fakeInput.value).toBe('');
  });

  it('emits save with the updated application on a valid submit', () => {
    const fixture = createComponent();
    let saved: JobApplication | undefined;
    fixture.componentInstance.save.subscribe((value) => (saved = value));

    fixture.componentInstance['form'].patchValue({ company: 'Nordic Fintech Renamed' });
    fixture.componentInstance['onSave'](emptyInput(), emptyInput(), emptyInput());

    expect(saved?.company).toBe('Nordic Fintech Renamed');
    expect(saved?.id).toBe('1');
    expect(saved?.techStack).toEqual(['Angular', 'RxJS']);
  });

  it('adds an interview stage with an optional time and sorts stages by date and time', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    const stageInput = { value: 'Tech interview' } as HTMLInputElement;
    const dateInput = { value: '2026-07-10' } as HTMLInputElement;
    const timeInput = { value: '14:30' } as HTMLInputElement;
    component['onAddStage'](stageInput, dateInput, timeInput);

    expect(component['interviewStages']()).toEqual([
      { stage: 'Tech interview', date: '2026-07-10', time: '14:30' },
    ]);
    expect(stageInput.value).toBe('');
    expect(dateInput.value).toBe('');
    expect(timeInput.value).toBe('');

    const earlierSameDay = { value: 'HR screen' } as HTMLInputElement;
    const earlierDate = { value: '2026-07-10' } as HTMLInputElement;
    const earlierTime = { value: '09:00' } as HTMLInputElement;
    component['onAddStage'](earlierSameDay, earlierDate, earlierTime);

    expect(component['sortedInterviewStages']().map((entry) => entry.stage)).toEqual([
      'HR screen',
      'Tech interview',
    ]);
  });

  it('adds an interview stage without a time when none is provided', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;

    const stageInput = { value: 'Offer call' } as HTMLInputElement;
    const dateInput = { value: '2026-07-15' } as HTMLInputElement;
    const timeInput = { value: '' } as HTMLInputElement;
    component['onAddStage'](stageInput, dateInput, timeInput);

    expect(component['interviewStages']()).toEqual([{ stage: 'Offer call', date: '2026-07-15' }]);
  });

  it('does not emit save when the form is invalid', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.save.subscribe(() => (emitted = true));

    fixture.componentInstance['form'].patchValue({ company: '' });
    fixture.componentInstance['onSave'](emptyInput(), emptyInput(), emptyInput());

    expect(emitted).toBe(false);
  });

  it('auto-adds a complete but unsubmitted interview stage before saving', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    let saved: JobApplication | undefined;
    component.save.subscribe((value) => (saved = value));

    const stageInput = { value: 'Tech interview' } as HTMLInputElement;
    const dateInput = { value: '2026-07-10' } as HTMLInputElement;
    const timeInput = { value: '14:30' } as HTMLInputElement;
    component['onSave'](stageInput, dateInput, timeInput);

    expect(saved?.interviewStages).toEqual([
      { stage: 'Tech interview', date: '2026-07-10', time: '14:30' },
    ]);
    expect(component['confirmingIncompleteStage']()).toBe(false);
  });

  it('asks for confirmation instead of saving when the stage row is only partially filled', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    let emitted = false;
    component.save.subscribe(() => (emitted = true));

    const stageInput = { value: 'Tech interview' } as HTMLInputElement;
    const dateInput = { value: '' } as HTMLInputElement;
    const timeInput = { value: '' } as HTMLInputElement;
    component['onSave'](stageInput, dateInput, timeInput);

    expect(emitted).toBe(false);
    expect(component['confirmingIncompleteStage']()).toBe(true);

    component['onDiscardIncompleteStageAndSave']();

    expect(emitted).toBe(true);
    expect(component['interviewStages']()).toEqual([]);
    expect(stageInput.value).toBe('');
  });

  it('cancelling the incomplete-stage confirmation keeps the typed values and does not save', () => {
    const fixture = createComponent();
    const component = fixture.componentInstance;
    let emitted = false;
    component.save.subscribe(() => (emitted = true));

    const stageInput = { value: 'Tech interview' } as HTMLInputElement;
    const dateInput = { value: '' } as HTMLInputElement;
    const timeInput = { value: '' } as HTMLInputElement;
    component['onSave'](stageInput, dateInput, timeInput);
    component['onCancelIncompleteStage']();

    expect(emitted).toBe(false);
    expect(component['confirmingIncompleteStage']()).toBe(false);
    expect(stageInput.value).toBe('Tech interview');
  });

  it('does not emit delete on the first click, only after confirming', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.delete.subscribe(() => (emitted = true));

    fixture.componentInstance['onDeleteClick']();

    expect(emitted).toBe(false);
    expect(fixture.componentInstance['confirmingDelete']()).toBe(true);
  });

  it('emits delete once the confirm step is completed', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.delete.subscribe(() => (emitted = true));

    fixture.componentInstance['onDeleteClick']();
    fixture.componentInstance['onDeleteConfirm']();

    expect(emitted).toBe(true);
  });

  it('cancelling the confirm step resets it without emitting delete', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.delete.subscribe(() => (emitted = true));

    fixture.componentInstance['onDeleteClick']();
    fixture.componentInstance['onDeleteCancel']();

    expect(emitted).toBe(false);
    expect(fixture.componentInstance['confirmingDelete']()).toBe(false);
  });

  it('emits close when the backdrop is clicked', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.close.subscribe(() => (emitted = true));

    const backdrop = (fixture.nativeElement as HTMLElement).querySelector('div') as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(emitted).toBe(true);
  });

  it('does not emit close on a text-selection drag that starts inside the form and releases on the backdrop', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.close.subscribe(() => (emitted = true));

    const backdrop = (fixture.nativeElement as HTMLElement).querySelector('div') as HTMLElement;
    const form = backdrop.querySelector('form') as HTMLElement;

    form.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(emitted).toBe(false);
  });

  it('asks for confirmation before closing when there are unsaved changes', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.close.subscribe(() => (emitted = true));

    fixture.componentInstance['form'].patchValue({ company: 'Changed Co' });
    fixture.componentInstance['form'].markAsDirty();
    fixture.componentInstance['requestClose']();

    expect(emitted).toBe(false);
    expect(fixture.componentInstance['confirmingClose']()).toBe(true);

    fixture.componentInstance['onCloseConfirm']();
    expect(emitted).toBe(true);
  });
});
