import { DynamoDB } from 'aws-sdk';

import DBConnection from '@DBConnections/DBConnection';

import {
  PacketQueryParams,
  PacketData,
  PacketModel,
  ThresholdModel,
  ThresholdQueryParams,
} from '~/types';

export const getDbOptions = (): { [name: string]: any } => {
  let options = {};
  if (process.env.IS_OFFLINE) {
    options = {
      endpoint: 'http://localhost:8000',
      region: 'localhost',
    };
  } else if (process.env.JEST_WORKER_ID) {
    options = {
      endpoint: 'localhost:8000',
      region: 'local-env',
      sslEnabled: false,
    };
  }

  return options;
};

export default class DynamoDBConnection implements DBConnection {
  private dynamodDBClient: DynamoDB.DocumentClient;

  public constructor(dynamodDBClient?: DynamoDB.DocumentClient) {
    this.dynamodDBClient =
      dynamodDBClient || new DynamoDB.DocumentClient(getDbOptions());
  }

  public async get(
    attributes: ThresholdModel<ThresholdQueryParams>,
  ): Promise<any> {
    const packetInfo = {
      TableName: attributes.tableName,
      Key: {
        sensorId: attributes.sensorId,
      },
    };

    return await this.dynamodDBClient.get(packetInfo).promise();
  }

  public async query(attributes: PacketModel<PacketQueryParams>): Promise<any> {
    const packetInfo = {
      TableName: attributes.tableName,
      KeyConditionExpression:
        'sensorId = :sensorId and #T BETWEEN :since AND :until',
      ExpressionAttributeValues: {
        ':sensorId': attributes.sensorId,
        ':since': attributes.since,
        ':until': attributes.until,
      },
      ExpressionAttributeNames: {
        '#T': 'time',
      },
    };

    return await this.dynamodDBClient.query(packetInfo).promise();
  }

  public async create(model: PacketModel<PacketData>): Promise<any> {
    const { tableName, ...packetData } = model;

    const packetInfo = {
      TableName: tableName,
      Item: packetData,
      ConditionExpression: 'attribute_not_exists(sensorId)',
    };

    return await this.dynamodDBClient.put(packetInfo).promise();
  }
}
