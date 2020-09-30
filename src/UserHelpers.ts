import { DynamoDB } from 'aws-sdk';
import { User, UserData } from './ServiceTypes';

const dynamoDB = new DynamoDB.DocumentClient();

const bcrypt = require('bcryptjs');

async function checkIfExistingUser(userId): Promise<boolean> {
  let queryParams: DynamoDB.DocumentClient.QueryInput = {
    TableName: process.env.USER_TABLE,
    KeyConditionExpression: 'id = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };
  let queryOutput = await dynamoDB.query(queryParams).promise();

  console.log('Query output: ', JSON.stringify(queryOutput));

  return queryOutput.Count > 0;
}

export async function saveUserPassword(user: User) {
  let userId = user.id;
  let isExistingUser = await checkIfExistingUser(userId);

  if (isExistingUser) {
    throw new Error('User Already Exists!');
  } else {
    if (user.password) {
      let hashedPassword = await bcrypt.hashSync(user.password, 10);

      let putRequest: DynamoDB.DocumentClient.PutItemInput = {
        TableName: process.env.USER_TABLE,
        Item: {
          id: user.id,
          password: hashedPassword,
        },
      };
      return dynamoDB.put(putRequest).promise();
    }
  }
}

async function getUserPassword(userId: string) {
  let getRequest: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.USER_TABLE,
    Key: {
      id: userId,
    },
  };
  let result = await dynamoDB.get(getRequest).promise();
  return (result.Item as User) || undefined;
}

export async function checkPassword(user: User): Promise<boolean> {
  let userId = user.id;
  let savedUser = await getUserPassword(userId);

  if (savedUser && savedUser.password) {
    return bcrypt.compareSync(user.password, savedUser.password);
  } else {
    throw new Error("User Doesn't Exist!");
  }
}

export async function saveOrUpdateUser(userData: UserData) {
  let userId = userData.id;
  let isExistingUser = await checkIfExistingUser(userId);

  if (isExistingUser) {
    // Set updateExpression
    let updateExpressionStr = 'SET ';
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};
    let fieldsToUpdate = 0;
    for (let [key, val] of Object.entries(userData)) {
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
        TableName: process.env.USER_TABLE,
        Key: {
          id: userId,
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
      TableName: process.env.USER_TABLE,
      Item: userData,
    };
    return dynamoDB.put(putRequest).promise();
  }
}

export async function getUserData(userId: string): Promise<UserData> {
  let getRequest: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.USER_TABLE,
    Key: {
      id: userId,
    },
  };
  try {
    let result = await dynamoDB.get(getRequest).promise();
    return (result.Item as UserData) || undefined;
  } catch (err) {
    throw new Error(err);
  }
}
