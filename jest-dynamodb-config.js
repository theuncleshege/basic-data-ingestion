module.exports = {
  tables: [
    {
      TableName: 'Packet_Test',
      KeySchema: [
        { AttributeName: 'sensorId', KeyType: 'HASH' },
        { AttributeName: 'time', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'sensorId', AttributeType: 'S' },
        { AttributeName: 'time', AttributeType: 'N' },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    },
    {
      TableName: 'Threshold_Test',
      KeySchema: [{ AttributeName: 'sensorId', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'sensorId', AttributeType: 'S' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    },
  ],
  port: 8000,
  installerConfig: {
    installPath: './.dynamodb',
  },
};
