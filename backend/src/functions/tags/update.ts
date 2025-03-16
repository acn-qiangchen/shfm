import { APIGatewayProxyHandler } from 'aws-lambda';
import { UpdateTagSchema } from '../../types/tag';
import * as dynamodb from '../../lib/dynamodb';
import { ZodError } from 'zod';
import { getUserId } from '../../lib/auth';

export const handler: APIGatewayProxyHandler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };

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

    // Get tag ID from path parameters
    const tagId = event.pathParameters?.id;
    if (!tagId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing tag ID' }),
      };
    }

    // Get existing tag
    const existingTag = await dynamodb.get({
      TableName: dynamodb.TABLES.TAGS,
      Key: { id: tagId },
    });

    if (!existingTag.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Tag not found' }),
      };
    }

    // Check ownership
    if (existingTag.Item.userId !== userId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Forbidden' }),
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
    const validatedData = UpdateTagSchema.parse({
      ...data,
      id: tagId,
    });

    const updatedTag = {
      ...existingTag.Item,
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    await dynamodb.put({
      TableName: dynamodb.TABLES.TAGS,
      Item: updatedTag,
      ConditionExpression: 'id = :id AND userId = :userId',
      ExpressionAttributeValues: {
        ':id': tagId,
        ':userId': userId,
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(updatedTag),
    };
  } catch (error: unknown) {
    console.error('Error updating tag:', error);

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