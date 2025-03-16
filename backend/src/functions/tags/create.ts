import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { CreateTagSchema, Tag } from '../../types/tag';
import * as dynamodb from '../../lib/dynamodb';
import { getUserId } from '../../lib/auth';
import { ZodError } from 'zod';

export const handler: APIGatewayProxyHandler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };

  // Debug logs for environment variables
  console.log('Environment variables:', {
    TAGS_TABLE: process.env.TAGS_TABLE,
    IS_OFFLINE: process.env.IS_OFFLINE,
    AWS_REGION: process.env.AWS_REGION,
    DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT,
  });

  try {
    // Check authentication
    const userId = getUserId(event);
    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    // Parse and validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid request body' }),
      };
    }

    const data = JSON.parse(event.body);
    const validatedData = CreateTagSchema.parse(data);

    const now = new Date().toISOString();
    const tag: Tag = {
      id: uuidv4(),
      userId,
      ...validatedData,
      createdAt: now,
      updatedAt: now,
    };

    await dynamodb.put({
      TableName: dynamodb.TABLES.TAGS,
      Item: tag,
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(tag),
    };
  } catch (error: unknown) {
    console.error('Error creating tag:', error);

    if (error instanceof ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Validation error',
          errors: error.errors,
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}; 