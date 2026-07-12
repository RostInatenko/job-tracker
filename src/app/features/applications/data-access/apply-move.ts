import { BOARD_COLUMNS, JobApplication, MovePayload } from './application.model';
import { groupByStatus } from './group-by-status';

export function applyMove(applications: JobApplication[], move: MovePayload): JobApplication[] {
  const { status, previousStatus, previousIndex, currentIndex } = move;
  const grouped = groupByStatus(applications);

  const sourceList = [...grouped[previousStatus]];
  const [moved] = sourceList.splice(previousIndex, 1);
  const movedApplication: JobApplication = { ...moved, status };

  if (previousStatus === status) {
    sourceList.splice(currentIndex, 0, movedApplication);
    grouped[status] = sourceList;
  } else {
    const targetList = [...grouped[status]];
    targetList.splice(currentIndex, 0, movedApplication);
    grouped[previousStatus] = sourceList;
    grouped[status] = targetList;
  }

  return BOARD_COLUMNS.flatMap((column) => grouped[column.status]);
}

export function invertMove(move: MovePayload): MovePayload {
  return {
    status: move.previousStatus,
    previousStatus: move.status,
    previousIndex: move.currentIndex,
    currentIndex: move.previousIndex,
  };
}
