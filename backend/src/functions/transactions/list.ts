import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLES } from '../../lib/db';
import { z } from 'zod';

const QueryParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  nextToken: z.string().optional(),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims.sub;
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    const params = QueryParamsSchema.parse(event.queryStringParameters || {});
    const { startDate, endDate, limit = 20, nextToken } = params;

    const queryCommand = new QueryCommand({
      TableName: TABLES.TRANSACTIONS,
      IndexName: 'byUserAndDate',
      KeyConditionExpression: startDate && endDate
        ? 'userId = :userId AND #date BETWEEN :startDate AND :endDate'
        : 'userId = :userId',
      ExpressionAttributeNames: {
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ...(startDate && { ':startDate': startDate }),
        ...(endDate && { ':endDate': endDate })
      },
      Limit: limit,
      ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString()) : undefined,
      ScanIndexForward: false // 降順（新しい順）
    });

    const result = await dynamodb.send(queryCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result.Items,
        nextToken: result.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
          : null
      })
    };
  } catch (error) {
    console.error('Error listing transactions:', error);
    
    return {
      statusCode: error.name === 'ZodError' ? 400 : 500,
      body: JSON.stringify({
        message: error.name === 'ZodError' ? 'Invalid parameters' : 'Internal server error',
        errors: error.name === 'ZodError' ? error.errors : undefined
      })
    };
  }
}; 