import { Component, computed, effect, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Board } from '../../ui/board/board';
import { UndoToast } from '../../ui/undo-toast/undo-toast';
import { QuickAddForm } from '../../ui/quick-add-form/quick-add-form';
import { ApplicationEditModal } from '../../ui/application-edit-modal/application-edit-modal';
import { ApplicationStatus, BOARD_COLUMNS, JobApplication } from '../../data-access/application.model';
import { ApplicationsActions } from '../../data-access/applications.actions';
import {
  selectApplicationsByStatus,
  selectError,
  selectLastMove,
  selectLoading,
  selectMutationError,
} from '../../data-access/applications.selectors';

const UNDO_WINDOW_MS = 5000;

@Component({
  selector: 'app-board-page',
  imports: [Board, UndoToast, QuickAddForm, ApplicationEditModal],
  templateUrl: './board-page.html',
})
export class BoardPage {
  private readonly store = inject(Store);

  protected readonly columns = BOARD_COLUMNS;
  protected readonly applicationsByStatus = this.store.selectSignal(selectApplicationsByStatus);
  protected readonly lastMove = this.store.selectSignal(selectLastMove);
  protected readonly loading = this.store.selectSignal(selectLoading);
  protected readonly error = this.store.selectSignal(selectError);
  protected readonly mutationError = this.store.selectSignal(selectMutationError);
  protected readonly editingApplication = signal<JobApplication | null>(null);

  protected readonly undoMessage = computed(() => {
    const move = this.lastMove();

    if (!move) {
      return '';
    }

    const label = BOARD_COLUMNS.find((column) => column.status === move.status)?.label ?? move.status;
    return `${move.company} moved to ${label}`;
  });

  constructor() {
    this.store.dispatch(ApplicationsActions.loadApplications());

    effect((onCleanup) => {
      const move = this.lastMove();

      if (!move) {
        return;
      }

      const timer = setTimeout(
        () => this.store.dispatch(ApplicationsActions.lastMoveCleared()),
        UNDO_WINDOW_MS,
      );
      onCleanup(() => clearTimeout(timer));
    });
  }

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

  protected onUndo(): void {
    const move = this.lastMove();

    if (!move) {
      return;
    }

    this.store.dispatch(ApplicationsActions.undoLastMove({ applicationId: move.applicationId }));
  }

  protected onRetryLoad(): void {
    this.store.dispatch(ApplicationsActions.loadApplications());
  }

  protected onDismissMutationError(): void {
    this.store.dispatch(ApplicationsActions.mutationErrorCleared());
  }

  protected onQuickAdd({ company, role }: { company: string; role: string }): void {
    this.store.dispatch(
      ApplicationsActions.applicationAdded({
        application: {
          id: crypto.randomUUID(),
          company,
          role,
          status: 'applied',
          dateApplied: new Date().toISOString().slice(0, 10),
        },
      }),
    );
  }

  protected onEdit(application: JobApplication): void {
    this.editingApplication.set(application);
  }

  protected onCloseEdit(): void {
    this.editingApplication.set(null);
  }

  protected onSaveEdit(application: JobApplication): void {
    const previous = this.editingApplication();

    if (!previous) {
      return;
    }

    this.store.dispatch(ApplicationsActions.applicationUpdated({ application, previous }));
    this.editingApplication.set(null);
  }

  protected onDeleteEdit(): void {
    const application = this.editingApplication();

    if (!application) {
      return;
    }

    this.store.dispatch(ApplicationsActions.applicationDeleted({ application }));
    this.editingApplication.set(null);
  }
}
