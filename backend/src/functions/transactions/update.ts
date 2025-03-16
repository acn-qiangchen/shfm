import { APIGatewayProxyHandler } from 'aws-lambda';
import { UpdateTransactionSchema } from '../../types/transaction';
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

    // Parse and validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid request body' }),
      };
    }

    const data = JSON.parse(event.body);
    const validatedData = UpdateTransactionSchema.parse({
      ...data,
      id: transactionId,
    });

    // Validate that all tag IDs exist
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      const tagPromises = validatedData.tagIds.map(tagId =>
        dynamodb.get({
          TableName: dynamodb.TABLES.TAGS,
          Key: { id: tagId },
        })
      );
      const tagResults = await Promise.all(tagPromises);
      const nonExistentTags = validatedData.tagIds.filter((_, index) => !tagResults[index].Item);
      
      if (nonExistentTags.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            message: 'One or more tags do not exist',
            nonExistentTags,
          }),
        };
      }
    }

    const updatedTransaction = {
      ...existingTransaction.Item,
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    await dynamodb.put({
      TableName: dynamodb.TABLES.TRANSACTIONS,
      Item: updatedTransaction,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(updatedTransaction),
    };
  } catch (error: unknown) {
    console.error('Error updating transaction:', error);

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