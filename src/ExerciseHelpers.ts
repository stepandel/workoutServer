import { DynamoDB } from 'aws-sdk';
import { Exercise } from './ServiceTypes';
import { Bool } from 'aws-sdk/clients/clouddirectory';

const dynamoDB = new DynamoDB.DocumentClient();

const userTable = process.env.USER_TABLE
const exerciseTable = process.env.EXERCISE_TABLE
const userExerciseTable = process.env.USER_EXERCISE_TABLE

async function checkIfExistingExercise(id: string): Promise<Bool> {
  let queryParams: DynamoDB.DocumentClient.QueryInput = {
    TableName: userTable,
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
      TableName: exerciseTable,
      Item: exercise,
    };
    let putRequestPromise = dynamoDB.put(putRequest).promise();

    let updateUserExercisesPromise = addExercisesToUser(userId, dynamoDB.createSet([exercise.id]))

    return { ...putRequestPromise, ...updateUserExercisesPromise };
  } else {
    return;
  }
}

export async function getExercise(id: string): Promise<Exercise> {
  let getRequest: DynamoDB.DocumentClient.GetItemInput = {
    TableName: exerciseTable,
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
    TableName: userExerciseTable,
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

export async function getExerciseSet(userId: string): Promise<DynamoDB.DocumentClient.DynamoDbSet> {
  let getExercisesRequest: DynamoDB.DocumentClient.GetItemInput = {
    TableName: userExerciseTable,
    Key: {
      userId: userId
    }
  }
  let exercisesResponse = await dynamoDB.get(getExercisesRequest).promise()
  return exercisesResponse.Item && exercisesResponse.Item["exercises"] 
    ? exercisesResponse.Item["exercises"] 
    : undefined;
}

export async function addExercisesToUser(userId: string, exerciseSet: DynamoDB.DocumentClient.DynamoDbSet) {
  let updateRequest: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: userExerciseTable,
    Key: {
      userId: userId
    },
    UpdateExpression: "ADD exercises :exercises",
    ExpressionAttributeValues: {
      ":exercises": exerciseSet
    },
  }
  return dynamoDB.update(updateRequest).promise();
}

export async function deleteUserFromExercises(userId: string) {
  let deleteRequest: DynamoDB.DocumentClient.DeleteItemInput = {
    TableName: userExerciseTable,
    Key: {
      userId: userId
    }
  }

  return dynamoDB.delete(deleteRequest).promise()
}