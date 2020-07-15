import DBConnection from '~/connections/DBConnection';
import { response, parseAndValidateRequest } from '~/common/helpers/helpers';
import DynamoDBConnection from '~/connections/DynamoDB/DynamoDBConnection';
import ErrorHandler from '~/common/ErrorHandler/ErrorHandler';
import AWSErrorHandler from '~/common/ErrorHandler/AWS/AWSErrorHandler';
import ThresholdRepository from '~/repositories/Threshold/ThresholdRepository';

export const storeFunctionFactory = (
  dbConnection: DBConnection,
  errorHandler: ErrorHandler,
) => async (event: any): Promise<any> => {
  const validationMap = {
    sensorId: 'string',
    threshold: 'number',
  };

  try {
    const thresholdRepository = new ThresholdRepository(dbConnection);

    const { sensorId, threshold } = parseAndValidateRequest(
      event,
      validationMap,
    );
    await thresholdRepository.saveThreshold({ sensorId, threshold });

    return response(204);
  } catch (e) {
    return errorHandler.handle(e, event);
  }
};

export const store = storeFunctionFactory(
  new DynamoDBConnection(),
  new AWSErrorHandler(),
);

export default store;
