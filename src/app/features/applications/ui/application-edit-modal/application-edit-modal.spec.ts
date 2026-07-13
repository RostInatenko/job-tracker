import { TestBed } from '@angular/core/testing';
import { ApplicationEditModal } from './application-edit-modal';
import { JobApplication } from '../../data-access/application.model';

describe('ApplicationEditModal', () => {
  const application: JobApplication = {
    id: '1',
    company: 'Nordic Fintech',
    role: 'Angular Developer',
    status: 'applied',
    dateApplied: '2026-06-28',
    notes: 'Referred by a friend',
    link: 'https://example.com/jobs/nordic-fintech',
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
      notes: 'Referred by a friend',
      link: 'https://example.com/jobs/nordic-fintech',
    });
  });

  it('emits save with the updated application on a valid submit', () => {
    const fixture = createComponent();
    let saved: JobApplication | undefined;
    fixture.componentInstance.save.subscribe((value) => (saved = value));

    fixture.componentInstance['form'].patchValue({ company: 'Nordic Fintech Renamed' });
    fixture.componentInstance['onSave']();

    expect(saved?.company).toBe('Nordic Fintech Renamed');
    expect(saved?.id).toBe('1');
  });

  it('does not emit save when the form is invalid', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.save.subscribe(() => (emitted = true));

    fixture.componentInstance['form'].patchValue({ company: '' });
    fixture.componentInstance['onSave']();

    expect(emitted).toBe(false);
  });

  it('emits delete with the application id', () => {
    const fixture = createComponent();
    let deletedId: string | undefined;
    fixture.componentInstance.delete.subscribe((id) => (deletedId = id));

    fixture.componentInstance['onDelete']();

    expect(deletedId).toBe('1');
  });

  it('emits close when the backdrop is clicked', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.close.subscribe(() => (emitted = true));

    const backdrop = (fixture.nativeElement as HTMLElement).querySelector('div');
    backdrop?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(emitted).toBe(true);
  });
});
