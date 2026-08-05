import { TestBed } from '@angular/core/testing';
import { GhostIcon } from './ghost-icon';

describe('GhostIcon', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GhostIcon],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GhostIcon);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders an svg with the ghosted tooltip', () => {
    const fixture = TestBed.createComponent(GhostIcon);
    fixture.detectChanges();

    const title = (fixture.nativeElement as HTMLElement).querySelector('svg > title');
    expect(title?.textContent).toBe('Ghosted — no response');
  });
});
