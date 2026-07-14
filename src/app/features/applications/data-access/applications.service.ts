import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { JobApplication } from './application.model';

interface ApplicationRow {
  id: string;
  company: string;
  role: string;
  status: string;
  date_applied: string;
  notes: string | null;
  link: string | null;
}

function toApplication(row: ApplicationRow): JobApplication {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    status: row.status as JobApplication['status'],
    dateApplied: row.date_applied,
    notes: row.notes ?? undefined,
    link: row.link ?? undefined,
  };
}

function toRow(application: JobApplication): ApplicationRow {
  return {
    id: application.id,
    company: application.company,
    role: application.role,
    status: application.status,
    date_applied: application.dateApplied,
    notes: application.notes ?? null,
    link: application.link ?? null,
  };
}

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );

  getAll(): Observable<JobApplication[]> {
    return from(this.client.from('applications').select('*').order('created_at')).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }

        return (data as ApplicationRow[]).map(toApplication);
      }),
    );
  }

  add(application: JobApplication): Observable<void> {
    return from(this.client.from('applications').insert(toRow(application))).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      }),
    );
  }

  update(application: JobApplication): Observable<void> {
    return from(
      this.client.from('applications').update(toRow(application)).eq('id', application.id),
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      }),
    );
  }

  delete(id: string): Observable<void> {
    return from(this.client.from('applications').delete().eq('id', id)).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      }),
    );
  }
}
