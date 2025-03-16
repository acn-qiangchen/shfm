import { APIGatewayProxyHandler } from 'aws-lambda';
import * as dynamodb from '../../lib/dynamodb';
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

    // Delete the tag
    await dynamodb.del({
      TableName: dynamodb.TABLES.TAGS,
      Key: { id: tagId },
      ConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });

    return {
      statusCode: 204,
      headers,
      body: '',
    };
  } catch (error: unknown) {
    console.error('Error deleting tag:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}; 