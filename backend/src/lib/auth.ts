import { APIGatewayProxyEvent } from 'aws-lambda';

export const getUserId = (event: APIGatewayProxyEvent): string | null => {
  if (process.env.IS_OFFLINE === 'true') {
    return event.headers.Authorization || null;
  }
  return event.requestContext.authorizer?.claims.sub || null;
};

export const isAuthorized = (event: APIGatewayProxyEvent): boolean => {
  return getUserId(event) !== null;
}; 