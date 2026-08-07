import { Component, computed, effect, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Board } from '../../ui/board/board';
import { UndoToast } from '../../ui/undo-toast/undo-toast';
import { RejectionResponseToast } from '../../ui/rejection-response-toast/rejection-response-toast';
import { ApplicationEditModal } from '../../ui/application-edit-modal/application-edit-modal';
import { PastePostingModal } from '../../ui/paste-posting-modal/paste-posting-modal';
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
const REJECTION_PROMPT_WINDOW_MS = 8000;

@Component({
  selector: 'app-board-page',
  imports: [Board, UndoToast, RejectionResponseToast, ApplicationEditModal, PastePostingModal],
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
  protected readonly creatingApplication = signal(false);
  protected readonly pastingPosting = signal(false);
  private editTriggerElement: HTMLElement | null = null;

  protected readonly undoMessage = computed(() => {
    const move = this.lastMove();

    if (!move) {
      return '';
    }

    const label = BOARD_COLUMNS.find((column) => column.status === move.status)?.label ?? move.status;
    return `${move.company} moved to ${label}`;
  });

  protected readonly rejectionPromptMove = computed(() => {
    const move = this.lastMove();
    if (move && move.status === 'rejected' && move.previousStatus !== 'rejected') {
      return move;
    }
    return null;
  });

  constructor() {
    this.store.dispatch(ApplicationsActions.loadApplications());

    effect((onCleanup) => {
      const move = this.lastMove();

      if (!move) {
        return;
      }

      const windowMs = this.rejectionPromptMove() ? REJECTION_PROMPT_WINDOW_MS : UNDO_WINDOW_MS;
      const timer = setTimeout(
        () => this.store.dispatch(ApplicationsActions.lastMoveCleared()),
        windowMs,
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

  protected onRejectionResponse(heardBack: boolean): void {
    const move = this.rejectionPromptMove();

    if (!move) {
      return;
    }

    const application = this.applicationsByStatus().rejected.find(
      (existing) => existing.id === move.applicationId,
    );

    if (!application) {
      return;
    }

    const updated = { ...application, heardBack };
    this.store.dispatch(
      ApplicationsActions.applicationUpdated({ application: updated, previous: application }),
    );
  }

  protected onRetryLoad(): void {
    this.store.dispatch(ApplicationsActions.loadApplications());
  }

  protected onDismissMutationError(): void {
    this.store.dispatch(ApplicationsActions.mutationErrorCleared());
  }

  protected onOpenCreate(): void {
    this.creatingApplication.set(true);
  }

  protected onCloseCreate(): void {
    this.creatingApplication.set(false);
  }

  protected onSaveCreate(application: JobApplication): void {
    this.store.dispatch(ApplicationsActions.applicationAdded({ application }));
    this.creatingApplication.set(false);
  }

  protected onOpenPastePosting(): void {
    this.pastingPosting.set(true);
  }

  protected onClosePastePosting(): void {
    this.pastingPosting.set(false);
  }

  protected onPastedPosting(draft: Omit<JobApplication, 'id'>): void {
    this.store.dispatch(
      ApplicationsActions.applicationAdded({
        application: { ...draft, id: crypto.randomUUID() },
      }),
    );
    this.pastingPosting.set(false);
  }

  protected onEdit(application: JobApplication): void {
    this.editTriggerElement = document.activeElement as HTMLElement;
    this.editingApplication.set(application);
  }

  protected onCloseEdit(): void {
    this.closeEdit();
  }

  protected onSaveEdit(application: JobApplication): void {
    const previous = this.editingApplication();

    if (!previous) {
      return;
    }

    this.store.dispatch(ApplicationsActions.applicationUpdated({ application, previous }));
    this.closeEdit();
  }

  protected onDeleteEdit(): void {
    const application = this.editingApplication();

    if (!application) {
      return;
    }

    this.store.dispatch(ApplicationsActions.applicationDeleted({ application }));
    this.closeEdit();
  }

  protected onArchiveToggle(): void {
    const application = this.editingApplication();

    if (!application) {
      return;
    }

    this.archiveApplication(application, !application.archived);
    this.closeEdit();
  }

  protected onArchiveStale(application: JobApplication): void {
    const updated: JobApplication = {
      ...application,
      archived: true,
      status: 'rejected',
      heardBack: false,
    };
    this.store.dispatch(
      ApplicationsActions.applicationUpdated({ application: updated, previous: application }),
    );
  }

  private archiveApplication(application: JobApplication, archived: boolean): void {
    const updated = { ...application, archived };
    this.store.dispatch(
      ApplicationsActions.applicationUpdated({ application: updated, previous: application }),
    );
  }

  private closeEdit(): void {
    this.editingApplication.set(null);
    this.editTriggerElement?.focus();
    this.editTriggerElement = null;
  }
}
