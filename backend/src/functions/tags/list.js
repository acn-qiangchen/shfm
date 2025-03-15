const { DynamoDB } = require('aws-sdk');

const dynamodb = new DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const userId = event.requestContext.authorizer.claims.sub;

    const result = await dynamodb.query({
      TableName: process.env.TAGS_TABLE,
      IndexName: 'byUser',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    }).promise();

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