import { lambdaWrap } from './Utils';
import {
  SaveCompletedWorkoutRequest,
  GetWorkoutLogForUserRequest,
  GetWorkoutLogForUserResponse,
} from './ServiceTypes';
import {
  saveToWorkoutLog,
  getCompletedWorkoutsForUser,
} from './workoutLogHelpers';

async function saveCompletedWorkout(r: SaveCompletedWorkoutRequest) {
  return saveToWorkoutLog(r.completedWorkout, r.userId);
}

async function getWorkoutLogForUser(
  r: GetWorkoutLogForUserRequest
): Promise<GetWorkoutLogForUserResponse> {
  return { completedWorkouts: await getCompletedWorkoutsForUser(r.userId) };
}

module.exports = {
  saveCompletedWorkout: lambdaWrap(saveCompletedWorkout),
  getWorkoutLogForUser: lambdaWrap(getWorkoutLogForUser),
};
