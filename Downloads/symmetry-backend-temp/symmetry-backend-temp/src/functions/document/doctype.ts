import {
  Handler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as AWS from "aws-sdk";
import { enableCors } from "../../cors";

// Define the DynamoDB client
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const _addDoctype = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");

  const params = {
    TableName: "doctypeTable",
    Item: {
      // doctype_id(number), type_id(string), type(string), name(sting), expiry (string)
      doctypeId: body.doctype_id,
      givenId: body.given_id,
      type: body.type,
      name: body.name,
      expiry: body.expiry,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Doctype record added successfully" }),
    };
  } catch (err) {
    console.error("Error:" + err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to add doctype record" }),
    };
  }
};

export const _addDoctypeByEmployee = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");

  const params = {
    TableName: "doctypeTable",
    Item: {
      // doctype_id(number), type_id(string), type(string), name(sting), expiry (string)
      doctypeId: body.doctype_id,
      employeeId: body.employee_id,
      givenId: body.given_id,
      type: body.type,
      name: body.name,
      expiry: body.expiry,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Doctype record added successfully" }),
    };
  } catch (err) {
    console.error("Error:" + err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to add doctype record" }),
    };
  }
};

//GET Doctype API Handler
export const _getDoctypeById = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const doctypeId = event.pathParameters?.doctypeId;
  console.log("doctype id:");
  console.log(doctypeId);
  const params = {
    TableName: "doctypeTable",
    Key: {
      doctypeId: doctypeId,
    },
  };

  try {
    const result = await dynamoDb.get(params).promise();
    if (result.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Doctype record not found" }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get doctype record" }),
    };
  }
};

//GET Doctype API Handler
export const _getDoctypeList = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const employeeId = event.pathParameters?.employeeId;
  console.log("employee id:");
  console.log(employeeId);
  const params = {
    TableName: "doctypeTable",
    FilterExpression:
      "attribute_not_exists(employeeId) OR employeeId = :employeeId",
    ExpressionAttributeValues: {
      ":employeeId": employeeId,
    },
  };

  try {
    const result = await dynamoDb.scan(params).promise();
    if (result) {
      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Doctype record not found" }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get doctype record" }),
    };
  }
};

//GET common Doctype API Handler
export const _getCommonDoctypeList = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const params = {
    TableName: "doctypeTable",
    FilterExpression: "attribute_not_exists(employeeId)",
  };

  try {
    const result = await dynamoDb.scan(params).promise();
    if (result.Items && result.Items.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.Items),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "No doctype records found where employeeId is empty",
        }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get doctype record" }),
    };
  }
};

export const addDoctype = enableCors(_addDoctype);
export const getDoctypeById = enableCors(_getDoctypeById);
export const addDoctypeByEmployee = enableCors(_addDoctypeByEmployee);
export const getDoctypeList = enableCors(_getDoctypeList);
export const getCommonDoctypeList = enableCors(_getCommonDoctypeList);
