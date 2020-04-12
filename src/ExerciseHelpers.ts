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

export async function saveNewExercise(exercise: Exercise) {
  let isExistingExercise = await checkIfExistingExercise(exercise.id);

  if (!isExistingExercise) {
    // Put a new entry
    let putRequest: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.EXERCISE_TABLE,
      Item: exercise,
    };
    return dynamoDB.put(putRequest).promise();
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
