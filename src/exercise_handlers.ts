import { lambdaWrap, lambdaGetWrap } from './Utils';
import {
  SaveExerciseRequest,
  GetExercisesRequest,
  GetExercisesResponse,
  GetAllExercisesResponse,
  Exercise,
  GetExercisesForUserRequest,
  GetExercisesForUserResponse,
} from './ServiceTypes';
import {
  saveNewExercise,
  getExercise,
  getExercisesForUserId,
} from './ExerciseHelpers';

async function saveExercise(r: SaveExerciseRequest) {
  return saveNewExercise(r.exercise, r.userId);
}

async function getExercisesForUser(
  r: GetExercisesForUserRequest
): Promise<GetExercisesForUserResponse> {
  let exercises = await getExercisesForUserId(r.userId);
  return { exercises: exercises };
}

async function getExercises(
  r: GetExercisesRequest
): Promise<GetExercisesResponse> {
  let exercises = r.exerciseIds.reduce(async (promise, id) => {
    let res = await promise;

    let result = await getExercise(id);
    if (result) {
      res.push(result);
    }

    return res;
  }, Promise.resolve([] as Exercise[]));

  return { exercises: await exercises };
}

async function getAllExercises(): Promise<GetAllExercisesResponse> {
  return undefined;
}

module.exports = {
  saveExercise: lambdaWrap(saveExercise),
  getExercisesForUser: lambdaWrap(getExercisesForUser),
  getExercises: lambdaWrap(getExercises),
  getAllExercises: lambdaGetWrap(getAllExercises),
};
