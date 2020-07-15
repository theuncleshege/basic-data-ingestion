import { mocked } from 'ts-jest/utils';
import eventBodyGenerator from '~/__tests__/helpers/eventBodyGenerator';
import { isApiGatewayResponse } from '~/__tests__/helpers/validators';
import SNSNotificationService from '~/services/NotificationService/SNS/SNSNotificationService';
import storeSensorData from '~/functions/data/store';
import getSensorData from '~/functions/data/get';
import storeThreshold from '~/functions/threshold/store';

jest.mock('~/services/NotificationService/SNS/SNSNotificationService');

const mockedSNSNotificationService = mocked(SNSNotificationService, true);

beforeAll(() => {
  jest.setTimeout(15000);
});

describe('Lambda tests', () => {
  describe('Save packet data', () => {
    it('should return 400 when request body is invalid', async () => {
      const event = eventBodyGenerator({
        body: {
          sensorId: '',
          time: '',
          value: '',
        },
      });

      const result = await storeSensorData(event);

      expect(result).toBeDefined();
      expect(isApiGatewayResponse(result)).toBe(true);
      expect(result).toMatchObject({ statusCode: 400 });
    });

    it('should accept a sensor value of zero', async () => {
      const event = eventBodyGenerator({
        body: {
          sensorId: 'device',
          time: 500,
          value: 0,
        },
      });

      const result = await storeSensorData(event);

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

      const result = await storeSensorData(event);

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

      await storeSensorData(event1);
      await storeSensorData(event2);

      const result = await getSensorData(getSensorDataEvent);

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

      const result = await getSensorData(getSensorDataEvent);

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
      const thresholdValue = 2.8;

      const event = eventBodyGenerator({
        body: {
          sensorId,
          threshold: thresholdValue,
        },
      });

      const result = await storeThreshold(event);

      expect(result).toBeDefined();
      expect(isApiGatewayResponse(result)).toBe(true);
      expect(result).toMatchObject({ statusCode: 204 });
    });

    it('should accept a threshold value of zero', async () => {
      const sensorId = 'testidse';
      const thresholdValue = 0;

      const event = eventBodyGenerator({
        body: {
          sensorId,
          threshold: thresholdValue,
        },
      });

      const result = await storeThreshold(event);

      expect(result).toBeDefined();
      expect(isApiGatewayResponse(result)).toBe(true);
      expect(result).toMatchObject({ statusCode: 204 });
    });

    it('should return 400 when threshold request is invalid', async () => {
      const sensorId = 'testidse';
      const thresholdValue = 'ththd';

      const event = eventBodyGenerator({
        body: {
          sensorId,
          threshold: thresholdValue,
        },
      });

      const result = await storeThreshold(event);

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
      const thresholdValue = 8.9;

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
          threshold: thresholdValue,
        },
      });

      await storeThreshold(thresholdEvent);
      await storeSensorData(sensorEvent);

      const body = `Threshold tripped for ${sensorId}. Limit is ${thresholdValue} but the value received was ${value}.`;
      const subject = `Threshold for ${sensorId} Tripped!!!`;

      const notifyMethod = mockedSNSNotificationService.prototype.notify;
      expect(notifyMethod).toHaveBeenCalledTimes(1);
      expect(notifyMethod).toHaveBeenCalledWith({ body, subject });
    });

    it('should send notification on threshold tripping for negative values', async () => {
      const sensorId = 'testsensorId2';
      const time = 594873842;
      const value = -15.2;
      const thresholdValue = -7.5;

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
          threshold: thresholdValue,
        },
      });

      await storeThreshold(thresholdEvent);
      await storeSensorData(sensorEvent);

      const body = `Threshold tripped for ${sensorId}. Limit is ${thresholdValue} but the value received was ${value}.`;
      const subject = `Threshold for ${sensorId} Tripped!!!`;

      const notifyMethod = mockedSNSNotificationService.prototype.notify;
      expect(notifyMethod).toHaveBeenCalledTimes(1);
      expect(notifyMethod).toHaveBeenCalledWith({ body, subject });
    });

    it('should not send notification on non-tripping values', async () => {
      const sensorId = 'testsensorId3';
      const time = 564564565;
      const value = 5.3;
      const thresholdValue = 8.9;

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
          threshold: thresholdValue,
        },
      });

      await storeThreshold(thresholdEvent);
      await storeSensorData(sensorEvent);

      const notifyMethod = mockedSNSNotificationService.prototype.notify;
      expect(notifyMethod).not.toHaveBeenCalled();
    });
  });
});
