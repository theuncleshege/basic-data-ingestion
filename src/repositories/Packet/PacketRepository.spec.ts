import PacketRepository from '~/repositories/Packet/PacketRepository';
import { mocked } from 'ts-jest/utils';
import DynamoDBConnection from '~/connections/DynamoDB/DynamoDBConnection';

jest.mock('~/connections/DynamoDB/DynamoDBConnection');

const mockedDynamoDBConnection = mocked(DynamoDBConnection, true);

describe('PacketRepository Tests', () => {
  let packetRepository: PacketRepository;
  const tableName: string = process.env.PACKET_TABLE || '';

  beforeEach(() => {
    mockedDynamoDBConnection.mockClear();
    mockedDynamoDBConnection.prototype.create.mockClear();
    mockedDynamoDBConnection.prototype.get.mockClear();
    mockedDynamoDBConnection.prototype.query.mockClear();

    packetRepository = new PacketRepository(mockedDynamoDBConnection.prototype);
  });

  it('should use default table name when table environment variable is empty', async () => {
    const packetTable = process.env.PACKET_TABLE;
    process.env.PACKET_TABLE = '';

    const query = {
      sensorId: 'device-123456',
      since: 1594635566018,
      until: 1594635590163,
    };

    const packetRepositoryDefaultName = new PacketRepository(
      mockedDynamoDBConnection.prototype,
    );

    await packetRepositoryDefaultName.getPacket(query);

    const dbGetMethod = mockedDynamoDBConnection.prototype.query;
    expect(dbGetMethod).toHaveBeenCalledTimes(1);
    expect(dbGetMethod).toHaveBeenCalledWith({ tableName: 'packet', ...query });

    process.env.PACKET_TABLE = packetTable;
  });

  it("should call the database connection's query method", async () => {
    const query = {
      sensorId: 'device-123456',
      since: 1594635566018,
      until: 1594635590163,
    };

    await packetRepository.getPacket(query);

    const dbGetMethod = mockedDynamoDBConnection.prototype.query;
    expect(dbGetMethod).toHaveBeenCalledTimes(1);
    expect(dbGetMethod).toHaveBeenCalledWith({ tableName, ...query });
  });

  it("should call the database connection's save method", async () => {
    const data = {
      sensorId: 'device-123456',
      time: 1594635566018,
      value: 5.8,
    };

    await packetRepository.savePacket(data);

    const dbSaveMethod = mockedDynamoDBConnection.prototype.create;
    expect(dbSaveMethod).toHaveBeenCalledTimes(1);
    expect(dbSaveMethod).toHaveBeenCalledWith({ tableName, ...data });
  });
});
