import { selectApplicationsByStatus } from './applications.selectors';
import { JobApplication } from './application.model';

describe('selectApplicationsByStatus', () => {
  it('excludes archived applications from the board columns', () => {
    const applications: JobApplication[] = [
      {
        id: '1',
        company: 'Active Co',
        role: 'Angular Developer',
        status: 'applied',
        dateApplied: '2026-07-01',
      },
      {
        id: '2',
        company: 'Archived Co',
        role: 'Angular Developer',
        status: 'applied',
        dateApplied: '2026-06-01',
        archived: true,
      },
    ];

    const grouped = selectApplicationsByStatus.projector(applications);

    expect(grouped.applied.map((application) => application.id)).toEqual(['1']);
  });
});
