import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InterviewStage, JobApplication, WORK_MODE_OPTIONS } from '../../data-access/application.model';
import { GhostIcon } from '../ghost-icon/ghost-icon';

const MAX_VISIBLE_TECH_TAGS = 5;
const STALE_APPLIED_DAYS = 30;
const RELATIVE_LABEL_THRESHOLD_DAYS = 14;

const relativeDayFormat = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });

function daysSince(dateIso: string): number {
  const elapsedMs = Date.now() - new Date(dateIso).getTime();
  return Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
}

function stageSortKey(entry: InterviewStage): string {
  return `${entry.date}T${entry.time ?? '00:00'}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / msPerDay);
}

function stageRelativeLabel(entry: InterviewStage): string | null {
  const diffDays = daysBetween(new Date(), new Date(`${entry.date}T00:00`));
  if (Math.abs(diffDays) > RELATIVE_LABEL_THRESHOLD_DAYS) {
    return null;
  }
  return relativeDayFormat.format(diffDays, 'day');
}

function stageAbsoluteLabel(entry: InterviewStage): string {
  const [yyyy, mm, dd] = entry.date.split('-');
  const datePart = `${dd}/${mm}/${yyyy}`;
  return entry.time ? `${datePart}, ${entry.time}` : datePart;
}

@Component({
  selector: 'app-application-card',
  imports: [DatePipe, GhostIcon],
  templateUrl: './application-card.html',
})
export class ApplicationCard {
  application = input.required<JobApplication>();
  edit = output<JobApplication>();
  archive = output<JobApplication>();

  protected readonly workModeLabel = computed(
    () => WORK_MODE_OPTIONS.find((option) => option.value === this.application().workMode)?.label ?? null,
  );

  protected readonly visibleTechStack = computed(
    () => this.application().techStack?.slice(0, MAX_VISIBLE_TECH_TAGS) ?? [],
  );
  protected readonly hiddenTechStackCount = computed(
    () => Math.max((this.application().techStack?.length ?? 0) - MAX_VISIBLE_TECH_TAGS, 0),
  );

  protected readonly latestInterviewStage = computed(() => {
    const stages = this.application().interviewStages;
    if (!stages?.length) {
      return null;
    }

    const today = new Date().toISOString().slice(0, 10);
    const upcoming = stages
      .filter((entry) => entry.date >= today)
      .sort((a, b) => stageSortKey(a).localeCompare(stageSortKey(b)));
    if (upcoming.length) {
      return upcoming[0];
    }

    return [...stages].sort((a, b) => stageSortKey(b).localeCompare(stageSortKey(a)))[0];
  });

  protected readonly latestInterviewStageLabel = computed(() => {
    const stage = this.latestInterviewStage();
    if (!stage) {
      return null;
    }
    const relative = stageRelativeLabel(stage);
    if (!relative) {
      return stageAbsoluteLabel(stage);
    }
    return stage.time ? `${relative}, ${stage.time}` : relative;
  });

  protected readonly latestInterviewStageTooltip = computed(() => {
    const stage = this.latestInterviewStage();
    return stage ? stageAbsoluteLabel(stage) : null;
  });

  protected readonly isGhosted = computed(
    () => this.application().status === 'rejected' && this.application().heardBack === false,
  );

  protected readonly staleDays = computed(() => {
    const application = this.application();
    if (application.status !== 'applied') {
      return null;
    }
    const days = daysSince(application.dateApplied);
    return days >= STALE_APPLIED_DAYS ? days : null;
  });

  protected onEditClick(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.application());
  }

  protected onArchiveClick(event: Event): void {
    event.stopPropagation();
    this.archive.emit(this.application());
  }
}
