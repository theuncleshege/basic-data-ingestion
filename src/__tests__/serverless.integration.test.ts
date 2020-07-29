import { mocked } from 'ts-jest/utils';
import eventBodyGenerator from '@Tests/helpers/eventBodyGenerator';
import { isApiGatewayResponse } from '@Tests/helpers/validators';
import SNSNotificationService from '@Services/Notification/SNS/SNSNotificationService';
import { storePacketWithServerless } from '@Functions/data/store';
import { getPacketWithServerless } from '@Functions/data/get';
import { storeThresholdWithServerless } from '@Functions/threshold/store';
import { DynamoDB } from 'aws-sdk';
import { getDbOptions } from '@DBConnections/DynamoDB/DynamoDBConnection';

jest.mock('@Services/Notification/SNS/SNSNotificationService');

const mockedSNSNotificationService = mocked(SNSNotificationService, true);

beforeAll(() => {
  jest.setTimeout(15000);
});

beforeEach(async () => {
  return await emptyDynamoDBTables();
});

const emptyDynamoDBTables = async () => {
  const dynamoDB = new DynamoDB(getDbOptions());
  const dynamoDBClient = new DynamoDB.DocumentClient(getDbOptions());
  const dbTables = [process.env.PACKET_TABLE, process.env.THRESHOLD_TABLE];

  for (const table of dbTables) {
    if (table) {
      await dynamoDB
        .scan({ TableName: table }, async (_, data) => {
          if (data && data.Items) {
            for (const item of data.Items) {
              let filters: { [name: string]: any } = {
                sensorId: item.sensorId.S,
              };

              if (table === process.env.PACKET_TABLE && item.time.N) {
                filters = { ...filters, time: parseInt(item.time.N) };
              }

              const params = {
                TableName: table,
                Key: filters,
              };

              await dynamoDBClient.delete(params).promise();
            }
          }
        })
        .promise();
    }
  }
};

describe('Serverless Functions tests', () => {
  describe('Save packet data', () => {
    it('should return 400 when request body is invalid', async () => {
      const event = eventBodyGenerator({
        body: {
          sensorId: '',
          time: '',
          value: '',
        },
      });

      const result = await storePacketWithServerless(event);

      expect(result).toBeDefined();
      expect(isApiGatewayResponse(result)).toBe(true);
      expect(result).toMatchObject({ statusCode: 400 });
    });

    it('should store sensor data, even with value of zero', async () => {
      const sensorId = 'testsensorId';
      const time = 300;
      const value = 0;

      const event = eventBodyGenerator({
        body: {
          sensorId,
          time,
          value,
        },
      });

      const result = await storePacketWithServerless(event);

      expect(result).toBeDefined();
      expect(isApiGatewayResponse(result)).toBe(true);
      expect(result).toMatchObject({ statusCode: 204 });
    });

    it('should return 204 when packet successfully saved', async () => {
      const sensorId = 'testsensorId';
      const time = 30000054323;
      const value = 4.5;

      const event = eventBodyGenerator({
        body: {
          sensorId,
          time,
          value,
        },
      });

      const result = await storePacketWithServerless(event);

      expect(result).toBeDefined();
      expect(isApiGatewayResponse(result)).toBe(true);
      expect(result).toMatchObject({ statusCode: 204 });
    });
  });

  describe('Get packet data', () => {
    it('should get packet data with since and until constraints', async () => {
      const sensorId = 'testsensorId';
      const time = 300;
      const value = 4.5;

      const event1 = eventBodyGenerator({
        body: {
          sensorId,
          time,
          value,
        },
      });

      const event2 = eventBodyGenerator({
        body: {
          sensorId,
          time: 500,
          value: 2.3,
        },
      });

      const getSensorDataEvent = eventBodyGenerator({
        body: null,
        pathParametersObject: { sensorId },
        queryStringObject: { since: 200, until: 400 },
      });

      await storePacketWithServerless(event1);
      await storePacketWithServerless(event2);

      const result = await getPacketWithServerless(getSensorDataEvent);

      expect(result).toBeDefined();
      expect(isApiGatewayResponse(result)).toBe(true);
      expect(result).toMatchObject({
        body: JSON.stringify([
          {
            value,
            sensorId,
            time,
          },
        ]),
      });
    });

    it('should return 400 if sensorId, since or until params are unset', async () => {
      const getSensorDataEvent = eventBodyGenerator({
        pathParametersObject: { sensorId: '' },
        queryStringObject: { since: 0, until: 400 },
      });

      const result = await getPacketWithServerless(getSensorDataEvent);

      expect(result).toBeDefined();
      expect(isApiGatewayResponse(result)).toBe(true);
      expect(result).toMatchObject({
        statusCode: 400,
        body: JSON.stringify('sensorId is invalid'),
      });
    });
  });

  describe('Save threshold data', () => {
    it('should return 204 when threshold successfully saved', async () => {
      const sensorId = 'testid';
      const threshold = 2.8;

      const event = eventBodyGenerator({
        body: {
          sensorId,
          threshold,
        },
      });

      const result = await storeThresholdWithServerless(event);

      expect(result).toBeDefined();
      expect(isApiGatewayResponse(result)).toBe(true);
      expect(result).toMatchObject({ statusCode: 204 });
    });

    it('should accept a threshold value of zero', async () => {
      const sensorId = 'testidse';
      const threshold = 0;

      const event = eventBodyGenerator({
        body: {
          sensorId,
          threshold,
        },
      });

      const result = await storeThresholdWithServerless(event);

      expect(result).toBeDefined();
      expect(isApiGatewayResponse(result)).toBe(true);
      expect(result).toMatchObject({ statusCode: 204 });
    });

    it('should return 400 when threshold request is invalid', async () => {
      const sensorId = 'testidse';
      const threshold = 'ththd';

      const event = eventBodyGenerator({
        body: {
          sensorId,
          threshold,
        },
      });

      const result = await storeThresholdWithServerless(event);

      expect(result).toBeDefined();
      expect(isApiGatewayResponse(result)).toBe(true);
      expect(result).toMatchObject({ statusCode: 400 });
    });
  });

  describe('Threshold Notification Tests', () => {
    beforeEach(() => {
      mockedSNSNotificationService.mockClear();
      mockedSNSNotificationService.prototype.notify.mockClear();
    });

    it('should send notification on threshold tripping for positive values', async () => {
      const sensorId = 'testsensorId1';
      const time = 13423435435;
      const value = 10.5;
      const threshold = 8.9;

      const sensorEvent = eventBodyGenerator({
        body: {
          sensorId,
          time,
          value,
        },
      });

      const thresholdEvent = eventBodyGenerator({
        body: {
          sensorId,
          threshold,
        },
      });

      await storeThresholdWithServerless(thresholdEvent);
      await storePacketWithServerless(sensorEvent);

      const body = `Threshold tripped for ${sensorId}. Limit is ${threshold} but the value received was ${value}.`;
      const subject = `Threshold for ${sensorId} Tripped!!!`;

      const notifyMethod = mockedSNSNotificationService.prototype.notify;
      expect(notifyMethod).toHaveBeenCalledTimes(1);
      expect(notifyMethod).toHaveBeenCalledWith({ body, subject });
    });

    it('should send notification on threshold tripping for negative values', async () => {
      const sensorId = 'testsensorId2';
      const time = 594873842;
      const value = -15.2;
      const threshold = -7.5;

      const sensorEvent = eventBodyGenerator({
        body: {
          sensorId,
          time,
          value,
        },
      });

      const thresholdEvent = eventBodyGenerator({
        body: {
          sensorId,
          threshold,
        },
      });

      await storeThresholdWithServerless(thresholdEvent);
      await storePacketWithServerless(sensorEvent);

      const body = `Threshold tripped for ${sensorId}. Limit is ${threshold} but the value received was ${value}.`;
      const subject = `Threshold for ${sensorId} Tripped!!!`;

      const notifyMethod = mockedSNSNotificationService.prototype.notify;
      expect(notifyMethod).toHaveBeenCalledTimes(1);
      expect(notifyMethod).toHaveBeenCalledWith({ body, subject });
    });

    it('should not send notification on non-tripping values', async () => {
      const sensorId = 'testsensorId3';
      const time = 564564565;
      const value = 5.3;
      const threshold = 8.9;

      const sensorEvent = eventBodyGenerator({
        body: {
          sensorId,
          time,
          value,
        },
      });

      const thresholdEvent = eventBodyGenerator({
        body: {
          sensorId,
          threshold,
        },
      });

      await storeThresholdWithServerless(thresholdEvent);
      await storePacketWithServerless(sensorEvent);

      const notifyMethod = mockedSNSNotificationService.prototype.notify;
      expect(notifyMethod).not.toHaveBeenCalled();
    });
  });
});
