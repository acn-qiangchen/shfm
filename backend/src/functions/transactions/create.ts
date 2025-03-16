import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { CreateTransactionSchema, Transaction } from '../../types/transaction';
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

    // Parse and validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid request body' }),
      };
    }

    const data = JSON.parse(event.body);
    const validatedData = CreateTransactionSchema.parse(data);

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

    const now = new Date().toISOString();
    const transaction: Transaction = {
      id: uuidv4(),
      userId,
      ...validatedData,
      createdAt: now,
      updatedAt: now,
    };

    await dynamodb.put({
      TableName: dynamodb.TABLES.TRANSACTIONS,
      Item: transaction,
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(transaction),
    };
  } catch (error: unknown) {
    console.error('Error creating transaction:', error);

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