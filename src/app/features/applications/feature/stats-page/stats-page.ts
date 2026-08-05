import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApplicationsService } from '../../data-access/applications.service';
import { ApplicationStats, BOARD_COLUMNS } from '../../data-access/application.model';

@Component({
  selector: 'app-stats-page',
  imports: [RouterLink],
  templateUrl: './stats-page.html',
})
export class StatsPage {
  private readonly applicationsService = inject(ApplicationsService);

  protected readonly stats = signal<ApplicationStats | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  constructor() {
    this.load();
  }

  protected onRetry(): void {
    this.load();
  }

  protected statusLabel(status: ApplicationStats['statusBreakdown'][number]['status']): string {
    return BOARD_COLUMNS.find((column) => column.status === status)?.label ?? status;
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.applicationsService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
