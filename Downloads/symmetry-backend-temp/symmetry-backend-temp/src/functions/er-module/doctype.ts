import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { enableCors } from "../../cors";

const dynamoDb = new DocumentClient();

export const _addMasterDoctype = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");

  const params = {
    TableName: "masterDoctypeTable",
    Item: {
      Id: body.id,
      type: body.type,
      expiryType: body.expiry_type,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Employee type record added successfully",
      }),
    };
  } catch (err) {
    console.error("Error:" + err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to add employee type record" }),
    };
  }
};

export const getMasterDocTypes = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const params = {
    TableName: "masterDoctypeTable",
  };

  try {
    const result = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (err) {
    console.error("Error:" + err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to retrieve master document types" }),
    };
  }
};

export const handler = enableCors(getMasterDocTypes);
export const addMasterDoctype = enableCors(_addMasterDoctype);

/*

{
	"employee_type_id": "",
	"type_of_employee": "",
	"type": "",
	"shorthand": "",
	"color": ""
}

*/
