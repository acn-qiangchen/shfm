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
let mockUpdateResponse: any = {};

const mockDynamoDBResponse = (response: any) => {
  mockGetResponse = response;
};

// Mock the DynamoDB DocumentClient
const mockGet = jest.fn().mockImplementation(() => ({
  promise: () => Promise.resolve(mockGetResponse)
}));

const mockPut = jest.fn().mockImplementation(() => ({
  promise: () => Promise.resolve(mockUpdateResponse)
}));

jest.mock('aws-sdk', () => {
  return {
    ...jest.requireActual('aws-sdk'),
    DynamoDB: {
      DocumentClient: jest.fn().mockImplementation(() => ({
        get: mockGet,
        put: mockPut
      }))
    }
  };
});

// Mock environment variables
process.env.TAGS_TABLE = 'test-tags-table';
process.env.IS_OFFLINE = 'true';

describe('UpdateTag Lambda Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetResponse = {};
    mockUpdateResponse = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockEvent = (isAuthenticated: boolean, tagId: string = 'test-tag-id', body: any = {}): APIGatewayProxyEvent => {
    return {
      requestContext: {
        authorizer: isAuthenticated ? { claims: { sub: 'test-user-id' } } : undefined
      },
      pathParameters: { id: tagId },
      body: JSON.stringify(body)
    } as any;
  };

  test('should return 401 if user is not authenticated', async () => {
    const { handler } = require('../../functions/tags/update');
    const response: APIGatewayProxyResult = await handler(createMockEvent(false));
    expect(response.statusCode).toBe(401);
  });

  test('should return 404 if tag is not found', async () => {
    mockDynamoDBResponse({
      Item: null
    });

    const { handler } = require('../../functions/tags/update');
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

    const { handler } = require('../../functions/tags/update');
    const response: APIGatewayProxyResult = await handler(createMockEvent(true));
    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body)).toEqual({ message: 'Forbidden' });
  });

  test('should return 400 if request body is invalid', async () => {
    mockDynamoDBResponse({
      Item: {
        id: 'test-tag-id',
        userId: 'test-user-id',
        name: 'Test Tag',
        color: '#ff0000'
      }
    });

    const { handler } = require('../../functions/tags/update');
    const response: APIGatewayProxyResult = await handler(createMockEvent(true, 'test-tag-id', {}));
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Missing required fields: name and color are required' });
  });

  test('should update tag successfully', async () => {
    const existingTag = {
      id: 'test-tag-id',
      userId: 'test-user-id',
      name: 'Test Tag',
      color: '#ff0000',
      createdAt: '2024-03-16T00:00:00.000Z',
      updatedAt: '2024-03-16T00:00:00.000Z'
    };

    mockDynamoDBResponse({
      Item: existingTag
    });

    const updateData = {
      name: 'Updated Tag',
      color: '#00ff00'
    };

    const { handler } = require('../../functions/tags/update');
    const response: APIGatewayProxyResult = await handler(createMockEvent(true, 'test-tag-id', updateData));
    
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      ...existingTag,
      ...updateData,
      updatedAt: expect.any(String)
    });
  });
}); 