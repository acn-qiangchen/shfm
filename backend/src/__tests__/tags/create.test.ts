import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({ region: 'us-east-1' });

// Mock the dynamodb module
jest.mock('../../lib/dynamodb', () => {
  const mockPromise = jest.fn().mockImplementation(() => Promise.resolve({}));
  return {
    put: jest.fn().mockReturnValue({ promise: mockPromise }),
  };
});

// Mock uuid to return a predictable value
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid'),
}));

describe('CreateTag Lambda Function', () => {
  // Get the mocked dynamodb module
  const dynamodb = require('../../lib/dynamodb');
  const mockDynamoDBResponse = (response: any) => {
    const promise = jest.fn().mockImplementation(() => Promise.resolve(response));
    dynamodb.put.mockReturnValueOnce({ promise });
  };
  const mockDynamoDBError = (error: Error) => {
    const promise = jest.fn().mockImplementation(() => Promise.reject(error));
    dynamodb.put.mockReturnValueOnce({ promise });
  };
  
  beforeEach(() => {
    process.env.TAGS_TABLE = 'test-tags-table';
    process.env.IS_OFFLINE = 'true';
    process.env.AWS_ACCESS_KEY_ID = 'test';
    process.env.AWS_SECRET_ACCESS_KEY = 'test';
    process.env.AWS_REGION = 'us-east-1';
    
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock Date.now to return a consistent date
    const mockDate = new Date('2023-01-01T00:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    delete process.env.TAGS_TABLE;
    delete process.env.IS_OFFLINE;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_REGION;
    
    // Restore Date mock
    jest.restoreAllMocks();
  });

  const createMockEvent = (authenticated: boolean = true, body: any = null): APIGatewayProxyEvent => {
    let bodyStr: string | null = null;
    if (body === 'invalid json') {
      bodyStr = 'invalid json';
    } else if (body) {
      bodyStr = JSON.stringify(body);
    }
    
    return {
      requestContext: {
        authorizer: {
          claims: authenticated ? { sub: 'test-user-id' } : undefined,
        },
      },
      body: bodyStr,
    } as unknown as APIGatewayProxyEvent;
  };

  test('should return 401 if user is not authenticated', async () => {
    const { handler } = require('../../functions/tags/create');
    const response: APIGatewayProxyResult = await handler(createMockEvent(false));
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({ message: 'Unauthorized' });
  });

  test('should return 400 if request body is invalid', async () => {
    const { handler } = require('../../functions/tags/create');
    const response: APIGatewayProxyResult = await handler(createMockEvent(true, 'invalid json'));
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid request body' });
  });

  test('should return 400 if required fields are missing', async () => {
    const { handler } = require('../../functions/tags/create');
    const response: APIGatewayProxyResult = await handler(createMockEvent(true, {}));
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Missing required fields' });
  });

  test('should create tag successfully', async () => {
    mockDynamoDBResponse({});

    const { handler } = require('../../functions/tags/create');
    const tagData = { name: 'Test Tag', color: '#ff0000' };
    const response: APIGatewayProxyResult = await handler(createMockEvent(true, tagData));
    
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toMatchObject({
      name: tagData.name,
      color: tagData.color,
      userId: 'test-user-id',
    });
    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
    
    expect(dynamodb.put).toHaveBeenCalledWith({
      TableName: 'test-tags-table',
      Item: expect.objectContaining({
        name: tagData.name,
        color: tagData.color,
        userId: 'test-user-id',
      }),
    });
  });

  test('should handle DynamoDB errors', async () => {
    mockDynamoDBError(new Error('DynamoDB error'));

    const { handler } = require('../../functions/tags/create');
    const tagData = { name: 'Test Tag', color: '#ff0000' };
    const response: APIGatewayProxyResult = await handler(createMockEvent(true, tagData));
    
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal server error' });
  });
}); 