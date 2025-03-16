import { DynamoDB } from 'aws-sdk';

// Debug log for environment variables (without sensitive information)
console.log('DynamoDB Client Config:', {
  IS_OFFLINE: process.env.IS_OFFLINE,
  AWS_REGION: process.env.AWS_REGION,
  DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT,
  TAGS_TABLE: process.env.TAGS_TABLE,
});

const isOffline = process.env.IS_OFFLINE === 'true';

// Always use dummy credentials in local environment
const credentials = isOffline ? {
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
} : undefined;

const config = isOffline ? {
  region: process.env.AWS_REGION || 'localhost',
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  credentials,
} : {};

// Debug log for DynamoDB config (without credentials)
console.log('Using DynamoDB config:', {
  region: config.region,
  endpoint: config.endpoint,
  credentials: isOffline ? { accessKeyId: credentials?.accessKeyId } : undefined,
});

const dynamodb = new DynamoDB.DocumentClient(config);

export const get = async (params: DynamoDB.DocumentClient.GetItemInput) => {
  return dynamodb.get(params).promise();
};

export const put = async (params: DynamoDB.DocumentClient.PutItemInput) => {
  return dynamodb.put(params).promise();
};

export const query = async (params: DynamoDB.DocumentClient.QueryInput) => {
  return dynamodb.query(params).promise();
};

export const update = async (params: DynamoDB.DocumentClient.UpdateItemInput) => {
  return dynamodb.update(params).promise();
};

export const del = async (params: DynamoDB.DocumentClient.DeleteItemInput) => {
  return dynamodb.delete(params).promise();
};

export const TABLES = {
  TRANSACTIONS: process.env.TRANSACTIONS_TABLE!,
  TAGS: process.env.TAGS_TABLE!,
}; 