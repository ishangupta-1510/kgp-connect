import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { enableCors } from "../../cors";

const dynamoDb = new DocumentClient();

export const _addVisit = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");

  const params = {
    TableName: "visitsTable",
    Item: {
      visitId: body.visit_id,
      typeOfVisit: body.type_of_visit,
      eligibleClinicians: body.eligible_clinicians,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Visit record added successfully",
      }),
    };
  } catch (err) {
    console.error("Error:" + err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to add visit record" }),
    };
  }
};

export const _getVisit = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { visitId } = event.pathParameters || {};

  const params = {
    TableName: "visitsTable",
    Key: {
      visitId: visitId,
    },
  };

  try {
    const result = await dynamoDb.get(params).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Visit record not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (err) {
    console.error("Error:" + err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to retrieve visit record" }),
    };
  }
};

export const getVisit = enableCors(_getVisit);
export const addVisit = enableCors(_addVisit);

/*
{
	"visit_id": "abc",
	"type_of_visit": "",
	"eligible_clinicians": ["ab", "cd"]
}
*/
