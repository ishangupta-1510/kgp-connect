import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { type } from "os";
import { enableCors } from "../../cors";

var dynamoDb = new DocumentClient();

export const _addInventory = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");
  const { employeeId } = event.pathParameters!;

  console.log(employeeId);

  const params = {
    TableName: "inventoryTable",
    Item: {
      inventoryId: body.inventory_id,
      givenId: body.given_id,
      name: body.name,
      employeeId: employeeId,
      inventoryType: body.inventory_type,
      createdAt: body.created_at,
      assignedDate: body.assigned_date,
    },
  };

  const updateParams: DocumentClient.UpdateItemInput = {
    TableName: "employeeTable",
    Key: { employeeId: employeeId },
    UpdateExpression: "SET inventory = list_append(inventory, :inventoryId)",
    ExpressionAttributeValues: {
      ":inventoryId": [body.inventory_id],
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    await dynamoDb.put(params).promise();
    await dynamoDb.update(updateParams).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Inventory record added successfully for " + { employeeId },
      }),
    };
  } catch (err) {
    console.error("Error:" + err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to add inventory record for " + { employeeId },
      }),
    };
  }
};

//GET InventoryItem API Handler
export const _getInventoryById = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const inventoryId = event.pathParameters?.inventoryId;
  console.log("inventory id: " + inventoryId);
  const params = {
    TableName: "inventoryTable",
    Key: {
      inventoryId: inventoryId,
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
        body: JSON.stringify({ message: "Inventory record not found" }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get inventory record" }),
    };
  }
};

//GET InventoryItem List API Handler
export const _getInventoryList = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const employeeId = event.pathParameters?.employeeId;
  console.log("Fetching inventories for employee :" + employeeId);
  const params = {
    TableName: "inventoryTable",
    FilterExpression: "employeeId = :employeeId",
    ExpressionAttributeValues: {
      ":employeeId": employeeId,
    },
  };

  try {
    const result = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error("Error getting inventories: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get inventory records" }),
    };
  }
};

export const addInventory = enableCors(_addInventory);
export const getInventoryById = enableCors(_getInventoryById);
export const getInventoryList = enableCors(_getInventoryList);
