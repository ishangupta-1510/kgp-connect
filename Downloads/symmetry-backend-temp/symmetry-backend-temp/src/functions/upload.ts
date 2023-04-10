import { S3 } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { enableCors } from "../cors";

const s3 = new S3();
const s3BucketName = "images-symmetry";

export const _uploadImage = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { file, filetype } = JSON.parse(event.body || "{}");
  if (!file) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request" }),
    };
  }
  const fileBuffer = Buffer.from(file, "base64");
  const key = `images/${Date.now()}.${filetype}`;
  try {
    await s3
      .putObject({
        Bucket: s3BucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: `image/${filetype}`,
      })
      .promise();
    const imageUrl = `https://${s3BucketName}.s3.amazonaws.com/${key}`;
    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

export const uploadImage = enableCors(_uploadImage);
