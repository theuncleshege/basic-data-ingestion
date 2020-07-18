import { ThresholdData, ThresholdQueryParams } from '~/types';
import Repository from '@Repositories/Repository';
import DBConnection from '@DBConnections/DBConnection';

export default class ThresholdRepository extends Repository {
  private dbConnection: DBConnection;

  constructor(dbConnection: DBConnection) {
    super();
    this.tableName = process.env.THRESHOLD_TABLE || 'threshold';
    this.dbConnection = dbConnection;
  }

  public async get(queryParams: ThresholdQueryParams) {
    return this.dbConnection.get({
      tableName: this.tableName,
      ...queryParams,
    });
  }

  public async save(data: ThresholdData) {
    return this.dbConnection.create({ tableName: this.tableName, ...data });
  }
}
