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

    // Get transaction ID from path parameters
    const transactionId = event.pathParameters?.id;
    if (!transactionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing transaction ID' }),
      };
    }

    // Get existing transaction
    const existingTransaction = await dynamodb.get({
      TableName: dynamodb.TABLES.TRANSACTIONS,
      Key: { id: transactionId },
    });

    if (!existingTransaction.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Transaction not found' }),
      };
    }

    // Check ownership
    if (existingTransaction.Item.userId !== userId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Forbidden' }),
      };
    }

    // Delete the transaction
    await dynamodb.del({
      TableName: dynamodb.TABLES.TRANSACTIONS,
      Key: { id: transactionId },
    });

    return {
      statusCode: 204,
      headers,
      body: '',
    };
  } catch (error: unknown) {
    console.error('Error deleting transaction:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}; 