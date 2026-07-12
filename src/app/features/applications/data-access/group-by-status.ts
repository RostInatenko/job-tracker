import { ApplicationStatus, BOARD_COLUMNS, JobApplication } from './application.model';

export function groupByStatus(
  applications: JobApplication[],
): Record<ApplicationStatus, JobApplication[]> {
  const grouped = Object.fromEntries(
    BOARD_COLUMNS.map((column) => [column.status, [] as JobApplication[]]),
  ) as Record<ApplicationStatus, JobApplication[]>;

  for (const application of applications) {
    grouped[application.status].push(application);
  }

  return grouped;
}
