import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import * as AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  }
});

// Mock response data
let mockGetResponse: any = {};
let mockDeleteResponse: any = {};

const mockDynamoDBResponse = (response: any) => {
  mockGetResponse = response;
};

// Mock the DynamoDB DocumentClient
const mockGet = jest.fn().mockImplementation(() => ({
  promise: () => Promise.resolve(mockGetResponse)
}));

const mockDelete = jest.fn().mockImplementation(() => ({
  promise: () => Promise.resolve(mockDeleteResponse)
}));

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn().mockImplementation(() => ({
        get: mockGet,
        delete: mockDelete
      }))
    }
  };
});

// Mock environment variables
process.env.TAGS_TABLE = 'test-tags-table';
process.env.IS_OFFLINE = 'true';

describe('DeleteTag Lambda Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetResponse = {};
    mockDeleteResponse = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockEvent = (isAuthenticated: boolean, tagId: string = 'test-tag-id'): APIGatewayProxyEvent => {
    return {
      requestContext: {
        authorizer: isAuthenticated ? { claims: { sub: 'test-user-id' } } : undefined
      },
      pathParameters: { id: tagId }
    } as any;
  };

  test('should return 401 if user is not authenticated', async () => {
    const { handler } = require('../../functions/tags/delete');
    const response: APIGatewayProxyResult = await handler(createMockEvent(false));
    expect(response.statusCode).toBe(401);
  });

  test('should return 404 if tag is not found', async () => {
    mockDynamoDBResponse({
      Item: null
    });

    const { handler } = require('../../functions/tags/delete');
    const response: APIGatewayProxyResult = await handler(createMockEvent(true));
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({ message: 'Tag not found' });
  });

  test('should return 403 if user does not own the tag', async () => {
    mockDynamoDBResponse({
      Item: {
        id: 'test-tag-id',
        userId: 'different-user-id',
        name: 'Test Tag',
        color: '#ff0000'
      }
    });

    const { handler } = require('../../functions/tags/delete');
    const response: APIGatewayProxyResult = await handler(createMockEvent(true));
    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body)).toEqual({ message: 'Forbidden' });
  });

  test('should delete tag successfully', async () => {
    mockDynamoDBResponse({
      Item: {
        id: 'test-tag-id',
        userId: 'test-user-id',
        name: 'Test Tag',
        color: '#ff0000'
      }
    });

    const { handler } = require('../../functions/tags/delete');
    const response: APIGatewayProxyResult = await handler(createMockEvent(true));
    expect(response.statusCode).toBe(204);
  });
}); 