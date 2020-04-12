import { lambdaWrap } from './Utils';
import {
  SaveWorkoutRequest,
  GetWorkoutsRequest,
  GetWorkoutsResponse,
  Workout,
} from './ServiceTypes';
import { saveOrUpdateWorkout, getWorkout } from './WorkoutHelpers';

async function saveWorkout(r: SaveWorkoutRequest) {
  return saveOrUpdateWorkout(r.workout);
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

module.exports = {
  saveWorkout: lambdaWrap(saveWorkout),
  getWorkouts: lambdaWrap(getWorkouts),
};
