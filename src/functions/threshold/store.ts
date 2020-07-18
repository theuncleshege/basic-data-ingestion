import DBConnection from '~/connections/DBConnection';
import { response, parseAndValidateRequest } from '~/common/helpers/helpers';
import DynamoDBConnection from '~/connections/DynamoDB/DynamoDBConnection';
import ErrorHandler from '~/common/ErrorHandler/ErrorHandler';
import AWSErrorHandler from '~/common/ErrorHandler/AWS/AWSErrorHandler';
import ThresholdService from '~/services/Threshold/ThresholdService';

export const storeFunctionFactory = (
  dbConnection: DBConnection,
  errorHandler: ErrorHandler,
) => async (event: any): Promise<any> => {
  const validationMap = {
    sensorId: 'string',
    threshold: 'number',
  };

  try {
    const thresholdService = new ThresholdService(dbConnection);

    const { sensorId, threshold } = parseAndValidateRequest(
      event,
      validationMap,
    );
    await thresholdService.save({ sensorId, threshold });

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
