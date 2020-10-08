import { DynamoDB } from 'aws-sdk';

const dynamoDB = new DynamoDB.DocumentClient();

export async function saveStats(userId: string, stats: {}) {
  let statsTableEntry = { userId: userId, ...stats };

  let putRequest: DynamoDB.DocumentClient.PutItemInput = {
    TableName: process.env.USER_STATS_TABLE,
    Item: statsTableEntry,
  };
  return dynamoDB.put(putRequest).promise();
}

export async function getStats(userId: string): Promise<{}> {
  let getRequest: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.USER_STATS_TABLE,
    Key: {
      userId: userId,
    },
  };
  let getResult = await dynamoDB.get(getRequest).promise();

  return getResult.Item || {};
}
