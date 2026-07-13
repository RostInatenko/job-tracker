import { TestBed } from '@angular/core/testing';
import { QuickAddForm } from './quick-add-form';

describe('QuickAddForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickAddForm],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(QuickAddForm);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits trimmed company and role on submit', () => {
    const fixture = TestBed.createComponent(QuickAddForm);
    fixture.detectChanges();

    let emitted: { company: string; role: string } | undefined;
    fixture.componentInstance.added.subscribe((value) => (emitted = value));

    fixture.componentInstance['company'] = '  Nordic Fintech  ';
    fixture.componentInstance['role'] = '  Angular Developer  ';
    fixture.componentInstance['onSubmit']();

    expect(emitted).toEqual({ company: 'Nordic Fintech', role: 'Angular Developer' });
  });

  it('resets the fields after a successful submit', () => {
    const fixture = TestBed.createComponent(QuickAddForm);
    fixture.detectChanges();

    fixture.componentInstance['company'] = 'Nordic Fintech';
    fixture.componentInstance['role'] = 'Angular Developer';
    fixture.componentInstance['onSubmit']();

    expect(fixture.componentInstance['company']).toBe('');
    expect(fixture.componentInstance['role']).toBe('');
  });

  it('does not emit when company or role is blank', () => {
    const fixture = TestBed.createComponent(QuickAddForm);
    fixture.detectChanges();

    let emitted = false;
    fixture.componentInstance.added.subscribe(() => (emitted = true));

    fixture.componentInstance['company'] = '   ';
    fixture.componentInstance['role'] = 'Angular Developer';
    fixture.componentInstance['onSubmit']();

    expect(emitted).toBe(false);
  });
});
