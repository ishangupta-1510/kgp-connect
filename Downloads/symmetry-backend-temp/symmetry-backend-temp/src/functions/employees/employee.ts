import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { type } from "os";
import { enableCors } from "../../cors";

var dynamoDb = new DocumentClient();

export const _addEmployee = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");

  const personalDetails = {
    firstName: body.personal_details.first_name,
    lastName: body.personal_details.last_name,
    imgurl: body.personal_details.imgurl,
    gender: body.personal_details.gender,
    dob: body.personal_details.dob,
    contactDetails: body.personal_details.contact_details,
  };
  const _status = {
    employment: body.status.employment,
    primary: body.status.primary,
    secondary: body.status.secondary,
    service: body.status.employment,
    oncall: body.status.oncall,
  };
  const params = {
    TableName: "employeeTable",
    Item: {
      employeeId: body.employee_id,
      personalDetails: personalDetails,
      createdAt: body.created_at,
      typeOfEmployee: body.type_employee,
      typeOfClinician: body.type_clinician,
      employmentType: body.employment_type,
      expertise: body.expertise,
      appointments: body.appointments,
      totalPatients: body.total_patients,
      services: body.services,
      payrollId: body.payroll_id,
      documents: body.documents,
      inventory: body.inventory,
      status: _status,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Employee record added successfully" }),
    };
  } catch (err) {
    console.error("Error:" + err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to add employee record" }),
    };
  }
};

//GET Employee API Handler
export const _getEmployeeById = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const employeeId = event.pathParameters?.employeeId;
  console.log("employee id:");
  console.log(employeeId);
  const params = {
    TableName: "employeeTable",
    Key: {
      employeeId: employeeId,
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
        body: JSON.stringify({ message: "Employee record not found" }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get employee record" }),
    };
  }
};

//GET Employee API Handler
export const _getEmployeesByType = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const typeOfEmployee = event.pathParameters?.typeOfEmployee;
  console.log("Employee Type:");
  console.log(typeOfEmployee);
  const params = {
    TableName: "employeeTable",
    FilterExpression: "typeOfEmployee = :typeOfEmployee",
    ExpressionAttributeValues: {
      ":typeOfEmployee": parseInt(typeOfEmployee!),
    },
  };

  try {
    const result = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error("Error getting employees: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get employee records" }),
    };
  }
};

export const _getEmployees = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const params = {
    TableName: "employeeTable",
  };

  try {
    const result = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error("Error getting employees: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get employee records" }),
    };
  }
};

export async function _deleteEmployeeById(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const employeeId = event.pathParameters?.employeeId;
    const params = {
      TableName: "employeeTable",
      Key: {
        employeeId: employeeId,
      },
    };
    await dynamoDb.delete(params).promise();
    return {
      statusCode: 200,
      body: "deleted succesfully",
    };
  } catch (error) {
    console.error("Error deleting employee: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to delete employee" }),
    };
  }
}

export const addEmployee = enableCors(_addEmployee);
export const getEmployees = enableCors(_getEmployees);
export const getEmployeeById = enableCors(_getEmployeeById);
export const getEmployeesByType = enableCors(_getEmployeesByType);
export const deleteEmployeeById = enableCors(_deleteEmployeeById);
