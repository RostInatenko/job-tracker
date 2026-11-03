import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, output, signal } from '@angular/core';
import { Subscription, TimeoutError } from 'rxjs';
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

interface ExtractionFailure {
  message: string;
  canRetry: boolean;
}

function describeExtractionFailure(error: unknown): ExtractionFailure {
  if (error instanceof TimeoutError || (error instanceof HttpErrorResponse && error.status === 504)) {
    return {
      message: 'The AI service took too long to answer. Try again, or fill the form in manually.',
      canRetry: true,
    };
  }
  if (error instanceof HttpErrorResponse && error.status === 429) {
    return {
      message: 'The AI request limit has been reached for today. Fill the form in manually, or try again tomorrow.',
      canRetry: false,
    };
  }
  if (error instanceof HttpErrorResponse && error.status === 503) {
    return {
      message: 'The AI service is busy right now. Try again in a moment, or fill the form in manually.',
      canRetry: true,
    };
  }
  return {
    message: 'Could not extract details from that posting. Try again, or fill the form in manually.',
    canRetry: true,
  };
}

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
  protected readonly canRetry = signal(true);
  protected readonly confirmingClose = signal(false);
  protected jobPostingText = '';
  private backdropPointerDown = false;
  private extraction: Subscription | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.extraction?.unsubscribe());
  }

  protected readonly form = this.formBuilder.nonNullable.group({
    company: ['', Validators.required],
    role: ['', Validators.required],
    status: this.formBuilder.nonNullable.control<ApplicationStatus>('applied', Validators.required),
    dateApplied: [new Date().toISOString().slice(0, 10), Validators.required],
    techStack: [''],
    salary: [''],
    workMode: this.formBuilder.nonNullable.control<WorkMode | ''>(''),
    location: [''],
    notes: [''],
    link: [''],
  });

  protected onExtract(): void {
    if (!this.jobPostingText.trim()) {
      return;
    }

    this.phase.set('loading');

    this.extraction = this.llmService.extractJobPosting(this.jobPostingText.trim()).subscribe({
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
      error: (error: unknown) => {
        const failure = describeExtractionFailure(error);
        this.errorMessage.set(failure.message);
        this.canRetry.set(failure.canRetry);
        this.phase.set('error');
      },
    });
  }

  protected onCancelExtract(): void {
    this.extraction?.unsubscribe();
    this.phase.set('paste');
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
      location: value.location || undefined,
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
