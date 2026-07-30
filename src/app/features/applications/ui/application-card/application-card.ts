import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { JobApplication } from '../../data-access/application.model';

const MAX_VISIBLE_TECH_TAGS = 5;

@Component({
  selector: 'app-application-card',
  imports: [DatePipe],
  templateUrl: './application-card.html',
})
export class ApplicationCard {
  application = input.required<JobApplication>();
  edit = output<JobApplication>();

  protected readonly visibleTechStack = computed(
    () => this.application().techStack?.slice(0, MAX_VISIBLE_TECH_TAGS) ?? [],
  );
  protected readonly hiddenTechStackCount = computed(
    () => Math.max((this.application().techStack?.length ?? 0) - MAX_VISIBLE_TECH_TAGS, 0),
  );

  protected onEditClick(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.application());
  }
}
