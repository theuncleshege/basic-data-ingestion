import express from 'express';

import { parseAndValidateRequest, response } from '@Shared/helpers/helpers';
import ErrorHandler from '@Shared/ErrorHandler/ErrorHandler';
import AWSErrorHandler from '@Shared/ErrorHandler/AWS/AWSErrorHandler';
import ExpressErrorHandler from '@Shared/ErrorHandler/Express/ExpressErrorHandler';

import NotificationService from '@Services/Notification/NotificationService';
import NodeNotificationService from '@Services/Notification/Node/NodeNotificationService';
import SNSNotificationService from '@Services/Notification/SNS/SNSNotificationService';
import PacketService from '@Services/Packet/PacketService';

import DBConnection from '@DBConnections/DBConnection';
import DynamoDBConnection from '@DBConnections/DynamoDB/DynamoDBConnection';
import PostgreSQLDBConnection from '@DBConnections/PostgreSQLDB/PostgreSQLDBConnection';

const store = async (
  eventParams: any,
  dbConnection: DBConnection,
  notificationService: NotificationService,
) => {
  const validationMap = {
    sensorId: 'string',
    time: 'number',
    value: 'number',
  };

  const { sensorId, time, value } = parseAndValidateRequest(
    eventParams,
    validationMap,
  );

  const packetService = new PacketService(dbConnection);

  await packetService.save({ sensorId, time, value });

  return await packetService.notifyIfThresholdIsTripped(
    notificationService,
    sensorId,
    value,
  );
};

const storeWithServerless = (
  dbConnection: DBConnection,
  errorHandler: ErrorHandler,
  notificationService: NotificationService,
) => async (event: any): Promise<any> => {
  try {
    await store(event, dbConnection, notificationService);

    return response(204);
  } catch (e) {
    return errorHandler.handle(e, event);
  }
};

export const storePacketWithServerless = storeWithServerless(
  new DynamoDBConnection(),
  new AWSErrorHandler(),
  new SNSNotificationService(),
);

const storeWithExpress = (
  dbConnection: DBConnection,
  errorHandler: ErrorHandler,
  notificationService: NotificationService,
) => async (
  request: express.Request,
  response: express.Response,
): Promise<any> => {
  const eventParams = {
    body: JSON.stringify(request.body),
  };

  try {
    await store(eventParams, dbConnection, notificationService);

    return response.status(204).send();
  } catch (e) {
    const error = errorHandler.handle(e, eventParams);
    return response.status(error.statusCode).send(error.body);
  }
};

export const storePacketWithExpress = storeWithExpress(
  new PostgreSQLDBConnection(),
  new ExpressErrorHandler(),
  new NodeNotificationService(),
);

export default store;
