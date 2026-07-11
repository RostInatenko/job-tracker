import { TestBed } from '@angular/core/testing';
import { BoardPage } from './board-page';

describe('BoardPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardPage],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BoardPage);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
