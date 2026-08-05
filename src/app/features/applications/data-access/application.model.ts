export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected';
export type WorkMode = 'office' | 'hybrid' | 'remote';

export interface InterviewStage {
  stage: string;
  date: string;
  time?: string;
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
  workMode?: WorkMode;
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

export interface WorkModeOption {
  value: WorkMode;
  label: string;
}

export const WORK_MODE_OPTIONS: readonly WorkModeOption[] = [
  { value: 'office', label: 'Office' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
];

export interface MovePayload {
  status: ApplicationStatus;
  previousStatus: ApplicationStatus;
  previousIndex: number;
  currentIndex: number;
}

export interface TechStackFrequency {
  tech: string;
  count: number;
}

export interface StatusBreakdownEntry {
  status: ApplicationStatus;
  count: number;
}

export interface ApplicationStats {
  totalApplications: number;
  responseRate: number;
  avgDaysToFirstInterview: number | null;
  avgInterviewStageCount: number | null;
  topTechStack: TechStackFrequency[];
  statusBreakdown: StatusBreakdownEntry[];
  staleApplicationsCount: number;
}
