import { CompletedWorkout, CompletedWorkoutShort } from './ServiceTypes';
import { DynamoDB } from 'aws-sdk';
import { getWorkout } from './WorkoutHelpers';

const dynamoDB = new DynamoDB.DocumentClient();

const workoutLogTable = process.env.WORKOUT_LOG_TABLE;

type WorkoutLogEntry = {
  userId: string;
  wlId: string;
  workoutId: string;
  time: number;
  completionTs: number;
};

export async function saveToWorkoutLog(
  completedWorkout: CompletedWorkoutShort,
  userId: string
) {
  let workoutLogEntry: WorkoutLogEntry = {
    ...{ userId: userId },
    ...completedWorkout,
  };

  let putRequest: DynamoDB.DocumentClient.PutItemInput = {
    TableName: workoutLogTable,
    Item: workoutLogEntry,
  };

  // TODO: - save workout if doesn't exist

  return dynamoDB.put(putRequest).promise();
}

async function getWorkoutLogEntriesForUser(userId): Promise<WorkoutLogEntry[]> {
  let queryRequest: DynamoDB.DocumentClient.QueryInput = {
    TableName: workoutLogTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  let queryResult = await dynamoDB.query(queryRequest).promise();

  return queryResult.Items as WorkoutLogEntry[];
}

export async function getCompletedWorkoutsForUser(
  userId: String
): Promise<CompletedWorkout[]> {
  let workoutLogEntries = await getWorkoutLogEntriesForUser(userId);

  return workoutLogEntries.reduce(async (promise, item) => {
    // pull workout from WorkoutTable
    let workout = await getWorkout(item.workoutId);

    let res = await promise;

    if (workout) {
      let completedWorkout: CompletedWorkout = {
        wlId: item.wlId,
        workout: workout,
        time: item.time,
        completionTs: item.completionTs,
      };

      res.push(completedWorkout);

      return res;
    } else {
      return res;
    }
  }, Promise.resolve([]));
}
