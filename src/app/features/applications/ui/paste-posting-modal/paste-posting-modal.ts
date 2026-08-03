import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { LlmService } from '../../data-access/llm.service';
import {
  ApplicationStatus,
  BOARD_COLUMNS,
  JobApplication,
  WORK_MODE_OPTIONS,
  WorkMode,
} from '../../data-access/application.model';

type Phase = 'paste' | 'loading' | 'review' | 'error';

@Component({
  selector: 'app-paste-posting-modal',
  imports: [ReactiveFormsModule, FormsModule, CdkTrapFocus],
  templateUrl: './paste-posting-modal.html',
})
export class PastePostingModal {
  private readonly llmService = inject(LlmService);
  private readonly formBuilder = inject(FormBuilder);

  added = output<Omit<JobApplication, 'id'>>();
  close = output<void>();

  protected readonly columns = BOARD_COLUMNS;
  protected readonly workModeOptions = WORK_MODE_OPTIONS;
  protected readonly phase = signal<Phase>('paste');
  protected readonly errorMessage = signal('');
  protected readonly confirmingClose = signal(false);
  protected jobPostingText = '';
  private backdropPointerDown = false;

  protected readonly form = this.formBuilder.nonNullable.group({
    company: ['', Validators.required],
    role: ['', Validators.required],
    status: this.formBuilder.nonNullable.control<ApplicationStatus>('applied', Validators.required),
    dateApplied: [new Date().toISOString().slice(0, 10), Validators.required],
    techStack: [''],
    salary: [''],
    workMode: this.formBuilder.nonNullable.control<WorkMode | ''>(''),
    notes: [''],
    link: [''],
  });

  protected onExtract(): void {
    if (!this.jobPostingText.trim()) {
      return;
    }

    this.phase.set('loading');

    this.llmService.extractJobPosting(this.jobPostingText.trim()).subscribe({
      next: (extraction) => {
        this.form.patchValue({
          company: extraction.company,
          role: extraction.role,
          techStack: extraction.techStack.join(', '),
          salary: extraction.salary ?? '',
          link: extraction.link ?? '',
          workMode: (extraction.workMode?.toLowerCase() as WorkMode) || '',
        });
        this.phase.set('review');
      },
      error: () => {
        this.errorMessage.set('Could not extract details from that posting. Try again, or fill the form in manually.');
        this.phase.set('error');
      },
    });
  }

  protected onSkipToManual(): void {
    this.phase.set('review');
  }

  protected onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.added.emit({
      company: value.company,
      role: value.role,
      status: value.status,
      dateApplied: value.dateApplied,
      notes: value.notes || undefined,
      link: value.link || undefined,
      salary: value.salary || undefined,
      workMode: value.workMode || undefined,
      techStack: value.techStack
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    });
  }

  protected onBackdropMouseDown(event: MouseEvent): void {
    this.backdropPointerDown = event.target === event.currentTarget;
  }

  protected onBackdropClick(event: MouseEvent): void {
    const closedOnBackdrop = this.backdropPointerDown && event.target === event.currentTarget;
    this.backdropPointerDown = false;
    if (closedOnBackdrop) {
      this.requestClose();
    }
  }

  protected requestClose(): void {
    if (this.hasUnsavedChanges()) {
      this.confirmingClose.set(true);
      return;
    }
    this.close.emit();
  }

  protected onCloseConfirm(): void {
    this.confirmingClose.set(false);
    this.close.emit();
  }

  protected onCloseCancel(): void {
    this.confirmingClose.set(false);
  }

  private hasUnsavedChanges(): boolean {
    if (this.phase() === 'review') {
      return this.form.dirty;
    }
    return this.jobPostingText.trim().length > 0;
  }
}
