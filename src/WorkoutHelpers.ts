import { DynamoDB } from 'aws-sdk';
import { Workout } from './ServiceTypes';

const dynamoDB = new DynamoDB.DocumentClient();

async function checkIfExistingWorkout(workoutId): Promise<boolean> {
  let queryParams: DynamoDB.DocumentClient.QueryInput = {
    TableName: process.env.WORKOUT_TABLE,
    KeyConditionExpression: 'id = :workoutId',
    ExpressionAttributeValues: {
      ':workoutId': workoutId,
    },
  };
  let queryOutput = await dynamoDB.query(queryParams).promise();

  console.log('Query output: ', JSON.stringify(queryOutput));

  return queryOutput.Count > 0;
}

async function updateWorkout(workout: Workout) {
  // Set updateExpression
  let updateExpressionStr = 'SET ';
  let expressionAttributeNames = {};
  let expressionAttributeValues = {};
  let fieldsToUpdate = 0;
  for (let [key, val] of Object.entries(workout)) {
    if (key != 'id') {
      let valPointer = ':val' + fieldsToUpdate;
      let keyPointer = '#key' + fieldsToUpdate;
      updateExpressionStr += keyPointer + ' = ' + valPointer + ',';
      expressionAttributeNames[keyPointer] = key;
      expressionAttributeValues[valPointer] = val;
      fieldsToUpdate++;
    }
  }

  // Update existring entry
  if (fieldsToUpdate > 0) {
    let updateRequest: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.WORKOUT_TABLE,
      Key: {
        id: workout.id,
      },
      UpdateExpression: updateExpressionStr.slice(0, -1),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    };
    return dynamoDB.update(updateRequest).promise();
  } else {
    return;
  }
}

export async function saveOrUpdateWorkout(workout: Workout, userId: string) {
  let workoutId = workout.id;
  let isExistingWorkout = await checkIfExistingWorkout(workoutId);

  if (isExistingWorkout) {
    return updateWorkout(workout);
  } else {
    // Put a new entry
    let putRequest: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.WORKOUT_TABLE,
      Item: workout,
    };
    let putRequestPromise = dynamoDB.put(putRequest).promise();

    // Add workout to user
    let updateUserWorkoutsRequest: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.USER_WORKOUT_TABLE,
      Key: {
        userId: userId,
      },
      UpdateExpression: 'ADD workouts :workout',
      ExpressionAttributeValues: {
        ':workout': dynamoDB.createSet([workoutId]),
      },
    };
    let updateUserWorkoutsPromise = dynamoDB
      .update(updateUserWorkoutsRequest)
      .promise();

    return { ...putRequestPromise, ...updateUserWorkoutsPromise };
  }
}

export async function getWorkout(id: string): Promise<Workout> {
  let getRequest: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.WORKOUT_TABLE,
    Key: {
      id: id,
    },
  };

  let getResult = await dynamoDB.get(getRequest).promise();

  console.log('Got Workout: ', JSON.stringify(getResult.Item));

  return getResult.Item ? (getResult.Item as Workout) : undefined;
}

async function getWorkoutIdsForUser(userId: string): Promise<string[]> {
  let getRequest: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.USER_WORKOUT_TABLE,
    Key: {
      userId: userId,
    },
  };

  let getResult = await dynamoDB.get(getRequest).promise();

  return getResult.Item && getResult.Item['workouts']
    ? getResult.Item['workouts'].values
    : ([] as string[]);
}

async function getWorkoutData(workoutId: string): Promise<Workout> {
  let getRequest: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.WORKOUT_TABLE,
    Key: {
      id: workoutId,
    },
  };
  let result = await dynamoDB.get(getRequest).promise();
  return (result.Item as Workout) || undefined;
}

export async function getWorkoutsForUserId(userId: string): Promise<Workout[]> {
  let workoutIds = await getWorkoutIdsForUser(userId);

  console.log(`Workouts for userId ${userId}: `, workoutIds);

  // Pull workout data from Workout Table
  let workouts = workoutIds.reduce(async (promise, id) => {
    let res = await promise;

    let result = await getWorkoutData(id);
    if (result) {
      res.push(result);
    }

    return res;
  }, Promise.resolve([] as Workout[]));

  console.log('Workouts to return:', JSON.stringify(workouts));
  return workouts;
}
