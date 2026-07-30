export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface InterviewStage {
  stage: string;
  date: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  dateApplied: string;
  notes?: string;
  link?: string;
  techStack?: string[];
  salary?: string;
  interviewStages?: InterviewStage[];
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

export interface MovePayload {
  status: ApplicationStatus;
  previousStatus: ApplicationStatus;
  previousIndex: number;
  currentIndex: number;
}
