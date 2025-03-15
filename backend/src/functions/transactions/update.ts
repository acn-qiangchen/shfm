import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLES } from '../../lib/db';
import { UpdateTransactionSchema } from '../../types/transaction';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims.sub;
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    const transactionId = event.pathParameters?.id;
    if (!transactionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Transaction ID is required' })
      };
    }

    // 既存のトランザクションを取得
    const getResult = await dynamodb.send(new GetCommand({
      TableName: TABLES.TRANSACTIONS,
      Key: { id: transactionId }
    }));

    if (!getResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Transaction not found' })
      };
    }

    // 所有者チェック
    if (getResult.Item.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Forbidden' })
      };
    }

    const body = JSON.parse(event.body || '{}');
    const validatedData = UpdateTransactionSchema.parse(body);

    // 更新式を構築
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpressions.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No fields to update' })
      };
    }

    // 更新日時を追加
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const updateCommand = new UpdateCommand({
      TableName: TABLES.TRANSACTIONS,
      Key: { id: transactionId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const result = await dynamodb.send(updateCommand);

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
    };
  } catch (error) {
    console.error('Error updating transaction:', error);
    
    return {
      statusCode: error.name === 'ZodError' ? 400 : 500,
      body: JSON.stringify({
        message: error.name === 'ZodError' ? 'Invalid input' : 'Internal server error',
        errors: error.name === 'ZodError' ? error.errors : undefined
      })
    };
  }
}; 