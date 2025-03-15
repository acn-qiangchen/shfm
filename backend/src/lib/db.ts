import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const dynamodb = DynamoDBDocumentClient.from(client);

export const TABLES = {
  TRANSACTIONS: process.env.TRANSACTIONS_TABLE!,
  TAGS: process.env.TAGS_TABLE!,
} as const; 