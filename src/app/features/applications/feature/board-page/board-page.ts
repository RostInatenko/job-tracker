import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Board } from '../../ui/board/board';
import { ApplicationStatus, BOARD_COLUMNS, JobApplication } from '../../data-access/application.model';
import { ApplicationsActions } from '../../data-access/applications.actions';
import { selectApplicationsByStatus } from '../../data-access/applications.selectors';

@Component({
  selector: 'app-board-page',
  imports: [Board],
  templateUrl: './board-page.html',
})
export class BoardPage {
  private readonly store = inject(Store);

  protected readonly columns = BOARD_COLUMNS;
  protected readonly applicationsByStatus = this.store.selectSignal(selectApplicationsByStatus);

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

    this.store.dispatch(
      ApplicationsActions.applicationMoved({
        status,
        previousStatus,
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
      }),
    );
  }
}
