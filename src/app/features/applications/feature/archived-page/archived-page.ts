import { Component, inject, signal } from '@angular/core';
import { ApplicationCard } from '../../ui/application-card/application-card';
import { ApplicationEditModal } from '../../ui/application-edit-modal/application-edit-modal';
import { ApplicationsService } from '../../data-access/applications.service';
import { JobApplication } from '../../data-access/application.model';

@Component({
  selector: 'app-archived-page',
  imports: [ApplicationCard, ApplicationEditModal],
  templateUrl: './archived-page.html',
})
export class ArchivedPage {
  private readonly applicationsService = inject(ApplicationsService);

  protected readonly applications = signal<JobApplication[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly editingApplication = signal<JobApplication | null>(null);

  constructor() {
    this.load();
  }

  protected onRetry(): void {
    this.load();
  }

  protected onEdit(application: JobApplication): void {
    this.editingApplication.set(application);
  }

  protected onCloseEdit(): void {
    this.editingApplication.set(null);
  }

  protected onSaveEdit(application: JobApplication): void {
    this.applicationsService.update(application).subscribe(() => {
      this.editingApplication.set(null);
      if (application.archived) {
        this.applications.update((apps) =>
          apps.map((existing) => (existing.id === application.id ? application : existing)),
        );
      } else {
        this.applications.update((apps) => apps.filter((existing) => existing.id !== application.id));
      }
    });
  }

  protected onDeleteEdit(): void {
    const application = this.editingApplication();

    if (!application) {
      return;
    }

    this.applicationsService.delete(application.id).subscribe(() => {
      this.applications.update((apps) => apps.filter((existing) => existing.id !== application.id));
      this.editingApplication.set(null);
    });
  }

  protected onArchiveToggle(): void {
    const application = this.editingApplication();

    if (!application) {
      return;
    }

    this.onSaveEdit({ ...application, archived: !application.archived });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.applicationsService.getArchived().subscribe({
      next: (applications) => {
        this.applications.set(applications);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
