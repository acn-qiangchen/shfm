const { DynamoDB } = require('aws-sdk');

const dynamodb = new DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.claims.sub;
    const { startDate, endDate } = event.queryStringParameters || {};

    const params = {
      TableName: process.env.TRANSACTIONS_TABLE,
      IndexName: 'byUserAndDate',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    if (startDate && endDate) {
      params.KeyConditionExpression += ' AND #date BETWEEN :startDate AND :endDate';
      params.ExpressionAttributeValues[':startDate'] = startDate;
      params.ExpressionAttributeValues[':endDate'] = endDate;
      params.ExpressionAttributeNames = {
        '#date': 'date',
      };
    }

    const result = await dynamodb.query(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}; 