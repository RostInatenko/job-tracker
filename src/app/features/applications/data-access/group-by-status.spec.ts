import { groupByStatus } from './group-by-status';
import { JobApplication } from './application.model';

describe('groupByStatus', () => {
  it('groups applications under their matching status, preserving order', () => {
    const applications: JobApplication[] = [
      {
        id: '1',
        company: 'Nordic Fintech',
        role: 'Angular Developer',
        status: 'applied',
        dateApplied: '2026-06-28',
      },
      {
        id: '2',
        company: 'Cobalt Systems',
        role: 'Angular Developer',
        status: 'interview',
        dateApplied: '2026-06-20',
      },
      {
        id: '3',
        company: 'Vantage Health',
        role: 'Frontend Engineer',
        status: 'applied',
        dateApplied: '2026-07-01',
      },
    ];

    const grouped = groupByStatus(applications);

    expect(grouped.applied.map((application) => application.id)).toEqual(['1', '3']);
    expect(grouped.interview.map((application) => application.id)).toEqual(['2']);
  });

  it('returns an empty array for every status when there are no applications', () => {
    const grouped = groupByStatus([]);

    expect(grouped.applied).toEqual([]);
    expect(grouped.interview).toEqual([]);
    expect(grouped.offer).toEqual([]);
    expect(grouped.rejected).toEqual([]);
  });
});
