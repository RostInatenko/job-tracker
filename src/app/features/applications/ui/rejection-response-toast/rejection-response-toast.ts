import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-rejection-response-toast',
  templateUrl: './rejection-response-toast.html',
})
export class RejectionResponseToast {
  company = input.required<string>();
  respond = output<boolean>();
}
