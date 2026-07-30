import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  ApplicationStatus,
  BOARD_COLUMNS,
  InterviewStage,
  JobApplication,
} from '../../data-access/application.model';

@Component({
  selector: 'app-application-edit-modal',
  imports: [ReactiveFormsModule, CdkTrapFocus],
  templateUrl: './application-edit-modal.html',
})
export class ApplicationEditModal implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  application = input.required<JobApplication>();
  save = output<JobApplication>();
  delete = output<void>();
  close = output<void>();

  protected readonly columns = BOARD_COLUMNS;
  protected readonly confirmingDelete = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    company: ['', Validators.required],
    role: ['', Validators.required],
    status: this.formBuilder.nonNullable.control<ApplicationStatus>(
      'applied',
      Validators.required,
    ),
    dateApplied: ['', Validators.required],
    salary: [''],
    notes: [''],
    link: [''],
  });

  protected readonly techStackTags = signal<string[]>([]);
  protected readonly interviewStages = signal<InterviewStage[]>([]);
  protected readonly sortedInterviewStages = computed(() =>
    [...this.interviewStages()].sort((a, b) => a.date.localeCompare(b.date)),
  );

  ngOnInit(): void {
    const application = this.application();
    this.form.patchValue(application);
    this.techStackTags.set(application.techStack ?? []);
    this.interviewStages.set(application.interviewStages ?? []);
  }

  protected onTechInput(input: HTMLInputElement): void {
    if (!input.value.includes(',')) {
      return;
    }

    const parts = input.value.split(',');
    const remainder = parts.pop() ?? '';
    parts.forEach((part) => this.addTech(part));
    input.value = remainder;
  }

  protected onTechInputEnter(input: HTMLInputElement): void {
    this.addTech(input.value);
    input.value = '';
  }

  protected onRemoveTech(tag: string): void {
    this.techStackTags.update((tags) => tags.filter((existing) => existing !== tag));
  }

  private addTech(raw: string): void {
    const trimmed = raw.trim();
    if (!trimmed || this.techStackTags().includes(trimmed)) {
      return;
    }
    this.techStackTags.update((tags) => [...tags, trimmed]);
  }

  protected onAddStage(stageInput: HTMLInputElement, dateInput: HTMLInputElement): void {
    const stage = stageInput.value.trim();
    const date = dateInput.value;
    if (!stage || !date) {
      return;
    }
    this.interviewStages.update((stages) => [...stages, { stage, date }]);
    stageInput.value = '';
    dateInput.value = '';
  }

  protected onRemoveStage(entry: InterviewStage): void {
    this.interviewStages.update((stages) => stages.filter((existing) => existing !== entry));
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
      salary: value.salary || undefined,
      techStack: this.techStackTags(),
      interviewStages: this.interviewStages(),
    });
  }

  protected onDeleteClick(): void {
    this.confirmingDelete.set(true);
  }

  protected onDeleteCancel(): void {
    this.confirmingDelete.set(false);
  }

  protected onDeleteConfirm(): void {
    this.delete.emit();
  }
}
