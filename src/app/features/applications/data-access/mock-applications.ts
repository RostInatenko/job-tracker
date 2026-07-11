import { JobApplication } from './application.model';

export const MOCK_APPLICATIONS: JobApplication[] = [
  {
    id: '1',
    company: 'Nordic Fintech',
    role: 'Mid-level Angular Developer',
    status: 'applied',
    dateApplied: '2026-06-28',
    link: 'https://example.com/jobs/nordic-fintech',
  },
  {
    id: '2',
    company: 'Vantage Health',
    role: 'Frontend Engineer',
    status: 'applied',
    dateApplied: '2026-07-01',
  },
  {
    id: '3',
    company: 'Cobalt Systems',
    role: 'Angular Developer',
    status: 'interview',
    dateApplied: '2026-06-20',
    notes: 'Technical interview scheduled for next week.',
  },
  {
    id: '4',
    company: 'USENSE',
    role: 'Junior Angular Developer',
    status: 'interview',
    dateApplied: '2026-06-15',
    notes: 'Second round completed, waiting on feedback.',
  },
  {
    id: '5',
    company: 'BrightPath Media',
    role: 'Frontend Developer',
    status: 'offer',
    dateApplied: '2026-06-10',
  },
  {
    id: '6',
    company: 'Legacy Retail Co',
    role: 'Angular Developer',
    status: 'rejected',
    dateApplied: '2026-05-30',
    notes: 'Went with a candidate with more NgRx experience.',
  },
];
