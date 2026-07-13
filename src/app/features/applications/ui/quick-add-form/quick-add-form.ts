import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quick-add-form',
  imports: [FormsModule],
  templateUrl: './quick-add-form.html',
})
export class QuickAddForm {
  added = output<{ company: string; role: string }>();

  protected company = '';
  protected role = '';

  protected onSubmit(): void {
    if (!this.company.trim() || !this.role.trim()) {
      return;
    }

    this.added.emit({ company: this.company.trim(), role: this.role.trim() });
    this.company = '';
    this.role = '';
  }
}
