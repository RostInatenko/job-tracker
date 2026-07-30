import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface JobPostingExtraction {
  company: string;
  role: string;
  techStack: string[];
  salary: string | null;
}

@Injectable({ providedIn: 'root' })
export class LlmService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/llm`;

  extractJobPosting(jobPosting: string): Observable<JobPostingExtraction> {
    return this.http.post<JobPostingExtraction>(`${this.baseUrl}/extract`, { jobPosting });
  }
}
