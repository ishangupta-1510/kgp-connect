import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { enableCors } from "../../cors";

const dynamodb = new DocumentClient();


// export const _postPayRate = async (
//   event: APIGatewayProxyEvent
// ): Promise<APIGatewayProxyResult> => {
//   const body = JSON.parse(event.body || "{}")

//   const params = {
//     TableName: "payRatesTable",
//     Item: body,
//   };

//   try {
//     await dynamoDb.put(params).promise();
//     return {
//       statusCode: 201,
//       body: JSON.stringify({ message: "Pay rate record created successfully" }),
//     };
//   } catch (err) {
//     console.error("Error:" + err);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: "Failed to create pay rate record" }),
//     };
//   }
// };

export const _getPayRates = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const result = await dynamodb
      .scan({
        TableName: "payrates",
      })
      .promise();
    if (result.Items) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.Items),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No pay rates found" }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred while fetching pay rates",
        error,
      }),
    };
  }
};

export const getPayRates = enableCors(_getPayRates);
