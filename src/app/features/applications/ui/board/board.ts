import { Component, computed, input, output } from '@angular/core';
import { CdkDropListGroup, CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  ApplicationStatus,
  BoardColumnConfig,
  JobApplication,
} from '../../data-access/application.model';
import { BoardColumn } from '../board-column/board-column';

@Component({
  selector: 'app-board',
  imports: [CdkDropListGroup, BoardColumn],
  templateUrl: './board.html',
})
export class Board {
  columns = input.required<readonly BoardColumnConfig[]>();
  applicationsByStatus = input.required<Record<ApplicationStatus, JobApplication[]>>();

  dropped = output<{ status: ApplicationStatus; event: CdkDragDrop<JobApplication[]> }>();
  edit = output<JobApplication>();

  columnIds = computed(() => this.columns().map((column) => column.status));
}
