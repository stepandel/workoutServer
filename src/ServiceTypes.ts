import { bool } from 'aws-sdk/clients/signer';

export type User = {
  id: string;
  password: string;
};

export type SaveNewUserWithoutAccountRequest = {
  id: string;
}

export type SaveNewUserRequest = {
  user: User;
};

export type CheckUserRequest = {
  user: User;
};

export type CheckUserResponse = {
  success: bool;
};

export type UserData = {
  id: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  city?: string;
  state?: string;
  sport?: string;
  weight?: number;
  birthDate?: Date;
  sex?: string;
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

export type UpdateUserImageReqest = {
  userId: string;
  userImage: string;
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
  userId: string;
};

export type GetExercisesForUserRequest = {
  userId: string;
};

export type GetExercisesForUserResponse = {
  exercises: Exercise[];
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
  notes?: string;
  type?: string;
  rounds?: Round[];
};

export type Set = {
  id: string;
  exId: string;
  time?: number;
  reps?: number;
  weight?: number;
};

export type Round = {
  id: string;
  sets?: Set[][];
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
  startTS: number;
};

export type CompletedWorkoutShort = {
  wlId: string;
  workoutId: string;
  time: number;
  startTS: number;
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

export type DeleteWorkoutFromLogRequest = {
  userId: string;
  wlId: string;
}

export type Stats = {
  totalWorkoutsCompleted: number
  totalWeightLifted: number
  totalRepsCompleted: number
  totalSetsCompleted: number
  totalTimeWorkingout: number
}

export type WeeklyStats = {
  workoutsCompleted: number
  weightLifted: number
  repsCompleted: number
  setsCompleted: number
  timeWorkingout: number
}

export type SaveStatsRequest = {
  userId: string;
  stats: Stats;
};

export type GetStatsRequest = {
  userId: string;
};

export type GetStatsResponse = {
  stats: Stats;
};

export type GetWorkoutsAndStatsForUserRequest = {
  userId: string
  timezoneOffset: number
}

export type GetWorkoutsAndStatsForUserResponse = {
  completedWorkouts: CompletedWorkout[]
  stats: Stats
  weeklyStats: WeeklyStats
}
