import { lambdaWrap } from './Utils';
import {
  SaveCompletedWorkoutRequest,
  GetWorkoutLogForUserRequest,
  GetWorkoutLogForUserResponse,
  DeleteWorkoutFromLogRequest,
  SaveWorkoutLogItemRequest,
} from './ServiceTypes';
import {
  saveToWorkoutLog,
  saveCompletedWorkoutToLog,
  getCompletedWorkoutsForUser,
  deleteWorkoutLogItem,
} from './workoutLogHelpers';

async function saveCompletedWorkout(r: SaveCompletedWorkoutRequest) { // Deprecated after 1.3
  return saveCompletedWorkoutToLog(r.completedWorkout, r.userId);
}

async function saveWorkoutLogItem(r: SaveWorkoutLogItemRequest) {
  return saveToWorkoutLog(r.workoutLogItem, r.userId)
}

async function getWorkoutLogForUser(
  r: GetWorkoutLogForUserRequest
): Promise<GetWorkoutLogForUserResponse> {
  return {
    completedWorkouts: await getCompletedWorkoutsForUser(r.userId),
    scheduledWorkouts: []
  };
}

async function deleteWorkoutFromLog(r: DeleteWorkoutFromLogRequest) {
  return deleteWorkoutLogItem(r.userId, r.wlId);
}

module.exports = {
  saveCompletedWorkout: lambdaWrap(saveCompletedWorkout),
  saveWorkoutLogItem: lambdaWrap(saveWorkoutLogItem),
  getWorkoutLogForUser: lambdaWrap(getWorkoutLogForUser),
  deleteWorkoutFromLog: lambdaWrap(deleteWorkoutFromLog)
};
