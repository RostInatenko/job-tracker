import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, TimeoutError } from 'rxjs';
import { JobPostingExtraction, LlmService } from '../../data-access/llm.service';
import { PastePostingModal } from './paste-posting-modal';

describe('PastePostingModal', () => {
  let extraction$: Subject<JobPostingExtraction>;
  let fixture: ComponentFixture<PastePostingModal>;
  let root: HTMLElement;

  const extraction: JobPostingExtraction = {
    company: 'Acme',
    role: 'Angular Developer',
    techStack: ['Angular', 'RxJS'],
    salary: '4000 EUR',
    link: null,
    workMode: 'REMOTE',
  };

  beforeEach(async () => {
    extraction$ = new Subject<JobPostingExtraction>();
    await TestBed.configureTestingModule({
      imports: [PastePostingModal],
      providers: [{ provide: LlmService, useValue: { extractJobPosting: () => extraction$ } }],
    }).compileComponents();

    fixture = TestBed.createComponent(PastePostingModal);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function buttonLabelled(label: string): HTMLButtonElement | undefined {
    return Array.from(root.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === label,
    );
  }

  async function startExtraction(): Promise<void> {
    const textarea = root.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'Angular developer wanted';
    textarea.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    buttonLabelled('Extract details')!.click();
    fixture.detectChanges();
  }

  async function failWith(error: unknown): Promise<void> {
    await startExtraction();
    extraction$.error(error);
    fixture.detectChanges();
  }

  it('shows the extracted details for review', async () => {
    await startExtraction();
    expect(root.textContent).toContain('Reading the posting');

    extraction$.next(extraction);
    fixture.detectChanges();

    const company = root.querySelector<HTMLInputElement>('input[formControlName="company"]');
    expect(company?.value).toBe('Acme');
  });

  it('lets the user cancel while the posting is being read', async () => {
    await startExtraction();

    buttonLabelled('Cancel')!.click();
    fixture.detectChanges();

    expect(root.querySelector('textarea')).toBeTruthy();
    expect(root.textContent).not.toContain('Reading the posting');
  });

  it('ignores an answer that arrives after the user cancelled', async () => {
    await startExtraction();
    buttonLabelled('Cancel')!.click();

    extraction$.next(extraction);
    fixture.detectChanges();

    expect(root.querySelector('textarea')).toBeTruthy();
    expect(root.querySelector('input[formControlName="company"]')).toBeNull();
  });

  it('stops waiting for the answer when the modal is destroyed', async () => {
    await startExtraction();
    expect(extraction$.observed).toBe(true);

    fixture.destroy();

    expect(extraction$.observed).toBe(false);
  });

  it('explains that the daily limit was reached and hides Try again', async () => {
    await failWith(new HttpErrorResponse({ status: 429 }));

    expect(root.textContent).toContain('limit has been reached for today');
    expect(buttonLabelled('Try again')).toBeUndefined();
    expect(buttonLabelled('Fill in manually')).toBeTruthy();
  });

  it('says the service is busy on a 503 and offers Try again', async () => {
    await failWith(new HttpErrorResponse({ status: 503 }));

    expect(root.textContent).toContain('busy right now');
    expect(buttonLabelled('Try again')).toBeTruthy();
  });

  it('says it took too long on a 504', async () => {
    await failWith(new HttpErrorResponse({ status: 504 }));

    expect(root.textContent).toContain('took too long');
  });

  it('says it took too long when the request times out in the browser', async () => {
    await failWith(new TimeoutError());

    expect(root.textContent).toContain('took too long');
    expect(buttonLabelled('Try again')).toBeTruthy();
  });

  it('falls back to a general message for other failures', async () => {
    await failWith(new HttpErrorResponse({ status: 500 }));

    expect(root.textContent).toContain('Could not extract details');
  });
});
