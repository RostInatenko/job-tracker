import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-undo-toast',
  templateUrl: './undo-toast.html',
})
export class UndoToast {
  message = input.required<string>();
  undo = output<void>();
}
