export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  dateApplied: string;
  notes?: string;
  link?: string;
}

export interface BoardColumnConfig {
  status: ApplicationStatus;
  label: string;
}

export const BOARD_COLUMNS: readonly BoardColumnConfig[] = [
  { status: 'applied', label: 'Applied' },
  { status: 'interview', label: 'Interview' },
  { status: 'offer', label: 'Offer' },
  { status: 'rejected', label: 'Rejected' },
];
