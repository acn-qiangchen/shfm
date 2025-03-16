import { APIGatewayProxyHandler } from 'aws-lambda';
import * as dynamodb from '../../lib/dynamodb';
import { z } from 'zod';
import { getUserId } from '../../lib/auth';

const QueryParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  nextToken: z.string().optional(),
});

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

    // Parse and validate query parameters
    const params = QueryParamsSchema.parse(event.queryStringParameters || {});
    const { startDate, endDate, limit = 20, nextToken } = params;

    // Build query parameters
    const queryParams: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName: dynamodb.TABLES.TRANSACTIONS,
      IndexName: 'byUserAndDate',
      KeyConditionExpression: startDate && endDate
        ? 'userId = :userId AND #date BETWEEN :startDate AND :endDate'
        : 'userId = :userId',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ...(startDate && { ':startDate': startDate }),
        ...(endDate && { ':endDate': endDate }),
      },
      Limit: limit,
      ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
      ScanIndexForward: false, // Sort in descending order (newest first)
    };

    const result = await dynamodb.query(queryParams);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        items: result.Items,
        nextToken: result.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
          : null,
      }),
    };
  } catch (error: unknown) {
    console.error('Error listing transactions:', error);

    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Invalid parameters',
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