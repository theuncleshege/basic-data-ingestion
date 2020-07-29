import { response, parseAndValidateRequest } from '@Shared/helpers/helpers';
import DynamoDBConnection from '@DBConnections/DynamoDB/DynamoDBConnection';
import ErrorHandler from '@Shared/ErrorHandler/ErrorHandler';
import AWSErrorHandler from '@Shared/ErrorHandler/AWS/AWSErrorHandler';
import ExpressErrorHandler from '@Shared/ErrorHandler/Express/ExpressErrorHandler';
import PacketService from '@Services/Packet/PacketService';
import DBConnection from '~/databases/DBConnection';
import express from 'express';
import PostgreSQLDBConnection from '~/databases/PostgreSQLDB/PostgreSQLDBConnection';

const get = async (eventParams: any, dbConnection: DBConnection) => {
  const validationMap = {
    sensorId: 'string',
    since: 'number',
    until: 'number',
  };

  const { sensorId, since, until } = parseAndValidateRequest(
    eventParams,
    validationMap,
  );

  const packetService = new PacketService(dbConnection);
  return await packetService.get({ sensorId, since, until });
};

export const getWithServerless = (
  dbConnection: DBConnection,
  errorHandler: ErrorHandler,
) => async (event: any): Promise<any> => {
  const eventParams = {
    sensorId: event.pathParameters.sensorId,
    since: parseInt(event.queryStringParameters.since),
    until: parseInt(event.queryStringParameters.until),
  };

  try {
    const result = await get(eventParams, dbConnection);
    return response(200, result.Items);
  } catch (e) {
    return errorHandler.handle(e, eventParams);
  }
};

export const getPacketWithServerless = getWithServerless(
  new DynamoDBConnection(),
  new AWSErrorHandler(),
);

export const getWithExpress = (
  dbConnection: DBConnection,
  errorHandler: ErrorHandler,
) => async (
  request: express.Request,
  response: express.Response,
): Promise<any> => {
  const eventParams = {
    sensorId: request.params.sensorId,
    since: parseInt(request.query.since as string),
    until: parseInt(request.query.until as string),
  };

  try {
    const result = await get(eventParams, dbConnection);
    response.status(200).send(result);
  } catch (e) {
    const error = errorHandler.handle(e, eventParams);
    response.status(error.statusCode).json(error.body);
  }
};

export const getPacketWithExpress = getWithExpress(
  new PostgreSQLDBConnection(),
  new ExpressErrorHandler(),
);
