import { DynamoDB } from 'aws-sdk';
import { putImageToS3 } from './S3Utils';
import { User, UserData } from './ServiceTypes';
import { addExercisesToUser, deleteUserFromExercises, getExerciseSet } from './ExerciseHelpers'
import { addWorkoutsToUser, deleteUserFromWorkouts, getWorkoutIdSet } from './WorkoutHelpers';
import { batchDeleteFromWorkoutLog, batchPutToWorkoutLog, getWorkoutLogEntriesForUser } from './workoutLogHelpers';
import { deleteUserFromStats, getStats, saveStats } from './StatsHelpers';

const dynamoDB = new DynamoDB.DocumentClient();

const bcrypt = require('bcryptjs');

const userTable = process.env.USER_TABLE

export async function saveNewUserId(id: string) {
  let isExistingUser = await checkIfExistingUser(id);

  if (isExistingUser) {
    throw new Error('User Already Exists!');
  } else {
    let putRequest: DynamoDB.DocumentClient.PutItemInput = {
      TableName: userTable,
      Item: {
        id: id,
        didCreateAccount: false,
        creationTS: Date.now()
      },
    };
    return dynamoDB.put(putRequest).promise();
  }
}

async function checkIfExistingUser(userId): Promise<boolean> {
  let queryParams: DynamoDB.DocumentClient.QueryInput = {
    TableName: userTable,
    KeyConditionExpression: 'id = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };
  let queryOutput = await dynamoDB.query(queryParams).promise();

  console.log('Query output: ', JSON.stringify(queryOutput));

  return queryOutput.Count > 0;
}

export async function saveUserPassword(user: User, deviceId?: string) {
  let userId = user.id;
  let isExistingUser = await checkIfExistingUser(userId);

  if (isExistingUser) {
    throw new Error('User Already Exists!');
  } else {
    if (user.password) {
      let hashedPassword = await bcrypt.hashSync(user.password, 10);

      let putRequest: DynamoDB.DocumentClient.PutItemInput = {
        TableName: userTable,
        Item: {
          id: user.id,
          password: hashedPassword,
          didCreateAccount: true,
          creationTS: Date.now()
        },
      };

      let putPromise = dynamoDB.put(putRequest).promise()

      if (deviceId) {
        let mergePromise = mergeUserData(deviceId, userId)
        return { ...putPromise, ...mergePromise }
      }

      return putPromise
    }
  }
}

export async function mergeUserData(fromUserId: string, toUserId: string) {
  console.log("Merging data...")
  // Exercises
  let exerciseSet = await getExerciseSet(fromUserId);
  if (exerciseSet) {
    addExercisesToUser(toUserId, exerciseSet);
    deleteUserFromExercises(fromUserId);
  }

  // Workouts
  let workoutSet = await getWorkoutIdSet(fromUserId);
  if (workoutSet) {
    addWorkoutsToUser(toUserId, workoutSet);
    deleteUserFromWorkouts(fromUserId);
  }

  // Workout Log
  let workoutLogItems = await getWorkoutLogEntriesForUser(fromUserId);
  if (workoutLogItems && workoutLogItems.length > 0) {
      // Replace userIds
    let newWorkoutLogItems = workoutLogItems.map( item => {
      item.userId = toUserId
      return item
    })
    batchPutToWorkoutLog(newWorkoutLogItems);
    batchDeleteFromWorkoutLog(workoutLogItems);
  }

  // Stats
  // TODO: - add together from and to user stats
  let stats = await getStats(fromUserId);
  if (stats && Object.keys(stats).length > 0) {
    saveStats(toUserId, stats);
    deleteUserFromStats(fromUserId);
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
        TableName: userTable,
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
      TableName: userTable,
      Item: userData,
    };
    return dynamoDB.put(putRequest).promise();
  }
}

export async function getUserData(userId: string): Promise<UserData> {
  let getRequest: DynamoDB.DocumentClient.GetItemInput = {
    TableName: userTable,
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

export async function uploadUserImage(image: string, userId: string) {
  let imageBuffer = Buffer.from(image, 'base64');
  return putImageToS3(userId, imageBuffer);
}
