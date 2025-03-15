const { DynamoDB } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.claims.sub;
    const timestamp = new Date().toISOString();

    const item = {
      id: uuidv4(),
      userId,
      type: requestBody.type,
      amount: requestBody.amount,
      description: requestBody.description,
      date: requestBody.date,
      tagIds: requestBody.tagIds || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await dynamodb.put({
      TableName: process.env.TRANSACTIONS_TABLE,
      Item: item,
    }).promise();

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(item),
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