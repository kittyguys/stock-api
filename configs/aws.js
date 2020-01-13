import AWS from "aws-sdk";

const AWSAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const AWSSecretKey = process.env.AWS_SECRET_KEY;

export const s3 = new AWS.S3({
  accessKeyId: AWSAccessKeyId,
  secretAccessKey: AWSSecretKey
});
