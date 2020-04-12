export type UserData = {
  id: string;
  name?: string;
  gender?: string;
  age?: string;
  workouts?: [string];
  exercises?: [string];
};

export type SaveUserRequest = {
  user: UserData;
};

export type GetUserRequest = {
  id: string;
};

export type GetUserResponse = {
  user: UserData;
};

export type Exercise = {
  id: string;
  bodyPart?: string;
  musleGroup?: string;
};

export type SaveExerciseRequest = {
  exercise: Exercise;
};

export type GetExercisesRequest = {
  exerciseIds: string[];
};

export type GetExercisesResponse = {
  exercises: Exercise[];
};

export type GetAllExercisesResponse = {
  exercises: Exercise[];
};
