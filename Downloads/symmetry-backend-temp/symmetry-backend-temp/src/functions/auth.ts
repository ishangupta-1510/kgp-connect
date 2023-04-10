import { CognitoIdentityServiceProvider } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayEvent,
} from "aws-lambda";
import { enableCors } from "../cors";
import AWS from "aws-sdk";
import { string } from "yargs";

const cognito = new CognitoIdentityServiceProvider();
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const USER_POOL_ID = "us-west-1_fWINNYpSl";
const CLIENT_ID = "nbik3opbbgli8j93npqu13lh8";

export const _signUpHandler = async (event) => {
  const { email, password } = JSON.parse(event.body);

  const cognito = new CognitoIdentityServiceProvider({
    apiVersion: "2016-04-18",
  });
  const params = {
    ClientId: CLIENT_ID,
    Password: password,
    Username: email,
    UserAttributes: [{ Name: "email", Value: email }],
  };

  try {
    const data = await cognito.signUp(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User signed up successfully!" }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error }),
    };
  }
};

type InitiateAuthRequest = {
  AuthFlow: "USER_PASSWORD_AUTH" | "REFRESH_TOKEN_AUTH" | "CUSTOM_AUTH";
  ClientId: string;
  UserPoolId: string;
  AuthParameters: {
    USERNAME: string;
    PASSWORD: string;
  };
};

export const _resendVerificationCodeHandler = async (event: any) => {
  const { email } = JSON.parse(event.body);

  try {
    await cognitoIdentityServiceProvider
      .resendConfirmationCode({
        ClientId: CLIENT_ID,
        Username: email,
      })
      .promise();

    return {
      statusCode: 200,
      body: "Verification code sent successfully",
    };
  } catch (error) {
    if (error === "UserNotFoundException") {
      return {
        statusCode: 404,
        body: "User not found",
      };
    }

    return {
      statusCode: 400,
      body: <string>error,
    };
  }
};

export const _verificationHandler = async (event: any) => {
  const { email, verificationCode } = JSON.parse(event.body);

  const params: CognitoIdentityServiceProvider.Types.ConfirmSignUpRequest = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: verificationCode,
  };

  try {
    const response = await cognitoIdentityServiceProvider
      .confirmSignUp(params)
      .promise();
    console.log(response);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User confirmed successfully",
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "User confirmation failed",
      }),
    };
  }
};

export const _signInHandler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");
  try {
    const authResult = await cognitoIdentityServiceProvider
      .initiateAuth({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: body.email,
          PASSWORD: body.password,
        },
      } as InitiateAuthRequest)
      .promise();

    const authResults = authResult.AuthenticationResult;
    console.log(authResults);

    // const accessToken = authResult.AuthenticationResult!.AccessToken;
    // const idToken = authResult.AuthenticationResult.IdToken;
    // const refreshToken = authResult.AuthenticationResult.RefreshToken;

    // Store the tokens securely (e.g. in cookies or local storage)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Signed in successfully!",
        authResults,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: "Invalid username or password.",
      }),
    };
  }
};

export const signInHandler = enableCors(_signInHandler);
export const signUpHandler = enableCors(_signUpHandler);
export const resendVerificationCodeHandler = enableCors(
  _resendVerificationCodeHandler
);
export const verificationHandler = enableCors(_verificationHandler);
