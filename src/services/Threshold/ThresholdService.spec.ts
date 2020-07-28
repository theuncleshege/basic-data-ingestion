import { mocked } from 'ts-jest/utils';

import ThresholdService from '@Services/Threshold/ThresholdService';
import DynamoDBConnection from '@DBConnections/DynamoDB/DynamoDBConnection';
import ThresholdRepository from '@Repositories/Threshold/ThresholdRepository';

jest.mock('@DBConnections/DynamoDB/DynamoDBConnection');
jest.mock('@Repositories/Threshold/ThresholdRepository');

const mockedDynamoDBConnection = mocked(DynamoDBConnection, true);
const mockedThresholdRepository = mocked(ThresholdRepository, true);

describe('ThresholdService Tests', () => {
  let thresholdService: ThresholdService;

  beforeEach(() => {
    mockedDynamoDBConnection.mockClear();
    mockedDynamoDBConnection.prototype.create.mockClear();
    mockedDynamoDBConnection.prototype.get.mockClear();
    mockedDynamoDBConnection.prototype.query.mockClear();

    mockedThresholdRepository.mockClear();
    mockedThresholdRepository.prototype.save.mockClear();
    mockedThresholdRepository.prototype.get.mockClear();

    thresholdService = new ThresholdService(mockedDynamoDBConnection.prototype);
  });

  it("should call the repository's get method", async () => {
    const query = {
      sensorId: 'device-123456',
    };

    await thresholdService.get(query);

    const repositoryGetMethod = mockedThresholdRepository.prototype.get;
    expect(repositoryGetMethod).toHaveBeenCalledTimes(1);
    expect(repositoryGetMethod).toHaveBeenCalledWith({ ...query });
  });

  it("should call the repository's save method", async () => {
    const data = {
      sensorId: 'device-123456',
      threshold: 5.8,
    };

    await thresholdService.save(data);

    const notifierNotifyMethod = mockedThresholdRepository.prototype.save;
    expect(notifierNotifyMethod).toHaveBeenCalledTimes(1);
    expect(notifierNotifyMethod).toHaveBeenCalledWith({ ...data });
  });
});
