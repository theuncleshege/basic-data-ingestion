import ThresholdRepository from '~/repositories/Threshold/ThresholdRepository';
import DBConnection from '~/connections/DBConnection';
import { ThresholdData, ThresholdQueryParams } from '~/types';

export default class ThresholdService {
  private thresholdRepository: ThresholdRepository;

  constructor(dbConnection: DBConnection) {
    this.thresholdRepository = new ThresholdRepository(dbConnection);
  }

  public async get(queryParams: ThresholdQueryParams) {
    return this.thresholdRepository.get(queryParams);
  }

  public async save(data: ThresholdData) {
    return this.thresholdRepository.save(data);
  }

  public isThresholdTripped(value: number, threshold: number): boolean {
    if (
      (threshold < 0 && value < threshold) ||
      (threshold > 0 && value > threshold)
    ) {
      return true;
    } else {
      return false;
    }
  }
}
