import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({ region: 'us-east-1' });

// Define types for mocks
type MockPromiseFunction = jest.Mock;

// Mock the dynamodb module
jest.mock('../../lib/dynamodb', () => {
  const mockPromise = jest.fn().mockImplementation(() => Promise.resolve({}));
  return {
    query: jest.fn().mockReturnValue({ promise: mockPromise }),
  };
});

describe('ListTags Lambda Function', () => {
  // Get the mocked dynamodb module
  const dynamodb = require('../../lib/dynamodb');
  const mockDynamoDBResponse = (response: any) => {
    const promise = jest.fn().mockImplementation(() => Promise.resolve(response));
    dynamodb.query.mockReturnValueOnce({ promise });
  };
  const mockDynamoDBError = (error: Error) => {
    const promise = jest.fn().mockImplementation(() => Promise.reject(error));
    dynamodb.query.mockReturnValueOnce({ promise });
  };

  beforeEach(() => {
    process.env.TAGS_TABLE = 'test-tags-table';
    process.env.IS_OFFLINE = 'true';
    process.env.AWS_ACCESS_KEY_ID = 'test';
    process.env.AWS_SECRET_ACCESS_KEY = 'test';
    process.env.AWS_REGION = 'us-east-1';
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.TAGS_TABLE;
    delete process.env.IS_OFFLINE;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_REGION;
  });

  const createMockEvent = (authenticated: boolean = true): APIGatewayProxyEvent => ({
    requestContext: {
      authorizer: {
        claims: authenticated ? { sub: 'test-user-id' } : undefined,
      },
    },
  } as unknown as APIGatewayProxyEvent);

  test('should return 401 if user is not authenticated', async () => {
    const { handler } = require('../../functions/tags/list');
    const response: APIGatewayProxyResult = await handler(createMockEvent(false));
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({ message: 'Unauthorized' });
  });

  test('should return tags successfully', async () => {
    const mockTags = [
      { id: '1', name: 'Tag 1', color: '#ff0000' },
      { id: '2', name: 'Tag 2', color: '#00ff00' },
    ];

    mockDynamoDBResponse({ Items: mockTags });

    const { handler } = require('../../functions/tags/list');
    const response: APIGatewayProxyResult = await handler(createMockEvent());
    
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockTags);
    expect(dynamodb.query).toHaveBeenCalledWith({
      TableName: 'test-tags-table',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': 'test-user-id',
      },
    });
  });

  test('should handle DynamoDB errors', async () => {
    mockDynamoDBError(new Error('DynamoDB error'));

    const { handler } = require('../../functions/tags/list');
    const response: APIGatewayProxyResult = await handler(createMockEvent());
    
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal server error' });
  });
}); 