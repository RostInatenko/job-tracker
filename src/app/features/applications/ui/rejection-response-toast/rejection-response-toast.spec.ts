import { TestBed } from '@angular/core/testing';
import { RejectionResponseToast } from './rejection-response-toast';

describe('RejectionResponseToast', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectionResponseToast],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(RejectionResponseToast);
    fixture.componentRef.setInput('company', 'Nordic Fintech');
    fixture.detectChanges();
    return fixture;
  }

  it('renders the company in the prompt', () => {
    const fixture = createComponent();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nordic Fintech');
  });

  it('emits respond(true) when Yes is clicked', () => {
    const fixture = createComponent();
    let responded: boolean | undefined;
    fixture.componentInstance.respond.subscribe((value) => (responded = value));

    const yesButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.trim() === 'Yes');
    yesButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(responded).toBe(true);
  });

  it('emits respond(false) when No is clicked', () => {
    const fixture = createComponent();
    let responded: boolean | undefined;
    fixture.componentInstance.respond.subscribe((value) => (responded = value));

    const noButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.trim() === 'No');
    noButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(responded).toBe(false);
  });
});
