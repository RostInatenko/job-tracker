import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApplicationStatus, BOARD_COLUMNS, JobApplication } from '../../data-access/application.model';

@Component({
  selector: 'app-application-edit-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './application-edit-modal.html',
})
export class ApplicationEditModal implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  application = input.required<JobApplication>();
  save = output<JobApplication>();
  delete = output<void>();
  close = output<void>();

  protected readonly columns = BOARD_COLUMNS;

  protected readonly form = this.formBuilder.nonNullable.group({
    company: ['', Validators.required],
    role: ['', Validators.required],
    status: this.formBuilder.nonNullable.control<ApplicationStatus>(
      'applied',
      Validators.required,
    ),
    dateApplied: ['', Validators.required],
    notes: [''],
    link: [''],
  });

  ngOnInit(): void {
    this.form.patchValue(this.application());
  }

  protected onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      ...this.application(),
      company: value.company,
      role: value.role,
      status: value.status,
      dateApplied: value.dateApplied,
      notes: value.notes || undefined,
      link: value.link || undefined,
    });
  }

  protected onDelete(): void {
    this.delete.emit();
  }
}
