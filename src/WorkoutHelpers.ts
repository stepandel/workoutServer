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

export async function saveOrUpdateWorkout(workout: Workout) {
  let workoutId = workout.id;
  let isExistingWorkout = await checkIfExistingWorkout(workoutId);

  if (isExistingWorkout) {
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
          id: workoutId,
        },
        UpdateExpression: updateExpressionStr.slice(0, -1),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      };
      return dynamoDB.update(updateRequest).promise();
    } else {
      return;
    }
  } else {
    // Put a new entry
    let putRequest: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.WORKOUT_TABLE,
      Item: workout,
    };
    return dynamoDB.put(putRequest).promise();
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
