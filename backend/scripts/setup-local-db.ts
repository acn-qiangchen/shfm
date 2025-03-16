import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB({
  region: 'local',
  endpoint: 'http://localhost:8000',
});

const createTables = async () => {
  try {
    // Create Tags table
    await dynamodb
      .createTable({
        TableName: 'shfm-tags-local',
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
          { AttributeName: 'userId', AttributeType: 'S' },
        ],
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'byUser',
            KeySchema: [
              { AttributeName: 'userId', KeyType: 'HASH' },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      })
      .promise();

    console.log('Tags table created successfully');

    // Create Transactions table
    await dynamodb
      .createTable({
        TableName: 'shfm-transactions-local',
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'date', AttributeType: 'S' },
        ],
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        GlobalSecondaryIndexes: [
          {
            IndexName: 'byUserAndDate',
            KeySchema: [
              { AttributeName: 'userId', KeyType: 'HASH' },
              { AttributeName: 'date', KeyType: 'RANGE' },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      })
      .promise();

    console.log('Transactions table created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

createTables(); 