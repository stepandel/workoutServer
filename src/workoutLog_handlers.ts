import { lambdaWrap } from './Utils';
import {
  SaveCompletedWorkoutRequest,
  GetWorkoutLogForUserRequest,
  GetWorkoutLogForUserResponse,
  DeleteWorkoutFromLogRequest,
} from './ServiceTypes';
import {
  saveToWorkoutLog,
  getCompletedWorkoutsForUser,
  deleteWorkoutLogItem,
} from './workoutLogHelpers';

async function saveCompletedWorkout(r: SaveCompletedWorkoutRequest) {
  return saveToWorkoutLog(r.completedWorkout, r.userId);
}

async function getWorkoutLogForUser(
  r: GetWorkoutLogForUserRequest
): Promise<GetWorkoutLogForUserResponse> {
  return { completedWorkouts: await getCompletedWorkoutsForUser(r.userId) };
}

async function deleteWorkoutFromLog(r: DeleteWorkoutFromLogRequest) {
  return deleteWorkoutLogItem(r.userId, r.wlId);
}

module.exports = {
  saveCompletedWorkout: lambdaWrap(saveCompletedWorkout),
  getWorkoutLogForUser: lambdaWrap(getWorkoutLogForUser),
  deleteWorkoutFromLog: lambdaWrap(deleteWorkoutFromLog)
};
