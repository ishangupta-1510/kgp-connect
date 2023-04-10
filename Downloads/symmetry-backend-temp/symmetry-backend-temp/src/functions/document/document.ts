import { S3 } from "aws-sdk";
import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { enableCors } from "../../cors";
import console from "console";
import * as fs from "fs";
const s3 = new S3();
const dynamoDB = new DynamoDB.DocumentClient();

interface TableItem {
  docId: string;
  docGivenId: string;
  doctypeId: string;
  employeeId: string;
  createdAt: string;
  docData: [];
}

interface RequestBody {
  file: string;
  given_id: string;
  expiry: {};
}

export const _uploadFile = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const s3BucketName = "documents-hr-module";
  const table = "documentTable";
  const { file, given_id, expiry } = JSON.parse(event.body!) as RequestBody;
  const employee_id = event.pathParameters?.employeeId;
  const doctype_id = event.pathParameters?.doctypeId;
  const fileBuffer = Buffer.from(file, "base64");

  // Upload the file to S3
  try {
    if (file == "") {
      const item: TableItem = {
        docId: doctype_id! + employee_id,
        docGivenId: given_id,
        doctypeId: doctype_id!,
        employeeId: employee_id!,
        createdAt: new Date().toISOString(),
        docData: [],
      };
      await dynamoDB
        .put({
          TableName: table,
          Item: item,
        })
        .promise();

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "document entry created successfully",
        }),
      };
    } else {
      const s3Object = await s3
        .upload({
          Bucket: s3BucketName,
          Key: Date.now() + "123",
          Body: fileBuffer,
          ContentType: "application/pdf",
        })
        .promise();
      console.log("here");
      console.log(s3BucketName);

      // Store the S3 object URL in the table
      const dbParams = {
        TableName: table,
        Key: { docId: doctype_id! + employee_id },
        UpdateExpression:
          "SET #docData = list_append(if_not_exists(#docData, :emptyList), :docdataList)",
        ExpressionAttributeNames: { "#docData": "docData" },
        ExpressionAttributeValues: {
          ":docdataList": [
            {
              url: s3Object.Location,
              expiry: expiry,
              createdAt: new Date().toISOString(),
            },
          ],
          ":emptyList": [],
        },
        ReturnValues: "UPDATED_NEW",
      };
      const result = await dynamoDB.update(dbParams).promise();

      return {
        statusCode: 200,
        body: JSON.stringify({ result }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

export const _getFiles = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const table = "documentTable";
  const { employeeId } = event.pathParameters as {
    employeeId: string;
  };
  const params = {
    TableName: table,
    FilterExpression: "employeeId = :employeeId",
    ExpressionAttributeValues: {
      ":employeeId": employeeId,
    },
  };
  // const res = {
  //   TableName: table,
  //   Key: {
  //     docId: doctypeId! + employeeId,
  //   },
  // };

  try {
    const result = await dynamoDB.scan(params).promise();

    if (result.Items) {
      const resultJSON: JSON[] = [];
      for (const element of result.Items) {
        const { docId, docGivenId, doctypeId, employeeId, createdAt, docData } =
          element as TableItem;
        const doctype = {
          TableName: "doctypeTable",
          Key: {
            doctypeId: doctypeId,
          },
        };
        const dctype = await dynamoDB.get(doctype).promise();
        if (dctype.Item) {
          const { name, givenId, type } = dctype.Item;
          const json: any = {
            doctypeId,
            name,
            type,
            givenId,
            docData,
          };
          resultJSON.push(json);
        }
      }
      return {
        statusCode: 200,
        body: JSON.stringify(resultJSON),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "doc record not found" }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get doc record" }),
    };
  }
};

export const getFiles = enableCors(_getFiles);
export const uploadFile = enableCors(_uploadFile);
