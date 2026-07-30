import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { LlmService } from '../../data-access/llm.service';
import { ApplicationStatus, BOARD_COLUMNS, JobApplication } from '../../data-access/application.model';

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
  protected readonly phase = signal<Phase>('paste');
  protected readonly errorMessage = signal('');
  protected jobPostingText = '';

  protected readonly form = this.formBuilder.nonNullable.group({
    company: ['', Validators.required],
    role: ['', Validators.required],
    status: this.formBuilder.nonNullable.control<ApplicationStatus>('applied', Validators.required),
    dateApplied: [new Date().toISOString().slice(0, 10), Validators.required],
    techStack: [''],
    salary: [''],
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
      techStack: value.techStack
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    });
  }
}
