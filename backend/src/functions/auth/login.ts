import { APIGatewayProxyHandler } from 'aws-lambda';
import { sign } from 'jsonwebtoken';

const SECRET_KEY = 'local-development-secret';

export const handler: APIGatewayProxyHandler = async (event) => {
  // CORS header
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };

  // Debug logs
  console.log('***Event:', JSON.stringify(event, null, 2));

  // OPTIONSリクエスト（プリフライトリクエスト）への対応
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing request body' }),
      };
    }

    console.log('Request body:', event.body);
    const { username, password } = JSON.parse(event.body);
    console.log('Parsed credentials:', { username, password });

    // In local development, accept any non-empty username/password
    if (!username || !password) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }

    // Generate a mock JWT token
    const token = sign(
      {
        sub: 'test-user-id',
        username,
        email: `${username}@example.com`,
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    const response = {
      token,
      user: {
        id: 'test-user-id',
        username,
        email: `${username}@example.com`,
      },
    };
    console.log('Response:', response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error in local login:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error)
      }),
    };
  }
}; 