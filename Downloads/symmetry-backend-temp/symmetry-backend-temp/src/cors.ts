import { APIGatewayProxyResult, APIGatewayProxyEvent } from "aws-lambda";

export const enableCors =
  (handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>) =>
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const response = await handler(event);

    return {
      ...response,
      headers: {
        ...response.headers,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
    };
  };
