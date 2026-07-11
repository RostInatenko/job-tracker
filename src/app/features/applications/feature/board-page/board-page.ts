import { Component, computed, signal } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Board } from '../../ui/board/board';
import {
  ApplicationStatus,
  BOARD_COLUMNS,
  JobApplication,
} from '../../data-access/application.model';
import { MOCK_APPLICATIONS } from '../../data-access/mock-applications';

function groupByStatus(
  applications: JobApplication[],
): Record<ApplicationStatus, JobApplication[]> {
  const grouped = Object.fromEntries(
    BOARD_COLUMNS.map((column) => [column.status, [] as JobApplication[]]),
  ) as Record<ApplicationStatus, JobApplication[]>;

  for (const application of applications) {
    grouped[application.status].push(application);
  }

  return grouped;
}

@Component({
  selector: 'app-board-page',
  imports: [Board],
  templateUrl: './board-page.html',
})
export class BoardPage {
  protected readonly columns = BOARD_COLUMNS;

  private readonly applications = signal<JobApplication[]>(MOCK_APPLICATIONS);
  protected readonly applicationsByStatus = computed(() => groupByStatus(this.applications()));

  protected onDropped({
    status,
    event,
  }: {
    status: ApplicationStatus;
    event: CdkDragDrop<JobApplication[]>;
  }): void {
    const previousStatus = event.previousContainer.id as ApplicationStatus;

    if (previousStatus === status && event.previousIndex === event.currentIndex) {
      return;
    }

    this.applications.update((current) => {
      const grouped = groupByStatus(current);
      const sourceList = [...grouped[previousStatus]];
      const [moved] = sourceList.splice(event.previousIndex, 1);
      const movedApplication = { ...moved, status };

      if (previousStatus === status) {
        sourceList.splice(event.currentIndex, 0, movedApplication);
        grouped[status] = sourceList;
      } else {
        const targetList = [...grouped[status]];
        targetList.splice(event.currentIndex, 0, movedApplication);
        grouped[previousStatus] = sourceList;
        grouped[status] = targetList;
      }

      return BOARD_COLUMNS.flatMap((column) => grouped[column.status]);
    });
  }
}
