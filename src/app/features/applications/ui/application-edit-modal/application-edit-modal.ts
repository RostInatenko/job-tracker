import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { DatePipe } from '@angular/common';
import {
  ApplicationStatus,
  BOARD_COLUMNS,
  InterviewStage,
  JobApplication,
  WORK_MODE_OPTIONS,
  WorkMode,
} from '../../data-access/application.model';

function stageSortKey(entry: InterviewStage): string {
  return `${entry.date}T${entry.time ?? '00:00'}`;
}

@Component({
  selector: 'app-application-edit-modal',
  imports: [ReactiveFormsModule, CdkTrapFocus, DatePipe],
  templateUrl: './application-edit-modal.html',
})
export class ApplicationEditModal implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  application = input.required<JobApplication>();
  save = output<JobApplication>();
  delete = output<void>();
  close = output<void>();

  protected readonly columns = BOARD_COLUMNS;
  protected readonly workModeOptions = WORK_MODE_OPTIONS;
  protected readonly confirmingDelete = signal(false);
  protected readonly confirmingClose = signal(false);
  protected readonly confirmingIncompleteStage = signal(false);
  private backdropPointerDown = false;
  private nonFormDirty = false;
  private pendingStageInputs: {
    stageInput: HTMLInputElement;
    dateInput: HTMLInputElement;
    timeInput: HTMLInputElement;
  } | null = null;

  protected readonly form = this.formBuilder.nonNullable.group({
    company: ['', Validators.required],
    role: ['', Validators.required],
    status: this.formBuilder.nonNullable.control<ApplicationStatus>(
      'applied',
      Validators.required,
    ),
    dateApplied: ['', Validators.required],
    salary: [''],
    workMode: this.formBuilder.nonNullable.control<WorkMode | ''>(''),
    notes: [''],
    link: [''],
  });

  protected readonly techStackTags = signal<string[]>([]);
  protected readonly interviewStages = signal<InterviewStage[]>([]);
  protected readonly sortedInterviewStages = computed(() =>
    [...this.interviewStages()].sort((a, b) => stageSortKey(a).localeCompare(stageSortKey(b))),
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
    this.nonFormDirty = true;
  }

  private addTech(raw: string): void {
    const trimmed = raw.trim();
    if (!trimmed || this.techStackTags().includes(trimmed)) {
      return;
    }
    this.techStackTags.update((tags) => [...tags, trimmed]);
    this.nonFormDirty = true;
  }

  protected onAddStage(
    stageInput: HTMLInputElement,
    dateInput: HTMLInputElement,
    timeInput: HTMLInputElement,
  ): void {
    const stage = stageInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    if (!stage || !date) {
      return;
    }
    this.interviewStages.update((stages) => [
      ...stages,
      { stage, date, ...(time ? { time } : {}) },
    ]);
    stageInput.value = '';
    dateInput.value = '';
    timeInput.value = '';
    this.nonFormDirty = true;
  }

  protected onRemoveStage(entry: InterviewStage): void {
    this.interviewStages.update((stages) => stages.filter((existing) => existing !== entry));
    this.nonFormDirty = true;
  }

  protected onSave(
    stageInput: HTMLInputElement,
    dateInput: HTMLInputElement,
    timeInput: HTMLInputElement,
  ): void {
    const stage = stageInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;

    if (stage && date) {
      this.onAddStage(stageInput, dateInput, timeInput);
    } else if (stage || date || time) {
      this.pendingStageInputs = { stageInput, dateInput, timeInput };
      this.confirmingIncompleteStage.set(true);
      return;
    }

    this.commitSave();
  }

  protected onDiscardIncompleteStageAndSave(): void {
    this.confirmingIncompleteStage.set(false);
    if (this.pendingStageInputs) {
      this.pendingStageInputs.stageInput.value = '';
      this.pendingStageInputs.dateInput.value = '';
      this.pendingStageInputs.timeInput.value = '';
      this.pendingStageInputs = null;
    }
    this.commitSave();
  }

  protected onCancelIncompleteStage(): void {
    this.confirmingIncompleteStage.set(false);
    this.pendingStageInputs = null;
  }

  private commitSave(): void {
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
      workMode: value.workMode || undefined,
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
    return this.form.dirty || this.nonFormDirty;
  }
}
