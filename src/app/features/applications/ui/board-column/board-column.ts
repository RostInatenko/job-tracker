import { Component, input, output } from '@angular/core';
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { JobApplication } from '../../data-access/application.model';
import { ApplicationCard } from '../application-card/application-card';

@Component({
  selector: 'app-board-column',
  imports: [CdkDropList, CdkDrag, ApplicationCard],
  templateUrl: './board-column.html',
})
export class BoardColumn {
  columnId = input.required<string>();
  label = input.required<string>();
  connectedTo = input.required<string[]>();
  applications = input.required<JobApplication[]>();

  dropped = output<CdkDragDrop<JobApplication[]>>();
}
