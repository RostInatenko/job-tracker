import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';

const EXTRACT_TIMEOUT_MS = 30000;

export interface JobPostingExtraction {
  company: string;
  role: string;
  techStack: string[];
  salary: string | null;
  link: string | null;
  workMode: 'OFFICE' | 'HYBRID' | 'REMOTE' | null;
}

@Injectable({ providedIn: 'root' })
export class LlmService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/llm`;

  extractJobPosting(jobPosting: string): Observable<JobPostingExtraction> {
    return this.http
      .post<JobPostingExtraction>(`${this.baseUrl}/extract`, { jobPosting })
      .pipe(timeout(EXTRACT_TIMEOUT_MS));
  }
}
