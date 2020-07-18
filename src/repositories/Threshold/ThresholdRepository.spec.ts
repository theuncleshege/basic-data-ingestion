import ThresholdRepository from '~/repositories/Threshold/ThresholdRepository';
import { mocked } from 'ts-jest/utils';
import DynamoDBConnection from '~/connections/DynamoDB/DynamoDBConnection';

jest.mock('~/connections/DynamoDB/DynamoDBConnection');

const mockedDynamoDBConnection = mocked(DynamoDBConnection, true);

describe('ThresholdRepository Tests', () => {
  let thresholdRepository: ThresholdRepository;
  const tableName: string = process.env.THRESHOLD_TABLE || '';

  beforeEach(() => {
    mockedDynamoDBConnection.mockClear();
    mockedDynamoDBConnection.prototype.create.mockClear();
    mockedDynamoDBConnection.prototype.get.mockClear();
    mockedDynamoDBConnection.prototype.query.mockClear();

    thresholdRepository = new ThresholdRepository(
      mockedDynamoDBConnection.prototype,
    );
  });

  it('should use default table name when table environment variable is empty', async () => {
    const thresholdTable = process.env.THRESHOLD_TABLE;
    process.env.THRESHOLD_TABLE = '';

    const query = {
      sensorId: 'device-123456',
    };

    const thresholdRepositoryDefaultTableName = new ThresholdRepository(
      mockedDynamoDBConnection.prototype,
    );

    await thresholdRepositoryDefaultTableName.get(query);

    const dbGetMethod = mockedDynamoDBConnection.prototype.get;
    expect(dbGetMethod).toHaveBeenCalledTimes(1);
    expect(dbGetMethod).toHaveBeenCalledWith({
      tableName: 'threshold',
      ...query,
    });

    process.env.THRESHOLD_TABLE = thresholdTable;
  });

  it("should call the database connection's get method", async () => {
    const query = {
      sensorId: 'device-123456',
    };

    await thresholdRepository.get(query);

    const dbGetMethod = mockedDynamoDBConnection.prototype.get;
    expect(dbGetMethod).toHaveBeenCalledTimes(1);
    expect(dbGetMethod).toHaveBeenCalledWith({ tableName, ...query });
  });

  it("should call the database connection's save method", async () => {
    const data = {
      sensorId: 'device-123456',
      threshold: 5.8,
    };

    await thresholdRepository.save(data);

    const dbSaveMethod = mockedDynamoDBConnection.prototype.create;
    expect(dbSaveMethod).toHaveBeenCalledTimes(1);
    expect(dbSaveMethod).toHaveBeenCalledWith({ tableName, ...data });
  });
});
