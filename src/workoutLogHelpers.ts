import { CompletedWorkout, CompletedWorkoutShort, Round, Workout, WorkoutLogItem } from './ServiceTypes';
import { DynamoDB } from 'aws-sdk';
import { getWorkout } from './WorkoutHelpers';

const dynamoDB = new DynamoDB.DocumentClient();

const workoutLogTable = process.env.WORKOUT_LOG_TABLE;

type WorkoutLogEntry = {
  userId: string;
  wlId: string;
  workoutId: string;
  time?: number;
  startTS: number;
};

export async function saveCompletedWorkoutToLog( // Deprecated after 1.3
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

export async function saveToWorkoutLog(
  workoutLogItem: WorkoutLogItem,
  userId: string
) {
  let workoutLogEntry: WorkoutLogEntry = {
    ...{ userId: userId },
    ...workoutLogItem,
  };

  let putRequest: DynamoDB.DocumentClient.PutItemInput = {
    TableName: workoutLogTable,
    Item: workoutLogEntry,
  };

  return dynamoDB.put(putRequest).promise();
}

export async function getWorkoutLogEntriesForUser(userId): Promise<WorkoutLogEntry[]> {
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

  let workouts = await workoutLogEntries.reduce(async (promise, item) => {
    // pull workout from WorkoutTable
    let workout = await getWorkout(item.workoutId);

    let res = await promise;

    if (workout) {

      let cleanWorkout: Workout = {
        id: workout.id,
        name: workout.name,
        focus: workout.focus,
        notes: workout.notes || "",
        type: workout.type,
        rounds: workout.rounds as Round[]
      }

      let completedWorkout: CompletedWorkout = {
        wlId: item.wlId,
        workout: cleanWorkout,
        time: item.time,
        startTS: item.startTS,
      };

      res.push(completedWorkout);

      return res;
    } else {
      return res;
    }
  }, Promise.resolve([]));

  return workouts.sort((a, b) => a.startTS - b.startTS);
}

export async function deleteWorkoutLogItem(userId: string, wlId: string) {

  let deleteRequest: DynamoDB.DocumentClient.DeleteItemInput = {
    TableName: workoutLogTable,
    Key: {
      userId: userId,
      wlId: wlId
    }
  }

  return dynamoDB.delete(deleteRequest).promise()
}

export async function batchPutToWorkoutLog(workoutLogEntries: WorkoutLogEntry[]) {
  let putRequestItems = workoutLogEntries.map( item => {
    return {PutRequest: {
      Item: item
    }}
  })

  let batchWriteRequest: DynamoDB.DocumentClient.BatchWriteItemInput = {
    RequestItems: {
      [workoutLogTable]: putRequestItems
    }
  }

  return doBatchWriteItems(batchWriteRequest);
}

export async function batchDeleteFromWorkoutLog(workoutLogEntries: WorkoutLogEntry[]) {
  let deleteRequestItmes = workoutLogEntries.map( item => {
    return {DeleteRequest: {
        Key: {
          userId: item.userId,
          wlId: item.wlId,
        }
      }
      
    }
  })

  let batchWriteRequest: DynamoDB.DocumentClient.BatchWriteItemInput = {
    RequestItems: {
      [workoutLogTable]: deleteRequestItmes
    }
  }

  return doBatchWriteItems(batchWriteRequest);
}

async function doBatchWriteItems(batchWriteRequest: DynamoDB.DocumentClient.BatchWriteItemInput) {
  try {
    let batchWriteResponse = await dynamoDB.batchWrite(batchWriteRequest).promise();
    if (batchWriteResponse.UnprocessedItems && batchWriteResponse.UnprocessedItems[workoutLogTable] && batchWriteResponse.UnprocessedItems[workoutLogTable].length > 0) {
      console.log(`Batch write returned uprocessed items: ${JSON.stringify(batchWriteResponse.UnprocessedItems)}`)
      batchWriteRequest.RequestItems = batchWriteResponse.UnprocessedItems
      doBatchWriteItems(batchWriteRequest);
    }
  } catch (err) {
    console.error(err);
  }
}
