export const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3001',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

export const createResponse = (statusCode: number, body: any) => {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}; 