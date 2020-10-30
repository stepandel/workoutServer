import { lambdaWrap } from './Utils';
import {
  SaveWorkoutRequest,
  GetWorkoutsRequest,
  GetWorkoutsResponse,
  Workout,
  GetWorkoutsForUserRequest,
  GetWorkoutsForUserResponse,
  DeleteWorkoutsRequest,
} from './ServiceTypes';
import {
  saveOrUpdateWorkout,
  getWorkout,
  getWorkoutsForUserId,
  deleteWorkouts,
  deleteWorkoutsFromUser,
} from './WorkoutHelpers';

async function saveWorkout(r: SaveWorkoutRequest) {
  return saveOrUpdateWorkout(r.workout, r.userId);
}

async function getWorkouts(
  r: GetWorkoutsRequest
): Promise<GetWorkoutsResponse> {
  let workouts = r.ids.reduce(async (promise, id) => {
    let res = await promise;

    let result = await getWorkout(id);
    if (result) {
      res.push(result);
    }

    return res;
  }, Promise.resolve([] as Workout[]));

  return { workouts: await workouts };
}

async function getWorkoutsForUser(
  r: GetWorkoutsForUserRequest
): Promise<GetWorkoutsForUserResponse> {
  let workouts = getWorkoutsForUserId(r.userId);
  return { workouts: await workouts };
}

async function deleteUserWorkouts(r: DeleteWorkoutsRequest) {
  let workoutsPromise = deleteWorkouts(r.workoutIds);
  let userWorkoutsPromise = deleteWorkoutsFromUser(r.userId, r.workoutIds);

  return {...workoutsPromise, ...userWorkoutsPromise}
}

module.exports = {
  saveWorkout: lambdaWrap(saveWorkout),
  getWorkouts: lambdaWrap(getWorkouts),
  getWorkoutsForUser: lambdaWrap(getWorkoutsForUser),
  deleteUserWorkouts: lambdaWrap(deleteUserWorkouts),
};
