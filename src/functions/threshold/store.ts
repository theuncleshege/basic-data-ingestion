import express from 'express';
import DBConnection from '@DBConnections/DBConnection';
import { response, parseAndValidateRequest } from '@Shared/helpers/helpers';
import DynamoDBConnection from '@DBConnections/DynamoDB/DynamoDBConnection';
import ErrorHandler from '@Shared/ErrorHandler/ErrorHandler';
import AWSErrorHandler from '@Shared/ErrorHandler/AWS/AWSErrorHandler';
import ThresholdService from '@Services/Threshold/ThresholdService';
import PostgreSQLDBConnection from '~/databases/PostgreSQLDB/PostgreSQLDBConnection';
import ExpressErrorHandler from '~/shared/ErrorHandler/Express/ExpressErrorHandler';

const store = async (eventParams: any, dbConnection: DBConnection) => {
  const validationMap = {
    sensorId: 'string',
    threshold: 'number',
  };

  const { sensorId, threshold } = parseAndValidateRequest(
    eventParams,
    validationMap,
  );

  const thresholdService = new ThresholdService(dbConnection);

  return thresholdService.save({ sensorId, threshold });
};

export const storeWithServerless = (
  dbConnection: DBConnection,
  errorHandler: ErrorHandler,
) => async (event: any): Promise<any> => {
  try {
    await store(event, dbConnection);

    return response(204);
  } catch (e) {
    return errorHandler.handle(e, event);
  }
};

export const storeThresholdWithServerless = storeWithServerless(
  new DynamoDBConnection(),
  new AWSErrorHandler(),
);

export const storeWithExpress = (
  dbConnection: DBConnection,
  errorHandler: ErrorHandler,
) => async (
  request: express.Request,
  response: express.Response,
): Promise<any> => {
  const eventBody = {
    body: JSON.stringify(request.body),
  };

  try {
    await store(eventBody, dbConnection);

    return response.status(204).send();
  } catch (e) {
    const error = errorHandler.handle(e, eventBody);
    return response.status(error.statusCode).json(error.body);
  }
};

export const storeThresholdWithExpress = storeWithExpress(
  new PostgreSQLDBConnection(),
  new ExpressErrorHandler(),
);

export default store;
