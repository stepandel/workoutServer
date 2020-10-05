import AWS = require('aws-sdk');

const S3 = new AWS.S3();

const bucketName = `workout-server-public`;
const filePath = 'profile_photos/';

export async function putImageToS3(name: string, body: any) {
  let fileName = filePath + name + '.jpeg';

  let params = {
    Bucket: bucketName,
    Key: fileName,
    Body: body,
  };

  console.log('Params: ', params);

  return await S3.putObject(params).promise();
}
