import { lambdaWrap, lambdaGetWrap } from './Utils';
import {
  SaveExerciseRequest,
  GetExercisesRequest,
  GetExercisesResponse,
  GetAllExercisesResponse,
  Exercise,
} from './ServiceTypes';
import { saveNewExercise, getExercise } from './ExerciseHelpers';

async function saveExercise(r: SaveExerciseRequest) {
  return saveNewExercise(r.exercise);
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
  getExercises: lambdaWrap(getExercises),
  getAllExercises: lambdaGetWrap(getAllExercises),
};
