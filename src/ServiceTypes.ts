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
  muscleGroup?: string;
  isValidated?: boolean;
  popularity?: number;
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

export type Workout = {
  id: string;
  name: string;
  focus?: string;
  type?: string;
  sets: Set[];
  rounds?: Round[];
};

export type Set = {
  exId: string;
  time?: number;
  reps?: number;
  sets?: number;
};

export type Round = {
  id: number;
  sets?: Set[];
};

export type SaveWorkoutRequest = {
  workout: Workout;
  userId: string;
};

export type GetWorkoutsRequest = {
  ids: string[];
};

export type GetWorkoutsResponse = {
  workouts: Workout[];
};

export type GetWorkoutsForUserRequest = {
  userId: string;
};

export type GetWorkoutsForUserResponse = {
  workouts: Workout[];
};

export type CompletedWorkout = {
  wlId: string;
  workout: Workout;
  time: number;
  completionTs: number;
};

export type CompletedWorkoutShort = {
  wlId: string;
  workoutId: string;
  time: number;
  completionTs: number;
};

export type SaveCompletedWorkoutRequest = {
  completedWorkout: CompletedWorkoutShort;
  userId: string;
};

export type GetWorkoutLogForUserRequest = {
  userId: string;
};

export type GetWorkoutLogForUserResponse = {
  completedWorkouts: CompletedWorkout[];
};
