import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { enableCors } from "../../cors";

const dynamoDb = new DocumentClient();

export const _addEmployeeType = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");

  const params = {
    TableName: "employeeTypeTable",
    Item: {
      employeeTypeId: body.employee_type_id,
      typeOfEmployee: body.type_of_employee,
      type: body.type,
      shorthand: body.shorthand,
      color: body.color,
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

export const getEmployeeTypes = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const params = {
    TableName: "employeeTypeTable",
  };

  try {
    const data = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (err) {
    console.error("Error:" + err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get employee types" }),
    };
  }
};

export const addEmployeeType = enableCors(_addEmployeeType);
export const listEmployeeTypes = enableCors(getEmployeeTypes);
/*

{
	"employee_type_id": "",
	"type_of_employee": "",
	"type": "",
	"shorthand": "",
	"color": ""
}

*/
