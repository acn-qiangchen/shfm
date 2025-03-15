import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { dynamodb, TABLES } from '../../lib/db';
import { CreateTransactionSchema, Transaction } from '../../types/transaction';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims.sub;
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    const body = JSON.parse(event.body || '{}');
    const validatedData = CreateTransactionSchema.parse(body);

    const now = new Date().toISOString();
    const transaction: Transaction = {
      id: uuidv4(),
      userId,
      ...validatedData,
      createdAt: now,
      updatedAt: now,
    };

    await dynamodb.send(new PutCommand({
      TableName: TABLES.TRANSACTIONS,
      Item: transaction,
    }));

    return {
      statusCode: 201,
      body: JSON.stringify(transaction)
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    
    return {
      statusCode: error.name === 'ZodError' ? 400 : 500,
      body: JSON.stringify({
        message: error.name === 'ZodError' ? 'Invalid input' : 'Internal server error',
        errors: error.name === 'ZodError' ? error.errors : undefined
      })
    };
  }
}; 