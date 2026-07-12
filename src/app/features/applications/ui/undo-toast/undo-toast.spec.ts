import { TestBed } from '@angular/core/testing';
import { UndoToast } from './undo-toast';

describe('UndoToast', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UndoToast],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(UndoToast);
    fixture.componentRef.setInput('message', 'Nordic Fintech moved to Interview');
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the message', () => {
    const fixture = createComponent();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nordic Fintech moved to Interview');
  });

  it('emits undo when the button is clicked', () => {
    const fixture = createComponent();
    let emitted = false;
    fixture.componentInstance.undo.subscribe(() => (emitted = true));

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(emitted).toBe(true);
  });
});
