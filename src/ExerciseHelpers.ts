import { DynamoDB } from 'aws-sdk';
import { Exercise } from './ServiceTypes';
import { Bool } from 'aws-sdk/clients/clouddirectory';

const dynamoDB = new DynamoDB.DocumentClient();

async function checkIfExistingExercise(id: string): Promise<Bool> {
  let queryParams: DynamoDB.DocumentClient.QueryInput = {
    TableName: process.env.USER_TABLE,
    KeyConditionExpression: 'id = :exerciseId',
    ExpressionAttributeValues: {
      ':exerciseId': id,
    },
  };
  let queryOutput = await dynamoDB.query(queryParams).promise();

  console.log('Query output: ', JSON.stringify(queryOutput));

  return queryOutput.Count > 0;
}

export async function saveNewExercise(exercise: Exercise, userId: string) {
  let isExistingExercise = await checkIfExistingExercise(exercise.id);

  if (!isExistingExercise) {
    // Put a new entry
    let putRequest: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.EXERCISE_TABLE,
      Item: exercise,
    };
    let putRequestPromise = dynamoDB.put(putRequest).promise();

    // Add exercise to user
    let updateUserExerciseRequest: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.USER_EXERCISE_TABLE,
      Key: {
        userId: userId,
      },
      UpdateExpression: 'ADD exercises :exercise',
      ExpressionAttributeValues: {
        ':exercise': dynamoDB.createSet([exercise.id]),
      },
    };
    let updateUserExercisesPromise = dynamoDB
      .update(updateUserExerciseRequest)
      .promise();

    return { ...putRequestPromise, ...updateUserExercisesPromise };
  } else {
    return;
  }
}

export async function getExercise(id: string): Promise<Exercise> {
  let getRequest: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.EXERCISE_TABLE,
    Key: {
      id: id,
    },
  };

  let getResult = await dynamoDB.get(getRequest).promise();

  console.log('Got Exercise: ', JSON.stringify(getResult.Item));

  return getResult.Item ? (getResult.Item as Exercise) : undefined;
}

async function getExerciseIdsForUser(userId: string): Promise<string[]> {
  let getRequest: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.USER_EXERCISE_TABLE,
    Key: {
      userId: userId,
    },
  };

  let getResult = await dynamoDB.get(getRequest).promise();

  return getResult.Item && getResult.Item['exercises']
    ? getResult.Item['exercises'].values
    : ([] as string[]);
}

export async function getExercisesForUserId(
  userId: string
): Promise<Exercise[]> {
  let exerciseIds = await getExerciseIdsForUser(userId);

  console.log(`Exercises for userId ${userId}: `, exerciseIds);

  // Pull exercise data from Exercises Table
  let exercises = exerciseIds.reduce(async (promise, id) => {
    let res = await promise;

    let result = await getExercise(id);
    if (result) {
      res.push(result);
    }

    return res;
  }, Promise.resolve([] as Exercise[]));

  console.log('Exercises to return:', JSON.stringify(exercises));
  return exercises;
}
