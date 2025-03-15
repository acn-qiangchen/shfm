import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamodb, TABLES } from '../../lib/db';

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

    // トランザクションを削除
    await dynamodb.send(new DeleteCommand({
      TableName: TABLES.TRANSACTIONS,
      Key: { id: transactionId }
    }));

    return {
      statusCode: 204,
      body: ''
    };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error'
      })
    };
  }
}; 