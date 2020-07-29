import PacketRepository from '@Repositories/Packet/PacketRepository';
import { mocked } from 'ts-jest/utils';
import PostgreSQLDBConnection from '@DBConnections/PostgreSQLDB/PostgreSQLDBConnection';

jest.mock('@DBConnections/PostgreSQLDB/PostgreSQLDBConnection');

const mockedPostgreSQLDBConnection = mocked(PostgreSQLDBConnection, true);

describe('PacketRepository Tests', () => {
  let packetRepository: PacketRepository;
  const tableName: string = process.env.PACKET_TABLE || '';

  beforeEach(() => {
    mockedPostgreSQLDBConnection.mockClear();
    mockedPostgreSQLDBConnection.prototype.create.mockClear();
    mockedPostgreSQLDBConnection.prototype.get.mockClear();
    mockedPostgreSQLDBConnection.prototype.query.mockClear();

    packetRepository = new PacketRepository(
      mockedPostgreSQLDBConnection.prototype,
    );
  });

  it('should use default table name when table environment variable is empty', async () => {
    const packetTable = process.env.PACKET_TABLE;
    process.env.PACKET_TABLE = '';

    const query = {
      sensorId: 'device-123456',
      since: 1594635566018,
      until: 1594635590163,
    };

    const packetRepositoryDefaultTableName = new PacketRepository(
      mockedPostgreSQLDBConnection.prototype,
    );

    await packetRepositoryDefaultTableName.get(query);

    const dbGetMethod = mockedPostgreSQLDBConnection.prototype.query;
    expect(dbGetMethod).toHaveBeenCalledTimes(1);
    expect(dbGetMethod).toHaveBeenCalledWith({ tableName: 'packet', ...query });

    process.env.PACKET_TABLE = packetTable;
  });

  it("should call the database connection's query method", async () => {
    const packetTable = process.env.PACKET_TABLE;
    process.env.PACKET_TABLE = 'packet';

    const query = {
      sensorId: 'device-123456',
      since: 1594635566018,
      until: 1594635590163,
    };

    await packetRepository.get(query);

    const dbGetMethod = mockedPostgreSQLDBConnection.prototype.query;
    expect(dbGetMethod).toHaveBeenCalledTimes(1);
    expect(dbGetMethod).toHaveBeenCalledWith({ tableName, ...query });

    process.env.PACKET_TABLE = packetTable;
  });

  it("should call the database connection's save method", async () => {
    const packetTable = process.env.PACKET_TABLE;
    process.env.PACKET_TABLE = 'packet';

    const data = {
      sensorId: 'device-123456',
      time: 1594635566018,
      value: 5.8,
    };

    await packetRepository.save(data);

    const dbSaveMethod = mockedPostgreSQLDBConnection.prototype.create;
    expect(dbSaveMethod).toHaveBeenCalledTimes(1);
    expect(dbSaveMethod).toHaveBeenCalledWith({ tableName, ...data });

    process.env.PACKET_TABLE = packetTable;
  });
});
