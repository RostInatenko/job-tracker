import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApplicationStats,
  InterviewStage,
  JobApplication,
  RejectionBreakdownEntry,
} from './application.model';

interface ApplicationRow {
  id: string;
  company: string;
  role: string;
  status: string;
  dateApplied: string;
  notes: string | null;
  link: string | null;
  techStack: string[];
  salary: string | null;
  interviewStages: InterviewStage[];
  workMode: string | null;
  archived: boolean;
  heardBack: boolean | null;
}

function toApplication(row: ApplicationRow): JobApplication {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    status: row.status.toLowerCase() as JobApplication['status'],
    dateApplied: row.dateApplied.slice(0, 10),
    notes: row.notes ?? undefined,
    link: row.link ?? undefined,
    techStack: row.techStack,
    salary: row.salary ?? undefined,
    interviewStages: row.interviewStages,
    workMode: (row.workMode?.toLowerCase() as JobApplication['workMode']) ?? undefined,
    archived: row.archived,
    heardBack: row.heardBack ?? undefined,
  };
}

function toCreateBody(application: JobApplication) {
  return {
    id: application.id,
    company: application.company,
    role: application.role,
    status: application.status.toUpperCase(),
    dateApplied: application.dateApplied,
    notes: application.notes ?? null,
    link: application.link ?? null,
    techStack: application.techStack ?? [],
    salary: application.salary ?? null,
    interviewStages: application.interviewStages ?? [],
    workMode: application.workMode?.toUpperCase() ?? null,
    archived: application.archived ?? false,
    heardBack: application.heardBack ?? null,
  };
}

interface StatsResponse {
  totalApplications: number;
  responseRate: number;
  avgDaysToFirstInterview: number | null;
  avgInterviewStageCount: number | null;
  topTechStack: { tech: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  staleApplicationsCount: number;
  rejectionBreakdown: RejectionBreakdownEntry[];
}

function toStats(response: StatsResponse): ApplicationStats {
  return {
    ...response,
    statusBreakdown: response.statusBreakdown.map((entry) => ({
      status: entry.status.toLowerCase() as JobApplication['status'],
      count: entry.count,
    })),
  };
}

function toUpdateBody(application: JobApplication) {
  return {
    company: application.company,
    role: application.role,
    status: application.status.toUpperCase(),
    dateApplied: application.dateApplied,
    notes: application.notes ?? null,
    link: application.link ?? null,
    techStack: application.techStack ?? [],
    salary: application.salary ?? null,
    interviewStages: application.interviewStages ?? [],
    workMode: application.workMode?.toUpperCase() ?? null,
    archived: application.archived ?? false,
    heardBack: application.heardBack ?? null,
  };
}

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/applications`;

  getAll(): Observable<JobApplication[]> {
    return this.http
      .get<ApplicationRow[]>(this.baseUrl)
      .pipe(map((rows) => rows.map(toApplication)));
  }

  add(application: JobApplication): Observable<void> {
    return this.http.post<void>(this.baseUrl, toCreateBody(application));
  }

  update(application: JobApplication): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${application.id}`, toUpdateBody(application));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getStats(): Observable<ApplicationStats> {
    return this.http.get<StatsResponse>(`${this.baseUrl}/stats`).pipe(map(toStats));
  }

  getArchived(): Observable<JobApplication[]> {
    return this.http
      .get<ApplicationRow[]>(this.baseUrl, { params: { archived: true } })
      .pipe(map((rows) => rows.map(toApplication)));
  }
}
