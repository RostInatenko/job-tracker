import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { JobApplication } from '../../data-access/application.model';

@Component({
  selector: 'app-application-card',
  imports: [DatePipe],
  templateUrl: './application-card.html',
})
export class ApplicationCard {
  application = input.required<JobApplication>();
  edit = output<JobApplication>();

  protected onEditClick(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.application());
  }
}
