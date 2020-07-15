import { ThresholdData, ThresholdQueryParams } from '~/types';
import Repository from '~/repositories/Repository';
import DBConnection from '~/connections/DBConnection';

export default class ThresholdRepository extends Repository {
  private dbConnection: DBConnection;

  constructor(dbConnection: DBConnection) {
    super();
    this.tableName = process.env.THRESHOLD_TABLE || 'threshold';
    this.dbConnection = dbConnection;
  }

  async getThreshold(queryParams: ThresholdQueryParams) {
    return this.dbConnection.get({
      tableName: this.tableName,
      ...queryParams,
    });
  }

  async saveThreshold(data: ThresholdData) {
    return this.dbConnection.create({ tableName: this.tableName, ...data });
  }
}
