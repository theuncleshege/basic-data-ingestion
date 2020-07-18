import { PacketData, PacketQueryParams } from '~/types';
import DBConnection from '@DBConnections/DBConnection';
import Repository from '@Repositories/Repository';

export default class PacketRepository extends Repository {
  private dbConnection: DBConnection;

  constructor(dbConnection: DBConnection) {
    super();
    this.tableName = process.env.PACKET_TABLE || 'packet';
    this.dbConnection = dbConnection;
  }

  async get(queryParams: PacketQueryParams) {
    return this.dbConnection.query({
      tableName: this.tableName,
      ...queryParams,
    });
  }

  async save(data: PacketData) {
    return this.dbConnection.create({ tableName: this.tableName, ...data });
  }
}
