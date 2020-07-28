import { mocked } from 'ts-jest/utils';

import PacketService from '@Services/Packet/PacketService';
import SNSNotificationService from '@Services/Notification/SNS/SNSNotificationService';
import ThresholdService from '@Services/Threshold/ThresholdService';
import DynamoDBConnection from '@DBConnections/DynamoDB/DynamoDBConnection';
import PacketRepository from '@Repositories/Packet/PacketRepository';

jest.mock('@Services/Notification/SNS/SNSNotificationService');
jest.mock('@Services/Threshold/ThresholdService');
jest.mock('@DBConnections/DynamoDB/DynamoDBConnection');
jest.mock('@Repositories/Packet/PacketRepository');

const mockedSNSNotificationService = mocked(SNSNotificationService, true);
const mockedThresholdService = mocked(ThresholdService, true);
const mockedDynamoDBConnection = mocked(DynamoDBConnection, true);
const mockedPacketRepository = mocked(PacketRepository, true);

describe('PacketService Tests', () => {
  let packetService: PacketService;

  beforeEach(() => {
    mockedSNSNotificationService.mockClear();
    mockedSNSNotificationService.prototype.notify.mockClear();

    mockedThresholdService.mockClear();
    mockedThresholdService.prototype.get.mockClear();
    mockedThresholdService.prototype.isThresholdTripped.mockClear();

    mockedDynamoDBConnection.mockClear();
    mockedDynamoDBConnection.prototype.create.mockClear();
    mockedDynamoDBConnection.prototype.get.mockClear();
    mockedDynamoDBConnection.prototype.query.mockClear();

    mockedPacketRepository.mockClear();
    mockedPacketRepository.prototype.save.mockClear();
    mockedPacketRepository.prototype.get.mockClear();

    packetService = new PacketService(mockedDynamoDBConnection.prototype);
  });

  it("should call the repository's get method", async () => {
    const query = {
      sensorId: 'device-123456',
      since: 1594635566018,
      until: 1594635590163,
    };

    await packetService.get(query);

    const repositoryGetMethod = mockedPacketRepository.prototype.get;
    expect(repositoryGetMethod).toHaveBeenCalledTimes(1);
    expect(repositoryGetMethod).toHaveBeenCalledWith({ ...query });
  });

  it("should call the repository's save method", async () => {
    const data = {
      sensorId: 'device-123456',
      time: 1594635566018,
      value: 5.8,
    };

    await packetService.save(data);

    const notifierNotifyMethod = mockedPacketRepository.prototype.save;
    expect(notifierNotifyMethod).toHaveBeenCalledTimes(1);
    expect(notifierNotifyMethod).toHaveBeenCalledWith({ ...data });
  });

  it('should send notification if threshold is tripped', async () => {
    const sensorId = 'device-123456';
    const value = 5.8;

    const mockedThreshold = {
      Item: {
        threshold: 2.3,
      },
    };

    mockedThresholdService.prototype.get.mockResolvedValue(mockedThreshold);
    mockedThresholdService.prototype.isThresholdTripped.mockReturnValue(true);

    await packetService.notifyIfThresholdIsTripped(
      mockedSNSNotificationService.prototype,
      sensorId,
      value,
    );

    const body = `Threshold tripped for ${sensorId}. Limit is ${mockedThreshold.Item.threshold} but the value received was ${value}.`;
    const subject = `Threshold for ${sensorId} Tripped!!!`;

    const notifierNotifyMethod = mockedSNSNotificationService.prototype.notify;
    expect(notifierNotifyMethod).toHaveBeenCalledTimes(1);
    expect(notifierNotifyMethod).toHaveBeenCalledWith({ body, subject });
  });
});
