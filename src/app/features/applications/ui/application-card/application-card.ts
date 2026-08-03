import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { JobApplication, WORK_MODE_OPTIONS } from '../../data-access/application.model';

const MAX_VISIBLE_TECH_TAGS = 5;
const STALE_APPLIED_DAYS = 30;

function daysSince(dateIso: string): number {
  const elapsedMs = Date.now() - new Date(dateIso).getTime();
  return Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
}

@Component({
  selector: 'app-application-card',
  imports: [DatePipe],
  templateUrl: './application-card.html',
})
export class ApplicationCard {
  application = input.required<JobApplication>();
  edit = output<JobApplication>();

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
      .sort((a, b) => a.date.localeCompare(b.date));
    if (upcoming.length) {
      return upcoming[0];
    }

    return [...stages].sort((a, b) => b.date.localeCompare(a.date))[0];
  });

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
}
