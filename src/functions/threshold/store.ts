import DBConnection from '@DBConnections/DBConnection';
import { response, parseAndValidateRequest } from '@Shared/helpers/helpers';
import DynamoDBConnection from '@DBConnections/DynamoDB/DynamoDBConnection';
import ErrorHandler from '@Shared/ErrorHandler/ErrorHandler';
import AWSErrorHandler from '@Shared/ErrorHandler/AWS/AWSErrorHandler';
import ThresholdService from '@Services/Threshold/ThresholdService';

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
