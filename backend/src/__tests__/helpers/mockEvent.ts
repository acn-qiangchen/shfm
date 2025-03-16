import { APIGatewayProxyEvent } from 'aws-lambda';

export const createMockEvent = (options: {
  body?: any;
  userId?: string;
} = {}): APIGatewayProxyEvent => {
  const { body, userId } = options;

  return {
    body: body ? JSON.stringify(body) : null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/tags',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'api-id',
      authorizer: userId ? {
        claims: {
          sub: userId,
        },
      } : {
        claims: {},
      },
      protocol: 'HTTP/1.1',
      httpMethod: 'GET',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: null,
        userArn: null,
      },
      path: '/tags',
      stage: 'test',
      requestId: 'test-request-id',
      requestTimeEpoch: 1615900000000,
      resourceId: 'test-resource-id',
      resourcePath: '/tags',
    },
    resource: '/tags',
  };
}; 