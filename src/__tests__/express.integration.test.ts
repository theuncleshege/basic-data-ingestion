import { mocked } from 'ts-jest/utils';
import request from 'supertest';

import app from '~/app';

import dbConnection from '@Tests/helpers/dbconnection';

import NodeNotificationService from '@Services/Notification/Node/NodeNotificationService';

jest.mock('@Services/Notification/Node/NodeNotificationService');

const mockedNodeNotificationService = mocked(NodeNotificationService, true);

beforeAll(async () => {
  await dbConnection.create();
  jest.setTimeout(15000);
});

afterAll(async () => {
  await dbConnection.close();
});

beforeEach(async () => {
  await dbConnection.emptyDBTables();
});

const PACKET_PATH = '/v1/data';
const THRESHOLD_PATH = '/v1/threshold';

describe('Express routes tests', () => {
  describe('Save packet data', () => {
    it('should return 400 when request body is invalid', async () => {
      const result = await request(app)
        .put(PACKET_PATH)
        .send({ sensorId: '', time: '', value: '' });

      expect(result).toBeDefined();
      expect(result).toMatchObject({ statusCode: 400 });
    });

    it('should store sensor data, even with value of zero', async () => {
      const packetTable = process.env.PACKET_TABLE;
      process.env.PACKET_TABLE = 'packet';

      const sensorId = 'testsensorId';
      const time = 300;
      const value = 0;

      const result = await request(app)
        .put(PACKET_PATH)
        .send({ sensorId, time, value });

      expect(result).toBeDefined();
      expect(result).toMatchObject({ statusCode: 204 });

      process.env.PACKET_TABLE = packetTable;
    });

    it('should return 204 when packet successfully saved', async () => {
      const packetTable = process.env.PACKET_TABLE;
      process.env.PACKET_TABLE = 'packet';

      const sensorId = 'testsensorId';
      const time = 30000054323;
      const value = 4.5;

      const result = await request(app)
        .put(PACKET_PATH)
        .send({ sensorId, time, value });

      expect(result).toBeDefined();
      expect(result).toMatchObject({ statusCode: 204 });

      process.env.PACKET_TABLE = packetTable;
    });
  });

  describe('Get packet data', () => {
    it('should get packet data with since and until constraints', async () => {
      const sensorId = 'testsensorId';
      const time = 300;
      const value = 4.5;

      await request(app).put(PACKET_PATH).send({ sensorId, time, value });

      await request(app)
        .put(PACKET_PATH)
        .send({ sensorId, time: 700, value: 2.3 });

      const result = await request(app).get(
        `${PACKET_PATH}/${sensorId}?since=100&until=600`,
      );

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        body: [
          {
            value: value.toString(),
            sensorId,
            time: time.toString(),
          },
        ],
      });
    });

    it('should return 400 if sensorId, since or until params are unset', async () => {
      const result = await request(app)
        .get(`${PACKET_PATH}/sensor-1343?since=0&until=700`)
        .set('Accept', 'application/json');

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        statusCode: 400,
        body: 'since is invalid',
      });
    });
  });

  describe('Save threshold data', () => {
    it('should return 204 when threshold successfully saved', async () => {
      const sensorId = 'testid';
      const threshold = 2.8;

      const result = await request(app)
        .post(THRESHOLD_PATH)
        .send({ sensorId, threshold });

      expect(result).toBeDefined();
      expect(result).toMatchObject({ statusCode: 204 });
    });

    it('should accept a threshold value of zero', async () => {
      const sensorId = 'testidse';
      const threshold = 0;

      const result = await request(app)
        .post(THRESHOLD_PATH)
        .send({ sensorId, threshold });

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        statusCode: 204,
      });
    });

    it('should return 400 when threshold request is invalid', async () => {
      const sensorId = 'testidse';
      const threshold = 'ththd';

      const result = await request(app)
        .post(THRESHOLD_PATH)
        .set('Accept', 'application/json')
        .send({ sensorId, threshold });

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        statusCode: 400,
        body: 'threshold is invalid',
      });
    });
  });

  describe('Threshold Notification Tests 2', () => {
    beforeEach(() => {
      mockedNodeNotificationService.mockClear();
      mockedNodeNotificationService.prototype.notify.mockClear();
    });
    it('should send notification on threshold tripping for positive values', async () => {
      const sensorId = 'testsensorId1';
      const time = 13423435435;
      const value = 10.5;
      const threshold = 8.9;

      await request(app).post(THRESHOLD_PATH).send({ sensorId, threshold });

      await request(app).put(PACKET_PATH).send({ sensorId, time, value });

      const body = `Threshold tripped for ${sensorId}. Limit is ${threshold} but the value received was ${value}.`;
      const subject = `Threshold for ${sensorId} Tripped!!!`;

      const notifyMethod = mockedNodeNotificationService.prototype.notify;
      expect(notifyMethod).toHaveBeenCalledTimes(1);
      expect(notifyMethod).toHaveBeenCalledWith({ body, subject });
    });

    it('should send notification on threshold tripping for negative values', async () => {
      const sensorId = 'testsensorId2';
      const time = 594873842;
      const value = -15.2;
      const threshold = -7.5;

      await request(app).post(THRESHOLD_PATH).send({ sensorId, threshold });

      await request(app).put(PACKET_PATH).send({ sensorId, time, value });

      const body = `Threshold tripped for ${sensorId}. Limit is ${threshold} but the value received was ${value}.`;
      const subject = `Threshold for ${sensorId} Tripped!!!`;

      const notifyMethod = mockedNodeNotificationService.prototype.notify;
      expect(notifyMethod).toHaveBeenCalledTimes(1);
      expect(notifyMethod).toHaveBeenCalledWith({ body, subject });
    });

    it('should not send notification on non-tripping values', async () => {
      const sensorId = 'testsensorId3';
      const time = 564564565;
      const value = 5.3;
      const threshold = 8.9;

      await request(app).post(THRESHOLD_PATH).send({ sensorId, threshold });

      await request(app).put(PACKET_PATH).send({ sensorId, time, value });

      const notifyMethod = mockedNodeNotificationService.prototype.notify;
      expect(notifyMethod).not.toHaveBeenCalled();
    });
  });
});
